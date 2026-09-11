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
   * Get current auth.uid()
   */
  getUserId() {
    return this._currentUser?.id || null;
  }

  /**
   * Check if current user is anonymous guest
   */
  isAnonymous() {
    return this._isAnonymous;
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
