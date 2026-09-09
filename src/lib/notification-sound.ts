'use client'

let audioContext: AudioContext | null = null
let voiceBus: GainNode | null = null
let lastPlayedAt = 0

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

const PARTIALS: readonly { ratio: number; level: number; decay: number }[] = [
  { ratio: 1, level: 1, decay: 1.6 },
  { ratio: 2.01, level: 0.4, decay: 0.95 },
  { ratio: 2.76, level: 0.17, decay: 0.55 },
  { ratio: 4.07, level: 0.06, decay: 0.28 },
]

const ARPEGGIO: readonly { frequency: number; at: number; velocity: number }[] = [
  { frequency: 1046.5, at: 0, velocity: 0.5 },
  { frequency: 1318.51, at: 0.078, velocity: 0.44 },
  { frequency: 1567.98, at: 0.156, velocity: 0.5 },
  { frequency: 2093, at: 0.162, velocity: 0.13 },
]

const REPEAT_GUARD_MS = 380

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  if (!audioContext) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
    if (!Ctor) return null
    audioContext = new Ctor()
  }

  return audioContext
}

// Exponentially decaying noise doubles as both the reverb tail and the mallet
// transient; the shaping exponent is what separates a room from a click.
function decayingNoise(context: AudioContext, seconds: number, curve: number): AudioBuffer {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds))
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const samples = buffer.getChannelData(0)

  for (let i = 0; i < length; i += 1) {
    samples[i] = (Math.random() * 2 - 1) * (1 - i / length) ** curve
  }

  return buffer
}

function getVoiceBus(context: AudioContext): GainNode {
  if (voiceBus) return voiceBus

  const input = context.createGain()
  input.gain.value = 1

  const warmth = context.createBiquadFilter()
  warmth.type = 'lowpass'
  warmth.frequency.value = 7400
  warmth.Q.value = 0.4

  const reverb = context.createConvolver()
  reverb.buffer = decayingNoise(context, 1.9, 3.2)

  const send = context.createGain()
  send.gain.value = 0.32

  const master = context.createGain()
  master.gain.value = 0.55

  input.connect(warmth).connect(master)
  input.connect(send).connect(reverb).connect(master)
  master.connect(context.destination)

  voiceBus = input
  return input
}

function ring(context: AudioContext, bus: GainNode, note: (typeof ARPEGGIO)[number], now: number) {
  const startAt = now + note.at

  for (const partial of PARTIALS) {
    const oscillator = context.createOscillator()
    const envelope = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(note.frequency * partial.ratio, startAt)

    envelope.gain.setValueAtTime(0.0001, startAt)
    envelope.gain.exponentialRampToValueAtTime(note.velocity * partial.level, startAt + 0.006)
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + partial.decay)

    oscillator.connect(envelope).connect(bus)
    oscillator.start(startAt)
    oscillator.stop(startAt + partial.decay + 0.05)
  }
}

function mallet(context: AudioContext, bus: GainNode, startAt: number) {
  const source = context.createBufferSource()
  source.buffer = decayingNoise(context, 0.05, 6)

  const shape = context.createBiquadFilter()
  shape.type = 'bandpass'
  shape.frequency.value = 2600
  shape.Q.value = 0.9

  const level = context.createGain()
  level.gain.value = 0.1

  source.connect(shape).connect(level).connect(bus)
  source.start(startAt)
}

function body(context: AudioContext, bus: GainNode, startAt: number) {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(196, startAt)
  oscillator.frequency.exponentialRampToValueAtTime(98, startAt + 0.18)

  envelope.gain.setValueAtTime(0.0001, startAt)
  envelope.gain.exponentialRampToValueAtTime(0.15, startAt + 0.012)
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.34)

  oscillator.connect(envelope).connect(bus)
  oscillator.start(startAt)
  oscillator.stop(startAt + 0.4)
}

export function unlockNotificationSound(): void {
  const context = getContext()
  if (context?.state === 'suspended') void context.resume()
}

export function playNotificationBell(): void {
  const context = getContext()
  if (!context || context.state !== 'running') return

  // Several listings can land in the same realtime batch. Overlapping tails
  // turn the chime into noise, so only the first of a burst rings.
  const elapsed = Date.now() - lastPlayedAt
  if (elapsed < REPEAT_GUARD_MS) return
  lastPlayedAt = Date.now()

  const bus = getVoiceBus(context)
  const now = context.currentTime + 0.02

  mallet(context, bus, now)
  body(context, bus, now)

  for (const note of ARPEGGIO) {
    ring(context, bus, note, now)
  }
}
