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
   * Sync Player Profile metadata (nickname, age_group, avatar) to public.profiles
   */
  async syncProfileMetadata({ nickname, age_group, avatar_id, avatar_type, avatar_url } = {}) {
    if (!isSupabaseConfigured || !supabase || !this._currentUser?.id) return;
    try {
      const updates = { last_active_at: new Date().toISOString() };
      if (nickname) updates.nickname = nickname;
      if (age_group) updates.age_group = age_group;
      if (avatar_id) updates.avatar_id = avatar_id;
      if (avatar_type) updates.avatar_type = avatar_type;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      await supabase.from('profiles').update(updates).eq('id', this._currentUser.id);
    } catch (err) {
      console.warn('[playerAuthService] syncProfileMetadata error:', err.message);
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
      if (metadata.avatar_id || user.user_metadata?.avatar_id) {
        profileUpdates.avatar_id = metadata.avatar_id || user.user_metadata?.avatar_id;
      }

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
