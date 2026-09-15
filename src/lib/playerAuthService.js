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
        this._session = session;
        this._currentUser = session.user;
        this._isAnonymous = Boolean(session.user.is_anonymous);
        this._initialized = true;
        console.log(`[playerAuthService] Restored existing session: ${session.user.id} (is_anonymous: ${this._isAnonymous})`);
        return {
          user: session.user,
          session,
          isAnonymous: this._isAnonymous
        };
      }

      // No session found: Do NOT call signInAnonymously(). Remain unauthenticated.
      this._session = null;
      this._currentUser = null;
      this._isAnonymous = false;
      this._initialized = true;
      return { user: null, session: null, isAnonymous: false };
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
   * Ensure Player Auth (Controlled Guest Creation).
   * Called ONLY when player confirms entering PlayBank (completing onboarding) or starting a game.
   * Features:
   * 1. Concurrency lock (In-flight promise mutex)
   * 2. Double-check getSession() inside lock
   * 3. Calls signInAnonymously() only if STILL no session
   * 4. Releases lock in finally block to allow retries on failure
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

        // Double check: inside lock, call getSession() to confirm if another tab or event just established a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session && session.user) {
          this._session = session;
          this._currentUser = session.user;
          this._isAnonymous = Boolean(session.user.is_anonymous);
          this._initialized = true;
          console.log(`[playerAuthService] ensurePlayerAuth: Reused existing session: ${session.user.id}`);
          return {
            user: session.user,
            session,
            isAnonymous: this._isAnonymous
          };
        }

        // STILL no session: create Anonymous Guest
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
        .select('id, player_code, nickname, age_group, source_channel, daily_goal_minutes, is_guest')
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
   * Sync Player Profile metadata (nickname, age_group, channel, goal) to public.profiles
   */
  async syncProfileMetadata({ nickname, age_group, source_channel, daily_goal_minutes } = {}) {
    const uid = this.getUserId();
    if (!isSupabaseConfigured || !supabase || !uid) return null;
    try {
      const updates = { last_active_at: new Date().toISOString() };
      if (nickname) updates.nickname = nickname.trim();
      if (age_group) {
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
        .select('id, player_code, nickname, age_group, source_channel, daily_goal_minutes, is_guest')
        .maybeSingle();
      if (error) {
        console.warn('[playerAuthService] syncProfileMetadata error:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[playerAuthService] syncProfileMetadata error:', err.message);
      return null;
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

      // Update user credentials in auth.users
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: {
          ...metadata,
          nickname: nickname || user.user_metadata?.nickname || 'Player',
          avatar_id: metadata.avatar_id || user.user_metadata?.avatar_id || 'tiger',
          avatar_type: metadata.avatar_type || user.user_metadata?.avatar_type || 'preset',
          avatar_url: metadata.avatar_url !== undefined ? metadata.avatar_url : (user.user_metadata?.avatar_url || null),
          is_guest: false
        }
      });

      if (error) {
        console.error('[playerAuthService] upgradeGuestToRegistered error:', error.message);
        return { success: false, error: error.message };
      }

      // Sync public.profiles to is_guest = false
      const profileUpdates = {
        is_guest: false,
        nickname: nickname || user.user_metadata?.nickname || 'Player',
        last_active_at: new Date().toISOString()
      };

      await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      this._currentUser = data.user;
      this._isAnonymous = false;

      return { success: true, user: data.user };
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
