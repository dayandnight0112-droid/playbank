/**
 * playerAuthService.js
 * Unified Player Authentication Service (Step 2.1 & 2.2)
 * 
 * Rules:
 * - Both Guest and Registered players have a valid Supabase auth.uid().
 * - Guest uses supabase.auth.signInAnonymously().
 * - Registered players use regular login session.
 * - Anonymous session persists across Chrome reloads via localStorage.
 * - Only creates new anonymous user if NO session exists at all.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * Map exact integer age (7-17) to standard Admin Age Group filter ('7-9' | '10-12' | '13-15' | '16-17')
 */
export function mapExactAgeToAgeGroup(exactAge) {
  const age = Number(exactAge);
  if (!age || isNaN(age)) return '13-15';
  if (age <= 9) return '7-9';
  if (age <= 12) return '10-12';
  if (age <= 15) return '13-15';
  return '16-17';
}

class PlayerAuthService {
  constructor() {
    this._initialized = false;
    this._currentUser = null;
    this._session = null;
    this._isAnonymous = false;
    this._initPromise = null;
    this._authLockPromise = null; // Concurrency lock for guest creation
  }

  /**
   * Initialize / restore existing session (Read-Only).
   * Safe for page load, mount, hot reload, reconnect.
   * NEVER creates an anonymous guest.
   */
  async initAuth() {
    if (this._initialized && this._currentUser) {
      return {
        user: this._currentUser,
        session: this._session,
        isAnonymous: this._isAnonymous
      };
    }

    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = this._doRestoreSession();
    return this._initPromise;
  }

  async _doRestoreSession() {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, session: null, isAnonymous: false, offline: true };
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('[playerAuthService] Error reading session:', sessionError.message);
      }

      if (session && session.user) {
        // Step 1: Verify with Supabase Auth that this user actually still exists in auth.users
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.warn('[playerAuthService] Cached session user does not exist in auth.users (likely purged). Establishing fresh guest...', userError?.message);
          await supabase.auth.signOut().catch(() => {});
          this._session = null;
          this._currentUser = null;
          this._isAnonymous = false;
          return this.ensurePlayerAuth();
        }

        this._session = session;
        this._currentUser = userData.user;
        this._isAnonymous = Boolean(userData.user.is_anonymous);
        this._initialized = true;
        console.log(`[playerAuthService] Restored verified session: ${userData.user.id} (is_anonymous: ${this._isAnonymous})`);
        return {
          user: userData.user,
          session,
          isAnonymous: this._isAnonymous
        };
      }

      // No session found: automatically create anonymous guest session
      return this.ensurePlayerAuth();
    } catch (err) {
      console.error('[playerAuthService] Unexpected error during session restoration:', err);
      this._session = null;
      this._currentUser = null;
      this._isAnonymous = false;
      return { user: null, session: null, isAnonymous: false };
    } finally {
      this._initPromise = null;
    }
  }

  /**
   * Force refresh guest credentials if stale or deleted on server
   */
  async forceRefreshGuestAuth() {
    console.warn('[playerAuthService] Force refreshing guest auth credentials...');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    this._session = null;
    this._currentUser = null;
    this._isAnonymous = false;
    this._initialized = false;
    return this.ensurePlayerAuth();
  }

  /**
   * Ensure Player Auth (Controlled Guest Creation with Server Liveness Check).
   * Called ONLY when player confirms entering PlayBank or starting a game.
   */
  async ensurePlayerAuth() {
    // 1. Fast check if already authenticated in memory
    if (this._currentUser && this._session) {
      return {
        user: this._currentUser,
        session: this._session,
        isAnonymous: this._isAnonymous
      };
    }

    // 2. Concurrency lock: If a creation is already in flight, wait for it
    if (this._authLockPromise) {
      return this._authLockPromise;
    }

    this._authLockPromise = (async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          return { user: null, session: null, isAnonymous: true, offline: true };
        }

        // Double check: inside lock, call getSession() and verify with getUser()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session && session.user) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (!userError && userData?.user) {
            this._session = session;
            this._currentUser = userData.user;
            this._isAnonymous = Boolean(userData.user.is_anonymous);
            this._initialized = true;
            console.log(`[playerAuthService] ensurePlayerAuth: Reused verified session: ${userData.user.id}`);
            return {
              user: userData.user,
              session,
              isAnonymous: this._isAnonymous
            };
          }
          console.warn('[playerAuthService] ensurePlayerAuth: Stale session detected, purging...', userError?.message);
          await supabase.auth.signOut().catch(() => {});
        }

        // Create Anonymous Guest
        console.log('[playerAuthService] ensurePlayerAuth: Creating new anonymous guest session...');
        const { data, error: anonError } = await supabase.auth.signInAnonymously();

        if (anonError) {
          console.error('[playerAuthService] signInAnonymously failed:', anonError.message);
          throw anonError;
        }

        if (data && data.session && data.user) {
          this._session = data.session;
          this._currentUser = data.user;
          this._isAnonymous = Boolean(data.user.is_anonymous);
          this._initialized = true;
          console.log(`[playerAuthService] Created anonymous session: ${data.user.id}`);
          return {
            user: data.user,
            session: data.session,
            isAnonymous: this._isAnonymous
          };
        }

        throw new Error('Failed to obtain session from signInAnonymously');
      } finally {
        // ALWAYS release lock so subsequent attempts can retry if failed
        this._authLockPromise = null;
      }
    })();

    return this._authLockPromise;
  }

  /**
   * Direct Sign-In for Registered Players (Never touches signInAnonymously)
   */
  async signInWithPassword({ email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) throw error;
    if (data?.session && data?.user) {
      this._session = data.session;
      this._currentUser = data.user;
      this._isAnonymous = Boolean(data.user.is_anonymous);
      this._initialized = true;
    }
    return data;
  }

  /**
   * Fetch profile record from public.profiles
   */
  async getCloudProfile(userId) {
    const uid = userId || this.getUserId();
    if (!isSupabaseConfigured || !supabase || !uid) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, player_code, nickname, exact_age, age_group, source_channel, daily_goal_minutes, is_guest, account_status')
        .eq('id', uid)
        .maybeSingle();
      if (error) {
        console.warn('[playerAuthService] getCloudProfile error:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[playerAuthService] getCloudProfile exception:', err);
      return null;
    }
  }

  /**
   * Fetch wallet record from public.player_wallets
   * Strictly reads from server-authoritative balance_bp and lifetime_earned_bp
   */
  async getPlayerWallet(userId = null) {
    const uid = userId || this.getUserId() || await this.getAuthUserId();
    if (!isSupabaseConfigured || !supabase || !uid) {
      return { balance_bp: 0, lifetime_earned_bp: 0 };
    }
    try {
      const { data, error } = await supabase
        .from('player_wallets')
        .select('player_id, balance_bp, lifetime_earned_bp, updated_at')
        .eq('player_id', uid)
        .maybeSingle();

      if (error) {
        console.warn('[playerAuthService] getPlayerWallet error:', error.message);
        return { balance_bp: 0, lifetime_earned_bp: 0 };
      }
      return data || { balance_bp: 0, lifetime_earned_bp: 0 };
    } catch (err) {
      console.warn('[playerAuthService] getPlayerWallet exception:', err);
      return { balance_bp: 0, lifetime_earned_bp: 0 };
    }
  }

  /**
   * Sync Player Profile metadata (nickname, age_group, exact_age, channel, goal) to public.profiles
   */
  async syncProfileMetadata({ nickname, age_group, exact_age, source_channel, daily_goal_minutes } = {}) {
    const uid = this.getUserId();
    if (!isSupabaseConfigured || !supabase || !uid) return null;
    try {
      const updates = { last_active_at: new Date().toISOString() };
      if (nickname) updates.nickname = nickname.trim();
      if (exact_age !== undefined && exact_age !== null) {
        const parsed = parseInt(exact_age, 10);
        if (!isNaN(parsed) && parsed >= 5 && parsed <= 25) {
          updates.exact_age = parsed;
          if (!age_group) {
            updates.age_group = mapExactAgeToAgeGroup(parsed);
          }
        }
      }
      if (age_group && !updates.age_group) {
        updates.age_group = (typeof age_group === 'object' && age_group !== null ? age_group.id : age_group) || '13-15';
      }
      if (source_channel !== undefined) {
        updates.source_channel = typeof source_channel === 'object' && source_channel !== null ? source_channel.id : source_channel;
      }
      if (daily_goal_minutes !== undefined) {
        updates.daily_goal_minutes = Number(daily_goal_minutes) || 10;
      }
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', uid)
        .select('id, player_code, nickname, exact_age, age_group, source_channel, daily_goal_minutes, is_guest, account_status')
        .maybeSingle();
      if (error) {
        console.warn('[playerAuthService] syncProfileMetadata error:', error.message);
        if (error.message?.includes('ACCOUNT_ABANDONED') || error.message?.includes('abandoned_guest')) {
          await this.handleAccountAbandoned();
        }
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[playerAuthService] syncProfileMetadata error:', err);
      return null;
    }
  }

  /**
   * Step 10: Handle Account Abandoned Interception
   * When server blocks operations because this guest was marked as abandoned_guest:
   * 1. Purge Supabase auth session
   * 2. Clear local storage credentials and session keys
   * 3. Dispatch 'playbank:account-abandoned' event
   */
  async handleAccountAbandoned() {
    console.warn('[playerAuthService] Account has been abandoned on server. Purging local credentials...');
    const abandonedId = this.getUserId();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[playerAuthService] signOut error during purge:', e);
      }
    }

    this._session = null;
    this._currentUser = null;
    this._isAnonymous = false;
    this._initialized = false;
    this._initPromise = null;
    this._authLockPromise = null;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('playbank_session');
        window.localStorage.removeItem('playbank_user_profile');
        window.localStorage.removeItem('playbank_user_bp');
        if (abandonedId) {
          window.localStorage.removeItem(`playbank_answers_${abandonedId}`);
          window.localStorage.removeItem(`playbank_question_history_${abandonedId}`);
          window.localStorage.removeItem(`playbank_plays_today_${abandonedId}`);
          window.localStorage.removeItem(`playbank_last_play_date_${abandonedId}`);
        }
      } catch (_) {}

      window.dispatchEvent(new CustomEvent('playbank:account-abandoned', {
        detail: { abandonedId }
      }));
    }
  }

  /**
   * Get currently authenticated user object synchronously (or null)
   */
  getCurrentUser() {
    return this._currentUser;
  }

  /**
   * Get current auth.uid() (synchronous)
   */
  getUserId() {
    return this._currentUser?.id || null;
  }

  /**
   * Guaranteed async resolution of auth.uid()
   * Checks memory -> checks existing session -> if performing game action without session, ensures auth under concurrency lock.
   */
  async getAuthUserId() {
    if (this._currentUser?.id) {
      return this._currentUser.id;
    }
    const res = await this.ensurePlayerAuth();
    return res?.user?.id || null;
  }

  /**
   * Check if current user is anonymous guest
   */
  isAnonymous() {
    return this._isAnonymous;
  }

  /**
   * Step 4.4: Upgrade an Anonymous Guest to a Registered Account
   * Preserves identical auth.uid() so all foreign keys, BP, and history remain intact!
   */
  async upgradeGuestToRegistered({ email, password, nickname, metadata = {} }) {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
      await this.initAuth();
      const user = this._currentUser;
      if (!user) {
        throw new Error('No active player session found to upgrade');
      }

      const exactAge = metadata.exact_age ? parseInt(metadata.exact_age, 10) : null;
      const targetAgeGroup = metadata.age_group || (exactAge ? mapExactAgeToAgeGroup(exactAge) : null);
      const targetNickname = nickname || user.user_metadata?.nickname || 'Player';

      // Update user credentials in auth.users
      let authUser = null;
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: {
          ...metadata,
          nickname: targetNickname,
          exact_age: exactAge,
          age_group: targetAgeGroup,
          avatar_id: metadata.avatar_id || user.user_metadata?.avatar_id || 'tiger',
          avatar_type: metadata.avatar_type || user.user_metadata?.avatar_type || 'preset',
          avatar_url: metadata.avatar_url !== undefined ? metadata.avatar_url : (user.user_metadata?.avatar_url || null),
          is_guest: false
        }
      });

      if (error) {
        console.warn('[playerAuthService] upgradeGuestToRegistered auth notice:', error.message);
        const lower = String(error.message || '').toLowerCase();
        const isDuplicate = (
          lower.includes('already registered') ||
          lower.includes('already exists') ||
          lower.includes('email_exists') ||
          lower.includes('already in use') ||
          lower.includes('duplicate') ||
          lower.includes('user already registered')
        );
        if (isDuplicate) {
          return { success: false, error: error.message };
        }
        // For non-duplicate errors (e.g. SMTP email rate limits), continue to update public.profiles
      } else {
        authUser = data?.user;
      }

      // Sync public.profiles to is_guest = false with exact_age & age_group
      const profileUpdates = {
        is_guest: false,
        nickname: targetNickname,
        last_active_at: new Date().toISOString()
      };
      if (exactAge !== null) {
        profileUpdates.exact_age = exactAge;
      }
      if (targetAgeGroup) {
        profileUpdates.age_group = targetAgeGroup;
      }

      const { data: updatedProfile, error: profileErr } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)
        .select('id, player_code, nickname, exact_age, age_group, is_guest, account_status')
        .maybeSingle();

      if (profileErr) {
        console.error('[playerAuthService] upgradeGuestToRegistered profile update error:', profileErr.message);
        return { success: false, error: profileErr.message };
      }

      if (authUser) {
        this._currentUser = authUser;
        this._isAnonymous = false;
      } else if (this._currentUser) {
        this._currentUser = {
          ...this._currentUser,
          email: email,
          user_metadata: {
            ...this._currentUser.user_metadata,
            nickname: targetNickname,
            exact_age: exactAge,
            age_group: targetAgeGroup,
            is_guest: false
          }
        };
        this._isAnonymous = false;
      }

      return { success: true, user: this._currentUser, profile: updatedProfile };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Step 4: Create an account switch request ticket
   * Called when player confirms duplicate email login intent.
   * Guest account_status remains 'active'.
   */
  async createAccountSwitchRequest({ reason = 'duplicate_email_login' } = {}) {
    const guestUserId = await this.getAuthUserId();
    if (!guestUserId) {
      return { success: false, error: 'No active guest user session' };
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('account_switch_requests')
          .insert({
            guest_user_id: guestUserId,
            status: 'pending',
            reason,
            expires_at: expiresAt
          })
          .select()
          .single();

        if (error) {
          console.warn('[playerAuthService] createAccountSwitchRequest Supabase notice:', error.message);
        } else if (data) {
          try {
            sessionStorage.setItem('playbank_pending_switch_request', JSON.stringify(data));
          } catch (_) {}
          return { success: true, request: data };
        }
      } catch (err) {
        console.warn('[playerAuthService] createAccountSwitchRequest fallback:', err);
      }
    }

    // Local / offline fallback ticket
    const localTicket = {
      id: 'asr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      guest_user_id: guestUserId,
      target_user_id: null,
      status: 'pending',
      reason,
      created_at: new Date().toISOString(),
      completed_at: null,
      expires_at: expiresAt
    };

    try {
      sessionStorage.setItem('playbank_pending_switch_request', JSON.stringify(localTicket));
    } catch (_) {}

    return { success: true, request: localTicket };
  }

  /**
   * Step 5: Complete Account Switch via secure RPC
   * Called immediately after target account logs in with password (is_anonymous = false).
   */
  async completeAccountSwitch(requestId) {
    if (!requestId) {
      return { success: false, error: 'Request ID is required' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('complete_account_switch', {
          p_request_id: requestId
        });
        if (error) {
          console.warn('[playerAuthService] complete_account_switch RPC error:', error.message);
          return { success: false, error: error.message };
        }
        try {
          sessionStorage.removeItem('playbank_pending_switch_request');
        } catch (_) {}
        return { success: true, data };
      } catch (err) {
        console.warn('[playerAuthService] completeAccountSwitch exception:', err);
        return { success: false, error: err.message };
      }
    }

    // Local simulation fallback
    try {
      sessionStorage.removeItem('playbank_pending_switch_request');
    } catch (_) {}
    return { success: true, local: true };
  }

  /**
   * Step 5: Mark switch request as failed or cancelled
   * Guaranteed: Guest session & UUID remain untouched and active!
   */
  async failAccountSwitch(requestId, status = 'failed') {
    if (!requestId) return;
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.rpc('fail_account_switch', {
          p_request_id: requestId,
          p_status: status
        });
      } catch (e) {
        console.warn('[playerAuthService] failAccountSwitch notice:', e);
      }
    }
    try {
      sessionStorage.removeItem('playbank_pending_switch_request');
    } catch (_) {}
  }

  /**
   * Step 6: Cleanly switch player client session to the target registered account
   * - Wipes out all guest local storage and session markers
   * - Queries target user's profile and cloud stats from Supabase
   * - Sets target user session in mockDb and local storage
   * - Dispatches avatar change event so UI instantly synchronizes
   */
  async switchAccountSessionCleanly(targetUser) {
    if (!targetUser) return null;

    // 1. Wipe guest keys completely
    try {
      localStorage.removeItem('playbank_guest_profile');
      localStorage.removeItem('playbank_player_profile');
      localStorage.removeItem('playbank_user_bp');
      localStorage.removeItem('playbank_plays_today_guest');
      localStorage.removeItem('playbank_last_play_date_guest');
      sessionStorage.removeItem('guest_first_play_register');
      sessionStorage.removeItem('guest_200_register');
      sessionStorage.removeItem('playbank_pending_switch_request');
    } catch (_) {}

    // 2. Fetch fresh profile and stats from Supabase if online
    let cloudProfile = null;
    let cloudUserBP = 0;
    const targetUserId = targetUser.id;

    if (isSupabaseConfigured && supabase && targetUserId) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, player_code, nickname, exact_age, age_group, source_channel, daily_goal_minutes, is_guest, avatar_id, avatar_type, avatar_url')
          .eq('id', targetUserId)
          .maybeSingle();
        if (prof) cloudProfile = prof;

        // Fetch user stats (total BP) if available
        const { data: stats } = await supabase
          .from('player_stats')
          .select('total_bp, weekly_bp, score_multiplier')
          .eq('player_id', targetUserId)
          .maybeSingle();
        if (stats && typeof stats.total_bp === 'number') {
          cloudUserBP = stats.total_bp;
        }
      } catch (err) {
        console.warn('[playerAuthService] switchAccountSessionCleanly fetch error:', err);
      }
    }

    // 3. Construct unified session object for the target user
    const finalNickname = cloudProfile?.nickname || targetUser.nickname || targetUser.ic_name || targetUser.email?.split('@')[0] || 'Player';
    const finalAvatarType = cloudProfile?.avatar_type || targetUser.avatarType || 'preset';
    const finalAvatarId = cloudProfile?.avatar_id || targetUser.avatarId || 'default';
    const finalAvatarUrl = cloudProfile?.avatar_url || targetUser.avatarUrl || null;
    const finalBP = typeof cloudUserBP === 'number' && cloudUserBP > 0 ? cloudUserBP : (targetUser.total_bp || 0);
    const finalExactAge = cloudProfile?.exact_age || targetUser.exact_age || targetUser.age || null;
    const finalAgeGroup = cloudProfile?.age_group || targetUser.age_group || (finalExactAge ? mapExactAgeToAgeGroup(finalExactAge) : null);

    const sessionUser = {
      ...targetUser,
      id: targetUserId,
      email: targetUser.email || (cloudProfile?.email || ''),
      ic_name: finalNickname,
      nickname: finalNickname,
      player_code: cloudProfile?.player_code || targetUser.player_code,
      exact_age: finalExactAge,
      age: finalExactAge,
      age_group: finalAgeGroup,
      avatarType: finalAvatarType,
      avatarId: finalAvatarId,
      avatarUrl: finalAvatarUrl,
      total_bp: finalBP,
      is_guest: false,
      is_anonymous: false
    };

    // 4. Save to mockDb session and localStorage
    try {
      localStorage.setItem('playbank_session', JSON.stringify(sessionUser));
      // Store user's specific play date/attempt key
      const todayStr = new Date().toDateString();
      const existingUserPlays = localStorage.getItem(`playbank_plays_today_${targetUserId}`);
      if (!existingUserPlays) {
        localStorage.setItem(`playbank_plays_today_${targetUserId}`, '0');
        localStorage.setItem(`playbank_last_play_date_${targetUserId}`, todayStr);
      }
    } catch (_) {}

    // 5. Trigger avatar & session update events
    try {
      window.dispatchEvent(new CustomEvent('playbank:avatar-changed', {
        detail: {
          avatarType: finalAvatarType,
          avatarId: finalAvatarId,
          avatarUrl: finalAvatarUrl,
          isGuest: false,
          userId: targetUserId
        }
      }));
    } catch (_) {}

    return sessionUser;
  }

  /**
   * Safe purge of local BP caches
   * Strictly keeps nickname, avatar, selectedPath, tutorialComplete, and Supabase auth tokens intact!
   */
  purgeLocalBP() {
    try {
      localStorage.removeItem('playbank_user_bp');
      const guestRaw = localStorage.getItem('playbank_guest_profile');
      if (guestRaw) {
        const parsed = JSON.parse(guestRaw);
        if (parsed && typeof parsed === 'object') {
          delete parsed.bankPoint;
          delete parsed.effectiveBP;
          delete parsed.bp;
          localStorage.setItem('playbank_guest_profile', JSON.stringify(parsed));
        }
      }
      const sessionRaw = localStorage.getItem('playbank_session');
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (parsed && typeof parsed === 'object') {
          delete parsed.total_bp;
          delete parsed.bankPoint;
          localStorage.setItem('playbank_session', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.warn('[playerAuthService] purgeLocalBP notice:', e);
    }
  }

  /**
   * Authoritative Wallet API (Production Supabase)
   */
  async getMyWallet() {
    if (!isSupabaseConfigured || !supabase) {
      return { balance_bp: 0, lifetime_earned_bp: 0, lifetime_spent_bp: 0, has_booster: false, booster_multiplier: 1 };
    }
    try {
      const { data, error } = await supabase.rpc('get_my_wallet');
      if (error) {
        console.warn('[playerAuthService] get_my_wallet error:', error.message);
        return { balance_bp: 0, lifetime_earned_bp: 0, lifetime_spent_bp: 0, has_booster: false, booster_multiplier: 1, error: error.message };
      }
      const wallet = Array.isArray(data) ? (data[0] || {}) : (data || {});
      const result = {
        balance_bp: wallet.balance_bp ?? 0,
        lifetime_earned_bp: wallet.lifetime_earned_bp ?? 0,
        lifetime_spent_bp: wallet.lifetime_spent_bp ?? 0,
        has_booster: Boolean(wallet.has_booster),
        booster_multiplier: wallet.booster_multiplier ?? 1,
        booster_unlocked_at: wallet.booster_unlocked_at || null
      };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('playbank:wallet-updated', { detail: result }));
      }
      return result;
    } catch (err) {
      console.error('[playerAuthService] getMyWallet exception:', err);
      return { balance_bp: 0, lifetime_earned_bp: 0, lifetime_spent_bp: 0, has_booster: false, booster_multiplier: 1, error: err.message };
    }
  }

  async unlockBpBooster() {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { data, error } = await supabase.rpc('unlock_bp_booster');
      if (error) {
        console.error('[playerAuthService] unlock_bp_booster error:', error);
        return { error: error.message };
      }
      const res = Array.isArray(data) ? (data[0] || {}) : (data || {});
      if (typeof window !== 'undefined' && res.balance_bp !== undefined) {
        window.dispatchEvent(new CustomEvent('playbank:wallet-updated', {
          detail: {
            balance_bp: res.balance_bp,
            has_booster: Boolean(res.has_booster),
            booster_multiplier: res.booster_multiplier || 3
          }
        }));
      }
      return { success: true, ...res };
    } catch (err) {
      console.error('[playerAuthService] unlockBpBooster exception:', err);
      return { error: err.message };
    }
  }

  async claimDailyMission(missionKey) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { data, error } = await supabase.rpc('claim_daily_mission', {
        p_mission_key: missionKey
      });
      if (error) {
        console.warn('[playerAuthService] claim_daily_mission error:', error.message);
        return { error: error.message };
      }
      const res = Array.isArray(data) ? (data[0] || {}) : (data || {});
      if (typeof window !== 'undefined' && res.balance_bp !== undefined) {
        window.dispatchEvent(new CustomEvent('playbank:wallet-updated', {
          detail: {
            balance_bp: res.balance_bp,
            earned_bp: res.earned_bp,
            mission_key: res.mission_key
          }
        }));
      }
      return { success: true, ...res };
    } catch (err) {
      console.error('[playerAuthService] claimDailyMission exception:', err);
      return { error: err.message };
    }
  }

  async claimDailyStreak() {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { data, error } = await supabase.rpc('claim_daily_streak');
      if (error) {
        console.warn('[playerAuthService] claim_daily_streak error:', error.message);
        return { error: error.message };
      }
      const res = Array.isArray(data) ? (data[0] || {}) : (data || {});
      if (typeof window !== 'undefined' && res.balance_bp !== undefined) {
        window.dispatchEvent(new CustomEvent('playbank:wallet-updated', {
          detail: {
            balance_bp: res.balance_bp,
            earned_bp: res.earned_bp,
            streak_day: res.streak_day
          }
        }));
      }
      return { success: true, ...res };
    } catch (err) {
      console.error('[playerAuthService] claimDailyStreak exception:', err);
      return { error: err.message };
    }
  }

  async claimTutorialReward(totalBP = 190) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }
    try {
      await this.getAuthUserId();
      const { data, error } = await supabase.rpc('claim_tutorial_reward', {
        p_total_bp: totalBP
      });
      if (error) {
        console.warn('[playerAuthService] claim_tutorial_reward error:', error.message);
        return { error: error.message };
      }
      const res = Array.isArray(data) ? (data[0] || {}) : (data || {});
      if (typeof window !== 'undefined' && res.balance_bp !== undefined) {
        window.dispatchEvent(new CustomEvent('playbank:wallet-updated', {
          detail: {
            balance_bp: res.balance_bp,
            earned_bp: res.earned_bp,
            source: 'tutorial_reward'
          }
        }));
      }
      return { success: true, ...res };
    } catch (err) {
      console.error('[playerAuthService] claimTutorialReward exception:', err);
      return { error: err.message };
    }
  }

  async getGardenState() {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }
    try {
      const { data, error } = await supabase.rpc('get_garden_state');
      if (error) {
        console.warn('[playerAuthService] get_garden_state error:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('[playerAuthService] getGardenState exception:', err);
      return null;
    }
  }

  async waterGardenTree() {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { data, error } = await supabase.rpc('water_garden_tree');
      if (error) {
        console.warn('[playerAuthService] water_garden_tree error:', error.message);
        return { error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      console.error('[playerAuthService] waterGardenTree exception:', err);
      return { error: err.message };
    }
  }

  async claimGardenTreeReward(treeId) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { data, error } = await supabase.rpc('claim_garden_tree_reward', {
        p_tree_id: treeId
      });
      if (error) {
        console.warn('[playerAuthService] claim_garden_tree_reward error:', error.message);
        return { error: error.message };
      }
      const res = Array.isArray(data) ? (data[0] || {}) : (data || {});
      if (typeof window !== 'undefined' && res.balance_bp !== undefined) {
        window.dispatchEvent(new CustomEvent('playbank:wallet-updated', {
          detail: {
            balance_bp: res.balance_bp,
            earned_bp: res.earned_bp,
            tree_id: res.tree_id
          }
        }));
      }
      return { success: true, ...res };
    } catch (err) {
      console.error('[playerAuthService] claimGardenTreeReward exception:', err);
      return { error: err.message };
    }
  }

  async openLuckyChest() {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { data, error } = await supabase.rpc('open_lucky_chest');
      if (error) {
        console.warn('[playerAuthService] open_lucky_chest error:', error.message);
        return { error: error.message };
      }
      const res = Array.isArray(data) ? (data[0] || {}) : (data || {});
      if (res.error) {
        return { error: res.message || res.error, ...res };
      }
      if (typeof window !== 'undefined' && res.balance_bp !== undefined) {
        window.dispatchEvent(new CustomEvent('playbank:wallet-updated', {
          detail: {
            balance_bp: res.balance_bp,
            earned_bp: res.earned_bp,
            source: 'lucky_chest'
          }
        }));
      }
      return { success: true, ...res };
    } catch (err) {
      console.error('[playerAuthService] openLuckyChest exception:', err);
      return { error: err.message };
    }
  }

  async purchaseMarketplaceItem(productId, shippingDetails = {}) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase is not configured' };
    }
    try {
      const { data, error } = await supabase.rpc('purchase_marketplace_item', {
        p_product_id: productId,
        p_shipping_details: shippingDetails
      });
      if (error) {
        console.warn('[playerAuthService] purchase_marketplace_item error:', error.message);
        return { error: error.message };
      }
      const res = Array.isArray(data) ? (data[0] || {}) : (data || {});
      if (typeof window !== 'undefined' && res.balance_bp !== undefined) {
        window.dispatchEvent(new CustomEvent('playbank:wallet-updated', {
          detail: {
            balance_bp: res.balance_bp,
            spent_bp: res.price_bp,
            order_id: res.order_id
          }
        }));
      }
      return { success: true, ...res };
    } catch (err) {
      console.error('[playerAuthService] purchaseMarketplaceItem exception:', err);
      return { error: err.message };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    if (isSupabaseConfigured && supabase) {
      return supabase.auth.onAuthStateChange((event, session) => {
        this._session = session;
        this._currentUser = session?.user || null;
        this._isAnonymous = Boolean(session?.user?.is_anonymous);
        if (typeof callback === 'function') {
          callback(event, session);
        }
      });
    }
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
}

export const playerAuthService = new PlayerAuthService();
