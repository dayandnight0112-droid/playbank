/**
 * energyService.js
 * PlayBank 游玩次数（体力池）系统
 * 
 * 核心规则：
 * 1. 免费玩家上限 5 次，付费玩家上限 10 次。
 * 2. 离线/在线均按实际经过时间恢复，每 1 小时（3600000 毫秒）恢复 1 次。
 * 3. 恢复达到上限即停止。
 * 4. 不做每日刷新，非每日清零。
 * 5. 付费权益是扩大储存池容量（能连续玩更多局），恢复速度保持每小时 1 次。
 * 6. 付费开通瞬间保留当前计时进度，并额外补足 5 次（最高 10 次）。
 * 7. 防作弊：记录基准校验时间，防本地设备时钟回拨或跳跃篡改。
 */

export const FREE_MAX_ENERGY = 5;
export const PAID_MAX_ENERGY = 10;
export const RECOVERY_INTERVAL_MS = 60 * 60 * 1000; // 1 小时 (3,600,000 ms)

const ENERGY_STORAGE_PREFIX = 'playbank_energy_state_';
const TIME_CHECK_KEY = 'playbank_last_known_trusted_time';

class EnergyService {
  constructor() {
    this._serverTimeOffset = 0; // serverTime - localTime (ms)
    this._isTimeSynced = false;
    this._consumeLock = false;
    this._listeners = new Set();
    this._ticker = null;

    if (typeof window !== 'undefined') {
      this._initClockSync();
      this._startTicker();
    }
  }

  /**
   * 获取当前可信时间戳（经过服务器偏移校准与防回拨保护）
   */
  getTrustedNow() {
    let now = Date.now() + this._serverTimeOffset;
    if (typeof localStorage !== 'undefined') {
      try {
        const lastKnown = Number(localStorage.getItem(TIME_CHECK_KEY) || 0);
        // 如果检测到时钟回拨超过 60 秒，则以 lastKnown 为基准，防止调慢系统时间无限刷体力
        if (lastKnown > 0 && now < lastKnown - 60000) {
          console.warn('[energyService] Detected backward clock manipulation. Fallback to monotonic time.');
          now = lastKnown;
        } else if (now > lastKnown) {
          localStorage.setItem(TIME_CHECK_KEY, String(now));
        }
      } catch (e) {
        // ignore storage errors
      }
    }
    return now;
  }

  /**
   * 初始化/同步服务器时间
   */
  async _initClockSync() {
    try {
      const start = Date.now();
      // 使用 lightweight HEAD 请求同步真实服务器响应头 Date
      const res = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
      const serverDateStr = res.headers.get('date');
      if (serverDateStr) {
        const serverTime = new Date(serverDateStr).getTime();
        const latency = (Date.now() - start) / 2;
        this._serverTimeOffset = (serverTime + latency) - Date.now();
        this._isTimeSynced = true;
        console.log(`[energyService] Server time synced. Offset: ${this._serverTimeOffset}ms`);
      }
    } catch (err) {
      // 离线或开发环境失败时使用本地时钟
      this._isTimeSynced = false;
    }
  }

  /**
   * 获取存储 key
   */
  _getKey(playerId = 'guest') {
    return `${ENERGY_STORAGE_PREFIX}${playerId || 'guest'}`;
  }

  /**
   * 从 Storage 读取原始记录
   */
  _readRaw(playerId = 'guest') {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this._getKey(playerId));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[energyService] Failed to read energy state:', e);
      return null;
    }
  }

  /**
   * 保存记录到 Storage
   */
  _writeRaw(playerId, state) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this._getKey(playerId), JSON.stringify(state));
      this._notifyChange(playerId, state);
    } catch (e) {
      console.error('[energyService] Failed to save energy state:', e);
    }
  }

  /**
   * 格式化倒计时文本 (例如 45:12 或 00:00)
   */
  formatCountdown(seconds) {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /**
   * 核心计算：根据流逝时间自动计算恢复
   */
  _calculateCurrentState(rawState, now) {
    const isPaid = Boolean(rawState?.isPaid);
    const maxEnergy = isPaid ? PAID_MAX_ENERGY : FREE_MAX_ENERGY;

    // 初次初始化：满额
    if (!rawState) {
      return {
        energy: maxEnergy,
        maxEnergy,
        isPaid,
        lastUpdatedAt: now,
        nextRecoveryAt: null,
        secondsToNextRecovery: 0,
        formattedCountdown: '00:00',
        isFull: true
      };
    }

    let energy = typeof rawState.energy === 'number' ? rawState.energy : maxEnergy;
    let lastUpdatedAt = typeof rawState.lastUpdatedAt === 'number' ? rawState.lastUpdatedAt : now;

    // 容错处理
    if (energy > maxEnergy) energy = maxEnergy;
    if (energy < 0) energy = 0;

    // 如果已经满额，不需要恢复
    if (energy >= maxEnergy) {
      return {
        energy: maxEnergy,
        maxEnergy,
        isPaid,
        lastUpdatedAt: now,
        nextRecoveryAt: null,
        secondsToNextRecovery: 0,
        formattedCountdown: '00:00',
        isFull: true
      };
    }

    // 未满额，按小时流逝计算离线/在线恢复
    const elapsed = Math.max(0, now - lastUpdatedAt);
    const recoveredUnits = Math.floor(elapsed / RECOVERY_INTERVAL_MS);
    const remainderMs = elapsed % RECOVERY_INTERVAL_MS;

    if (recoveredUnits > 0) {
      energy = Math.min(maxEnergy, energy + recoveredUnits);
      if (energy >= maxEnergy) {
        lastUpdatedAt = now;
        return {
          energy: maxEnergy,
          maxEnergy,
          isPaid,
          lastUpdatedAt: now,
          nextRecoveryAt: null,
          secondsToNextRecovery: 0,
          formattedCountdown: '00:00',
          isFull: true
        };
      } else {
        // 对齐基准时间，确保剩余时间准确
        lastUpdatedAt = now - remainderMs;
      }
    }

    const nextRecoveryAt = lastUpdatedAt + RECOVERY_INTERVAL_MS;
    const diffMs = Math.max(0, nextRecoveryAt - now);
    const secondsToNextRecovery = Math.ceil(diffMs / 1000);

    return {
      energy,
      maxEnergy,
      isPaid,
      lastUpdatedAt,
      nextRecoveryAt,
      secondsToNextRecovery,
      formattedCountdown: this.formatCountdown(secondsToNextRecovery),
      isFull: false
    };
  }

  /**
   * 获取指定玩家的当前体力状态（计算并持久化恢复结果）
   */
  getEnergyState(playerId = 'guest') {
    const now = this.getTrustedNow();
    const raw = this._readRaw(playerId);
    const calculated = this._calculateCurrentState(raw, now);

    // 如果发生了实际恢复或初次创建，更新持久化
    if (!raw || calculated.energy !== raw.energy || calculated.lastUpdatedAt !== raw.lastUpdatedAt || calculated.isPaid !== raw.isPaid) {
      this._writeRaw(playerId, {
        energy: calculated.energy,
        isPaid: calculated.isPaid,
        lastUpdatedAt: calculated.lastUpdatedAt
      });
    }

    return calculated;
  }

  /**
   * 开始一局游戏：扣除 1 次体力
   * 包含防重复点击锁，返回扣除结果及倒计时
   */
  async consumeEnergy(playerId = 'guest') {
    if (this._consumeLock) {
      return { success: false, reason: 'CONCURRENT_REQUEST', message: '正在处理中，请勿频繁点击' };
    }

    this._consumeLock = true;
    try {
      const now = this.getTrustedNow();
      const raw = this._readRaw(playerId);
      const current = this._calculateCurrentState(raw, now);

      if (current.energy <= 0) {
        return {
          success: false,
          reason: 'NO_ENERGY',
          message: '游玩次数已用尽',
          remainingEnergy: 0,
          maxEnergy: current.maxEnergy,
          isPaid: current.isPaid,
          nextRecoveryAt: current.nextRecoveryAt,
          secondsToNextRecovery: current.secondsToNextRecovery,
          formattedCountdown: current.formattedCountdown
        };
      }

      // 扣除 1 次
      const newEnergy = current.energy - 1;
      let newLastUpdatedAt = current.lastUpdatedAt;

      // 如果之前是满额状态，扣除后进入非满额，以当前时间为新倒计时的起点
      if (current.isFull) {
        newLastUpdatedAt = now;
      }

      const updatedRaw = {
        energy: newEnergy,
        isPaid: current.isPaid,
        lastUpdatedAt: newLastUpdatedAt
      };

      this._writeRaw(playerId, updatedRaw);

      const updatedState = this._calculateCurrentState(updatedRaw, now);
      return {
        success: true,
        remainingEnergy: updatedState.energy,
        maxEnergy: updatedState.maxEnergy,
        isPaid: updatedState.isPaid,
        nextRecoveryAt: updatedState.nextRecoveryAt,
        secondsToNextRecovery: updatedState.secondsToNextRecovery,
        formattedCountdown: updatedState.formattedCountdown
      };
    } finally {
      this._consumeLock = false;
    }
  }

  /**
   * 开局异常中断/加载失败时的补偿返还（防误扣保护）
   */
  refundEnergy(playerId = 'guest', amount = 1) {
    const now = this.getTrustedNow();
    const raw = this._readRaw(playerId);
    const current = this._calculateCurrentState(raw, now);

    const newEnergy = Math.min(current.maxEnergy, current.energy + amount);
    const isNowFull = newEnergy >= current.maxEnergy;

    const updatedRaw = {
      energy: newEnergy,
      isPaid: current.isPaid,
      lastUpdatedAt: isNowFull ? now : current.lastUpdatedAt
    };

    this._writeRaw(playerId, updatedRaw);
    return this._calculateCurrentState(updatedRaw, now);
  }

  /**
   * 付费开通权益（永久 10 次上限 + 立即补足 5 次，最多 10 次）
   * 保留原有恢复计时进度
   */
  upgradeToPaid(playerId = 'guest') {
    const now = this.getTrustedNow();
    const raw = this._readRaw(playerId);
    const current = this._calculateCurrentState(raw, now);

    // 提升上限至 10，并额外补足 5 次
    const newEnergy = Math.min(PAID_MAX_ENERGY, current.energy + 5);
    const isNowFull = newEnergy >= PAID_MAX_ENERGY;

    const updatedRaw = {
      energy: newEnergy,
      isPaid: true,
      // 如果补满则重置基准时间；否则保留原有时长基准
      lastUpdatedAt: isNowFull ? now : current.lastUpdatedAt
    };

    this._writeRaw(playerId, updatedRaw);
    return this._calculateCurrentState(updatedRaw, now);
  }

  /**
   * 退款/降级处理
   */
  downgradeToFree(playerId = 'guest') {
    const now = this.getTrustedNow();
    const raw = this._readRaw(playerId);
    const current = this._calculateCurrentState(raw, now);

    const newEnergy = Math.min(FREE_MAX_ENERGY, current.energy);
    const isNowFull = newEnergy >= FREE_MAX_ENERGY;

    const updatedRaw = {
      energy: newEnergy,
      isPaid: false,
      lastUpdatedAt: isNowFull ? now : current.lastUpdatedAt
    };

    this._writeRaw(playerId, updatedRaw);
    return this._calculateCurrentState(updatedRaw, now);
  }

  /**
   * 事件监听与定时驱动
   */
  _notifyChange(playerId, rawState) {
    if (typeof window !== 'undefined') {
      const now = this.getTrustedNow();
      const state = this._calculateCurrentState(rawState, now);
      const event = new CustomEvent('playbank:energy-updated', {
        detail: { playerId, ...state }
      });
      window.dispatchEvent(event);
      this._listeners.forEach(cb => {
        try {
          cb({ playerId, ...state });
        } catch (e) {
          console.error('[energyService] Error in listener callback:', e);
        }
      });
    }
  }

  /**
   * 启动秒级心跳驱动倒计时更新
   */
  _startTicker() {
    if (this._ticker) return;
    this._ticker = setInterval(() => {
      if (this._listeners.size > 0 && typeof window !== 'undefined') {
        const event = new CustomEvent('playbank:energy-tick', {
          detail: { now: this.getTrustedNow() }
        });
        window.dispatchEvent(event);
      }
    }, 1000);
    if (this._ticker && typeof this._ticker.unref === 'function') {
      this._ticker.unref();
    }
  }

  stopTicker() {
    if (this._ticker) {
      clearInterval(this._ticker);
      this._ticker = null;
    }
  }

  /**
   * 外部订阅状态更新
   */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }
}

export const energyService = new EnergyService();
export default energyService;
