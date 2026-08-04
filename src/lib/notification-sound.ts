'use client'

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

export function unlockNotificationSound(): void {
  const context = getContext()
  if (context?.state === 'suspended') void context.resume()
}

function strike(context: AudioContext, frequency: number, startAt: number, gain: number): void {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startAt)

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

  strike(context, 880, now, 0.32)
  strike(context, 1318.5, now + 0.09, 0.24)
}
