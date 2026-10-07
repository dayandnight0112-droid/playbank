/**
 * gameLauncherService.js
 * 
 * 统一开局流程服务 (Step 1)
 * 供大厅「启程」和结算页「继续下一局」共用。
 * 
 * 核心设计原则：
 * 1. 统一处理：年龄解析、体力判定、模式轮换、题目预检、原子扣除体力、游戏会话启动。
 * 2. 失败不扣体力：年龄未确认、题目加载失败、会话建立失败，都不扣减体力；若已扣除发生异常，立即原路补偿返还。
 * 3. 轮换原子推进：在成功进入游戏时推进游戏局数（第 1 局选择题 -> 第 2 局打字题 -> 轮换）。
 * 4. 幂等与防重入：同一时刻禁止并发调用 startNextGameRound。
 */

import { energyService } from './energyService.js';
import { quizService } from './quizService.js';
import { mockDb } from './mockDb.js';

let isStartingRound = false;

export const mapAgeToGrade = (age) => {
  const num = parseInt(age, 10) || 10;
  if (num <= 7) return { gradeId: 'year-1', gradeName: 'Year 1', form: 1 };
  if (num === 8) return { gradeId: 'year-2', gradeName: 'Year 2', form: 2 };
  if (num === 9) return { gradeId: 'year-3', gradeName: 'Year 3', form: 3 };
  if (num === 10) return { gradeId: 'year-4', gradeName: 'Year 4', form: 4 };
  if (num === 11) return { gradeId: 'year-5', gradeName: 'Year 5', form: 5 };
  if (num === 12) return { gradeId: 'year-6', gradeName: 'Year 6', form: 6 };
  if (num === 13) return { gradeId: 'form-1', gradeName: 'Form 1', form: 1 };
  if (num === 14) return { gradeId: 'form-2', gradeName: 'Form 2', form: 2 };
  if (num === 15) return { gradeId: 'form-3', gradeName: 'Form 3', form: 3 };
  if (num === 16) return { gradeId: 'form-4', gradeName: 'Form 4', form: 4 };
  return { gradeId: 'form-5', gradeName: 'Form 5', form: 5 };
};

export const gameLauncherService = {
  /**
   * 检查是否正在开局中（防重复点击）
   */
  isStarting() {
    return isStartingRound;
  },

  /**
   * 检查玩家是否有足够体力开局
   * @param {string} playerId
   * @returns {{ hasEnergy: boolean, energy: number, maxEnergy: number }}
   */
  checkEnergy(playerId) {
    const id = playerId || 'guest';
    const energyState = energyService.getEnergyState(id);
    return {
      hasEnergy: energyState.energy > 0,
      energy: energyState.energy,
      maxEnergy: energyState.maxEnergy,
      energyState
    };
  },

  /**
   * 准备选择题题目与参数
   * @param {number} age
   * @returns {Promise<object>} quizParams
   */
  async prepareQuizParams(age) {
    const validAge = parseInt(age, 10) || 10;
    const gradeInfo = mapAgeToGrade(validAge);

    let selectedChapter = null;
    try {
      const pubChapters = await quizService.getPublishedChapters(gradeInfo.gradeId, 'english');
      if (pubChapters && pubChapters.length > 0) {
        selectedChapter = pubChapters[0];
      }
    } catch (err) {
      console.warn('[gameLauncherService] Published chapters fetch warning:', gradeInfo.gradeId, err);
    }

    return {
      gradeId: gradeInfo.gradeId,
      gradeName: gradeInfo.gradeName,
      form: gradeInfo.form,
      subject: 'english',
      subjectTitle: 'English',
      chapterId: selectedChapter?.id || '8bde7fd7-a4c0-485c-8328-5e08a6eb3db8',
      chapterTitle: selectedChapter?.title || 'Vocabulary & Grammar',
      babNumber: selectedChapter?.babNumber || 'Unit 1',
      versionNo: selectedChapter?.versionNo || 1,
      questionCount: 10,
      randomQuestions: true
    };
  },

  /**
   * 统一执行开局逻辑
   * 
   * 流程规范：
   * 1. 防连点检查 (isStartingRound)。
   * 2. 检查体力（不足则返回 NO_ENERGY，绝对不扣）。
   * 3. 准备本轮模式数据（单数局=选择题，双数局=打字题）。
   * 4. 成功准备完毕后，原子扣除 1 次体力。
   * 5. 若扣除成功，执行 onLaunch 回调切换界面并推进局数；
   *    若过程发生任何异常，自动调用 refundEnergy 补偿返还。
   * 
   * @param {object} options
   * @param {string} options.playerId
   * @param {number} options.age
   * @param {number} options.roundIndex
   * @param {function} options.onLaunchQuiz - callback({ quizParams, nextRound })
   * @param {function} options.onLaunchTyping - callback({ age, nextRound })
   * @param {function} options.onEnergyExhausted - callback()
   * @returns {Promise<{ success: boolean, reason?: string, error?: any }>}
   */
  async launchGame({
    playerId = 'guest',
    age = 10,
    roundIndex = 1,
    onLaunchQuiz,
    onLaunchTyping,
    onEnergyExhausted
  }) {
    if (isStartingRound) {
      console.warn('[gameLauncherService] Already launching a game, ignoring duplicate trigger.');
      return { success: false, reason: 'BUSY' };
    }

    // 1. 体力前置检查
    const energyCheck = this.checkEnergy(playerId);
    if (!energyCheck.hasEnergy) {
      if (typeof onEnergyExhausted === 'function') {
        onEnergyExhausted();
      }
      return { success: false, reason: 'NO_ENERGY' };
    }

    isStartingRound = true;
    let hasConsumedEnergy = false;

    try {
      const validAge = parseInt(age, 10) || 10;
      const currentRound = parseInt(roundIndex, 10) || 1;
      const isMultipleChoice = currentRound % 2 === 1;

      // 2. 准备模式参数（如获取发布章节等）
      let quizParams = null;
      if (isMultipleChoice) {
        quizParams = await this.prepareQuizParams(validAge);
      }

      // 3. 题目与会话参数就绪后，扣除 1 次体力
      const consumeRes = await energyService.consumeEnergy(playerId);
      if (!consumeRes.success) {
        if (consumeRes.reason === 'NO_ENERGY') {
          if (typeof onEnergyExhausted === 'function') {
            onEnergyExhausted();
          }
          return { success: false, reason: 'NO_ENERGY' };
        }
        throw new Error(consumeRes.message || '扣除体力失败');
      }
      hasConsumedEnergy = true;

      // 4. 局数推进（单双局轮换：第 1 局选择题 -> 第 2 局打字题 -> 轮换）
      const nextRound = currentRound + 1;
      mockDb.saveGameRoundIndex(nextRound);

      // 5. 调用对应视图渲染回调
      if (isMultipleChoice) {
        if (typeof onLaunchQuiz === 'function') {
          await onLaunchQuiz({ quizParams, round: currentRound, age: validAge });
        }
      } else {
        if (typeof onLaunchTyping === 'function') {
          await onLaunchTyping({ age: validAge, round: currentRound });
        }
      }

      return { success: true, mode: isMultipleChoice ? 'quiz' : 'typing', currentRound, nextRound };
    } catch (err) {
      console.error('[gameLauncherService] Failed to launch game:', err);
      // 容错补偿：如果已扣体力，立即原路返还
      if (hasConsumedEnergy) {
        energyService.refundEnergy(playerId, 1);
      }
      return { success: false, reason: 'ERROR', error: err };
    } finally {
      isStartingRound = false;
    }
  }
};
