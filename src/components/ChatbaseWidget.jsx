import { useEffect } from 'react';

const CHATBASE_SCRIPT_ID = '3tDJykuX2WVC4wMuRYeDf';

export default function ChatbaseWidget() {
  useEffect(() => {
    // Initialize chatbase queue
    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
      window.chatbase = (...args) => {
        if (!window.chatbase.q) window.chatbase.q = [];
        window.chatbase.q.push(args);
      };
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === 'q') return target.q;
          return (...args) => target(prop, ...args);
        },
      });
    }

    // Load the embed script if not already loaded
    if (!document.getElementById(CHATBASE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.src = 'https://www.chatbase.co/embed.min.js';
      script.id = CHATBASE_SCRIPT_ID;
      script.domain = 'www.chatbase.co';
      document.body.appendChild(script);
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}

/**
 * Identify a user to Chatbase after they complete the funnel.
 * Call this from Funnel.jsx after form submission.
 * 
 * For basic usage (no JWT), pass public attributes directly.
 * For JWT usage, fetch a signed token from your backend first.
 */
export function identifyChatbaseUser(userData) {
  if (window.chatbase) {
    window.chatbase('identify', {
      name: userData.first_name + ' ' + userData.last_name,
      email: userData.email,
      phone: userData.phone,
    });
  }
}

/**
 * Reset user identity (if needed, e.g., on session end)
 */
export function resetChatbaseUser() {
  if (window.chatbase) {
    window.chatbase('resetUser');
  }
}
