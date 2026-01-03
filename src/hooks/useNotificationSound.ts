'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SOUND_ENABLED_KEY = 'foxswap_admin_sound_enabled';

export function useNotificationSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem(SOUND_ENABLED_KEY);
    if (saved !== null) {
      setSoundEnabled(saved === 'true');
    }
  }, []);

  // Initialize AudioContext on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
    
    // Initialize audio context on toggle (user interaction)
    if (newValue) {
      initAudioContext();
    }
  }, [soundEnabled, initAudioContext]);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = initAudioContext();
      
      // First beep
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      
      oscillator1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);
      
      oscillator1.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator1.type = 'sine';
      
      gainNode1.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode1.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
      gainNode1.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.3);
      
      // Second beep (higher pitch)
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(1100, audioContext.currentTime + 0.15);
      oscillator2.type = 'sine';
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.15);
      gainNode2.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.2);
      gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
      
      oscillator2.start(audioContext.currentTime + 0.15);
      oscillator2.stop(audioContext.currentTime + 0.4);
      
    } catch (e) {
      console.log('Audio playback failed:', e);
    }
  }, [soundEnabled, initAudioContext]);

  return { soundEnabled, toggleSound, playSound };
}
