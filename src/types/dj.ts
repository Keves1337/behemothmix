export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  key: string;
  waveformData?: number[];
  // Audio source for playback
  audioUrl?: string;
  audioFile?: File;
  // Energy map for auto-mix (0-100 energy level per 4 beats)
  energyMap?: number[];
  // Detected phrase/drop positions (in seconds)
  dropPoints?: number[];
  // Intro/outro lengths for mixing
  introLength?: number;
  outroLength?: number;
}

export interface HotCue {
  id: number;
  position: number; // in seconds
  label: string;
  color: string;
  type: 'cue' | 'loop';
  loopLength?: number; // in beats, for loop type
}

export interface LoopState {
  active: boolean;
  inPoint: number;
  outPoint: number;
  length: number; // in beats
}

export interface DeckState {
  track: Track | null;
  isPlaying: boolean;
  position: number;
  bpm: number;
  pitch: number;
  volume: number;
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  filter: number;
  isSynced: boolean;
  cuePoint: number;
  // New professional features
  hotCues: HotCue[];
  loop: LoopState;
  slipMode: boolean;
  slipPosition: number; // background position during slip
  keyLock: boolean;
  quantize: boolean;
  beatJumpSize: number; // in beats
}

export interface MixerState {
  crossfader: number;
  masterVolume: number;
  headphoneVolume: number;
  headphoneMix: number;
}

export interface AutoMixSettings {
  enabled: boolean;
  transitionTime: number;
  transitionStyle: 'auto' | 'crossfade' | 'cut' | 'beatmatch' | 'drop';
  smartSync: boolean; // analyze tracks for optimal mix point
  energyMatch: boolean; // match energy levels
  harmonic: boolean; // prefer harmonically compatible tracks
}

export interface AutoMixState {
  isAnalyzing: boolean;
  currentPhase: 'idle' | 'scanning' | 'waiting' | 'transitioning';
  suggestedMixPoint: number | null;
  transitionProgress: number;
  nextTrackReady: boolean;
  queuedTrackId: string | null;
  selectedStyle: 'crossfade' | 'cut' | 'beatmatch' | 'drop' | null;
}

export interface EffectState {
  type: 'echo' | 'reverb' | 'flanger' | 'filter' | 'none';
  wet: number;
  enabled: boolean;
}
