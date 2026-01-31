export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  key: string;
  waveformData?: number[];
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
  transitionStyle: 'crossfade' | 'cut' | 'beatmatch';
}

export interface EffectState {
  type: 'echo' | 'reverb' | 'flanger' | 'filter' | 'none';
  wet: number;
  enabled: boolean;
}
