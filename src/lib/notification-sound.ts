'use client'

/**
 * A two-tone bell, synthesised rather than shipped as an audio file — it costs
 * no bytes, never 404s, and cannot be blocked by an ad filter.
 *
 * Browsers refuse to start audio until the user has interacted with the page,
 * so `unlockNotificationSound` is wired to the first gesture and the play call
 * fails silently when the context is still suspended.
 */
let audioContext: AudioContext | null = null

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioContext) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
    if (!Ctor) return null
    audioContext = new Ctor()
  }

  return audioContext
}

/** Call from a click or keypress so later notifications are allowed to sound. */
export function unlockNotificationSound(): void {
  const context = getContext()
  if (context?.state === 'suspended') void context.resume()
}

function strike(context: AudioContext, frequency: number, startAt: number, gain: number): void {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startAt)

  // Percussive envelope: near-instant attack, exponential decay — the shape
  // that reads as a bell rather than a beep.
  envelope.gain.setValueAtTime(0.0001, startAt)
  envelope.gain.exponentialRampToValueAtTime(gain, startAt + 0.008)
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.9)

  oscillator.connect(envelope)
  envelope.connect(context.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + 0.95)
}

export function playNotificationBell(): void {
  const context = getContext()
  if (!context || context.state !== 'running') return

  const now = context.currentTime
  // A perfect fifth apart, the second struck slightly later — carries clearly
  // over a noisy room without being shrill.
  strike(context, 880, now, 0.32)
  strike(context, 1318.5, now + 0.09, 0.24)
}
