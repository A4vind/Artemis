import { useEffect, useState, useSyncExternalStore } from 'react';
import { LOCALE } from '../i18n';
import type { Lang } from '../data/workers';

/* ---------- Read aloud (browser speech synthesis — no server, works offline) ---------- */

export type SpeakResult = 'ok' | 'unsupported' | 'no-voice';

function voiceFor(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const locale = LOCALE[lang].toLowerCase();
  const base = lang.toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase().replace('_', '-') === locale) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base))
  );
}

export function speak(text: string, lang: Lang, onEnd?: () => void): SpeakResult {
  if (!('speechSynthesis' in window)) return 'unsupported';
  const synth = window.speechSynthesis;
  synth.cancel();
  const voice = voiceFor(lang);
  // Some browsers load voices lazily; if the list is empty we still try with the locale tag.
  if (!voice && synth.getVoices().length > 0 && lang !== 'en') return 'no-voice';
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LOCALE[lang];
  if (voice) u.voice = voice;
  u.rate = 0.9;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
  return 'ok';
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

/** Tracks which item is being read aloud, so its button can show "Stop". */
export function useSpeaker() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  useEffect(() => () => stopSpeaking(), []);
  const toggle = (id: string, text: string, lang: Lang): SpeakResult => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return 'ok';
    }
    const result = speak(text, lang, () => setSpeakingId((cur) => (cur === id ? null : cur)));
    setSpeakingId(result === 'ok' ? id : null);
    return result;
  };
  return { speakingId, toggle };
}

/* ---------- Sharing ---------- */

/** Uses the phone's share sheet when available, otherwise copies to clipboard. */
export async function shareText(text: string, title?: string): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return 'shared';
    }
  } catch (e) {
    if ((e as DOMException)?.name === 'AbortError') return 'failed';
  }
  return copyText(text);
}

export async function copyText(text: string): Promise<'copied' | 'failed'> {
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

/* ---------- Connectivity ---------- */

function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

/* ---------- Photos ---------- */

/** Downscale a chosen photo to a small square JPEG so it fits in local storage. */
export function resizePhoto(file: File, size = 192): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('no canvas'));
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}
