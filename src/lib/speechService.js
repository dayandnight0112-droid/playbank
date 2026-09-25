/**
 * speechService.js
 * Playbank English TTS (Text-to-Speech) Pronunciation Service
 * 
 * Leverages native Web Speech API (window.speechSynthesis)
 * - Zero external dependencies, zero latency, zero bandwidth cost
 * - Prefers natural English voices (en-US / en-GB)
 * - Auto rate tuning by age group
 * - Autoplay restriction unlocker for mobile browsers
 * - Silent error fallback ensuring gameplay is never blocked
 */

let preferredVoice = null;
let voicesLoaded = false;

function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    voicesLoaded = true;
    // Prefer natural English voices (en-US, en-GB, Google, Daniel, Samantha)
    preferredVoice =
      voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))) ||
      voices.find(v => v.lang === 'en-GB' && (v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Natural'))) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export const speechService = {
  /**
   * Check if speech synthesis is supported in current environment
   */
  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  },

  /**
   * Speak English text with configurable rate and voice
   * 
   * @param {string} text - English word, phrase, or sentence
   * @param {Object} options - { rate: 0.95, pitch: 1.0, onEnd: Function, onError: Function }
   */
  speak(text, { rate = 0.95, pitch = 1.0, onEnd = null, onError = null } = {}) {
    if (!this.isSupported() || !text) {
      if (onEnd) onEnd();
      return;
    }

    try {
      // Cancel previous speech to prevent backlog or delay
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = Math.max(0.6, Math.min(1.5, rate));
      utterance.pitch = Math.max(0.8, Math.min(1.2, pitch));

      if (!voicesLoaded) {
        loadVoices();
      }
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        if (typeof onEnd === 'function') onEnd();
      };

      utterance.onerror = (e) => {
        // 'interrupted' or 'canceled' are normal when user types fast or switches questions
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[speechService] Utterance error:', e.error);
        }
        if (typeof onError === 'function') onError(e);
        else if (typeof onEnd === 'function') onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[speechService] Speak exception:', err);
      if (typeof onEnd === 'function') onEnd();
    }
  },

  /**
   * Stop any current speech playback
   */
  stop() {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn('[speechService] Stop exception:', err);
    }
  },

  /**
   * Prime the speech synthesis engine on initial user gesture
   * (Solves iOS Safari / Chrome mobile autoplay restrictions)
   */
  unlockAudio() {
    if (!this.isSupported()) return;
    try {
      // Speak a brief silent utterance to unlock audio context in mobile browsers
      const silent = new SpeechSynthesisUtterance('');
      silent.volume = 0;
      window.speechSynthesis.speak(silent);
    } catch (e) {}
  }
};
