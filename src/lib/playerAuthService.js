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
  }

  /**
   * Initialize Auth: Ensure an active session exists (anonymous or registered).
   * Safe for concurrent calls (memoized promise).
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

    this._initPromise = this._doInitAuth();
    return this._initPromise;
  }

  async _doInitAuth() {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('[playerAuthService] Supabase not configured. Using offline guest mode.');
      return { user: null, session: null, isAnonymous: true, offline: true };
    }

    try {
      // 1. Check existing persisted session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (session && session.user) {
        this._session = session;
        this._currentUser = session.user;
        this._isAnonymous = Boolean(session.user.is_anonymous);
        this._initialized = true;
        console.log(`[playerAuthService] Restored active session: ${session.user.id} (is_anonymous: ${this._isAnonymous})`);
        return {
          user: session.user,
          session,
          isAnonymous: this._isAnonymous
        };
      }

      // 2. No session exists: Attempt Anonymous Sign-In
      console.log('[playerAuthService] No session found. Signing in anonymously...');
      const { data, error: anonError } = await supabase.auth.signInAnonymously();

      if (anonError) {
        // If anonymous provider is disabled in dashboard, log informative error
        if (anonError.code === 'anonymous_provider_disabled' || anonError.status === 422) {
          console.warn('[playerAuthService] Supabase Anonymous Sign-In is disabled. Please enable it in Supabase Dashboard -> Authentication -> Providers -> Anonymous Sign-ins.');
        } else {
          console.error('[playerAuthService] signInAnonymously failed:', anonError.message);
        }
        return {
          user: null,
          session: null,
          isAnonymous: true,
          error: anonError.message,
          errorCode: anonError.code
        };
      }

      if (data && data.session && data.user) {
        this._session = data.session;
        this._currentUser = data.user;
        this._isAnonymous = Boolean(data.user.is_anonymous);
        this._initialized = true;
        console.log(`[playerAuthService] Created new anonymous session: ${data.user.id}`);
        return {
          user: data.user,
          session: data.session,
          isAnonymous: this._isAnonymous
        };
      }
    } catch (err) {
      console.error('[playerAuthService] Unexpected error during initAuth:', err);
    }

    return { user: null, session: null, isAnonymous: true };
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
   */
  async getAuthUserId() {
    await this.initAuth();
    return this._currentUser?.id || null;
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
          is_guest: false
        }
      });

      if (error) {
        console.error('[playerAuthService] upgradeGuestToRegistered error:', error.message);
        return { success: false, error: error.message };
      }

      // Sync public.profiles to is_guest = false
      await supabase
        .from('profiles')
        .update({
          is_guest: false,
          nickname: nickname || user.user_metadata?.nickname || 'Player',
          last_active_at: new Date().toISOString()
        })
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
