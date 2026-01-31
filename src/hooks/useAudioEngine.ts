import { useRef, useCallback, useEffect, useState } from 'react';
import { Track } from '@/types/dj';

interface AudioDeck {
  audio: HTMLAudioElement | null;
  gainNode: GainNode | null;
  eqHigh: BiquadFilterNode | null;
  eqMid: BiquadFilterNode | null;
  eqLow: BiquadFilterNode | null;
  filterNode: BiquadFilterNode | null;
  source: MediaElementAudioSourceNode | null;
}

interface UseAudioEngineReturn {
  loadTrack: (deck: 'a' | 'b', track: Track) => Promise<boolean>;
  play: (deck: 'a' | 'b') => void;
  pause: (deck: 'a' | 'b') => void;
  seek: (deck: 'a' | 'b', position: number) => void;
  setVolume: (deck: 'a' | 'b', volume: number) => void;
  setEQ: (deck: 'a' | 'b', type: 'high' | 'mid' | 'low', value: number) => void;
  setFilter: (deck: 'a' | 'b', value: number) => void;
  setCrossfader: (value: number) => void;
  setMasterVolume: (value: number) => void;
  setPitch: (deck: 'a' | 'b', pitch: number) => void;
  getPosition: (deck: 'a' | 'b') => number;
  isReady: (deck: 'a' | 'b') => boolean;
  deckAHasAudio: boolean;
  deckBHasAudio: boolean;
}

export const useAudioEngine = (): UseAudioEngineReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const crossfaderRef = useRef<number>(50);
  
  const deckARef = useRef<AudioDeck>({
    audio: null,
    gainNode: null,
    eqHigh: null,
    eqMid: null,
    eqLow: null,
    filterNode: null,
    source: null,
  });
  
  const deckBRef = useRef<AudioDeck>({
    audio: null,
    gainNode: null,
    eqHigh: null,
    eqMid: null,
    eqLow: null,
    filterNode: null,
    source: null,
  });

  const [deckAHasAudio, setDeckAHasAudio] = useState(false);
  const [deckBHasAudio, setDeckBHasAudio] = useState(false);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  // Create audio chain for a deck
  const createDeckChain = useCallback((deck: AudioDeck, audioContext: AudioContext) => {
    if (!deck.audio || deck.source) return;

    // Create nodes
    deck.source = audioContext.createMediaElementSource(deck.audio);
    deck.gainNode = audioContext.createGain();
    deck.eqHigh = audioContext.createBiquadFilter();
    deck.eqMid = audioContext.createBiquadFilter();
    deck.eqLow = audioContext.createBiquadFilter();
    deck.filterNode = audioContext.createBiquadFilter();

    // Configure EQ bands
    deck.eqHigh.type = 'highshelf';
    deck.eqHigh.frequency.value = 3200;
    deck.eqHigh.gain.value = 0;

    deck.eqMid.type = 'peaking';
    deck.eqMid.frequency.value = 1000;
    deck.eqMid.Q.value = 0.5;
    deck.eqMid.gain.value = 0;

    deck.eqLow.type = 'lowshelf';
    deck.eqLow.frequency.value = 320;
    deck.eqLow.gain.value = 0;

    // Configure filter (lowpass by default, centered)
    deck.filterNode.type = 'lowpass';
    deck.filterNode.frequency.value = 20000;
    deck.filterNode.Q.value = 1;

    // Connect chain: source -> eqLow -> eqMid -> eqHigh -> filter -> gain -> master
    deck.source.connect(deck.eqLow);
    deck.eqLow.connect(deck.eqMid);
    deck.eqMid.connect(deck.eqHigh);
    deck.eqHigh.connect(deck.filterNode);
    deck.filterNode.connect(deck.gainNode);
    deck.gainNode.connect(masterGainRef.current!);
  }, []);

  // Load track to deck
  const loadTrack = useCallback(async (deckId: 'a' | 'b', track: Track): Promise<boolean> => {
    const audioContext = initAudioContext();
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    const setHasAudio = deckId === 'a' ? setDeckAHasAudio : setDeckBHasAudio;

    // Check if track has audio
    if (!track.audioUrl && !track.audioFile) {
      console.log(`Track "${track.title}" has no audio source`);
      setHasAudio(false);
      return false;
    }

    // Clean up previous audio
    if (deck.audio) {
      deck.audio.pause();
      deck.audio.src = '';
    }

    // Create new audio element
    deck.audio = new Audio();
    deck.audio.crossOrigin = 'anonymous';
    deck.source = null; // Reset source so we can create a new chain

    // Set audio source
    if (track.audioFile) {
      deck.audio.src = URL.createObjectURL(track.audioFile);
    } else if (track.audioUrl) {
      deck.audio.src = track.audioUrl;
    }

    // Wait for audio to load
    return new Promise((resolve) => {
      deck.audio!.addEventListener('loadeddata', () => {
        createDeckChain(deck, audioContext);
        setHasAudio(true);
        resolve(true);
      }, { once: true });

      deck.audio!.addEventListener('error', (e) => {
        console.error('Audio load error:', e);
        setHasAudio(false);
        resolve(false);
      }, { once: true });

      deck.audio!.load();
    });
  }, [initAudioContext, createDeckChain]);

  // Playback controls
  const play = useCallback((deckId: 'a' | 'b') => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    if (deck.audio) {
      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      deck.audio.play().catch(console.error);
    }
  }, []);

  const pause = useCallback((deckId: 'a' | 'b') => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    if (deck.audio) {
      deck.audio.pause();
    }
  }, []);

  const seek = useCallback((deckId: 'a' | 'b', position: number) => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    if (deck.audio && isFinite(position)) {
      deck.audio.currentTime = Math.max(0, Math.min(position, deck.audio.duration || 0));
    }
  }, []);

  const getPosition = useCallback((deckId: 'a' | 'b'): number => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    return deck.audio?.currentTime || 0;
  }, []);

  const isReady = useCallback((deckId: 'a' | 'b'): boolean => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    return deck.audio?.readyState === 4;
  }, []);

  // Volume and mixing
  const updateDeckVolumes = useCallback(() => {
    const crossfader = crossfaderRef.current;
    
    // Crossfader curve (equal power)
    const deckAMix = Math.cos((crossfader / 100) * Math.PI * 0.5);
    const deckBMix = Math.sin((crossfader / 100) * Math.PI * 0.5);

    if (deckARef.current.gainNode) {
      deckARef.current.gainNode.gain.value = deckAMix;
    }
    if (deckBRef.current.gainNode) {
      deckBRef.current.gainNode.gain.value = deckBMix;
    }
  }, []);

  const setVolume = useCallback((deckId: 'a' | 'b', volume: number) => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    if (deck.audio) {
      deck.audio.volume = volume / 100;
    }
  }, []);

  const setCrossfader = useCallback((value: number) => {
    crossfaderRef.current = value;
    updateDeckVolumes();
  }, [updateDeckVolumes]);

  const setMasterVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume / 100;
    }
  }, []);

  // EQ controls (value: 0-100, 50 = neutral)
  const setEQ = useCallback((deckId: 'a' | 'b', type: 'high' | 'mid' | 'low', value: number) => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    const node = type === 'high' ? deck.eqHigh : type === 'mid' ? deck.eqMid : deck.eqLow;
    
    if (node) {
      // Convert 0-100 to -12dB to +12dB
      const dbValue = ((value - 50) / 50) * 12;
      node.gain.value = dbValue;
    }
  }, []);

  // Filter control (value: 0-100, 50 = neutral/no filter)
  const setFilter = useCallback((deckId: 'a' | 'b', value: number) => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    
    if (deck.filterNode) {
      if (value < 50) {
        // Low-pass filter (turn left = cut highs)
        deck.filterNode.type = 'lowpass';
        // Map 0-50 to 200Hz-20000Hz exponentially
        const ratio = value / 50;
        deck.filterNode.frequency.value = 200 + (19800 * Math.pow(ratio, 2));
      } else if (value > 50) {
        // High-pass filter (turn right = cut lows)
        deck.filterNode.type = 'highpass';
        // Map 50-100 to 20Hz-5000Hz exponentially
        const ratio = (value - 50) / 50;
        deck.filterNode.frequency.value = 20 + (4980 * Math.pow(ratio, 2));
      } else {
        // Neutral - no filtering
        deck.filterNode.type = 'lowpass';
        deck.filterNode.frequency.value = 20000;
      }
    }
  }, []);

  // Pitch/tempo control
  const setPitch = useCallback((deckId: 'a' | 'b', pitch: number) => {
    const deck = deckId === 'a' ? deckARef.current : deckBRef.current;
    if (deck.audio) {
      // Pitch range: -8% to +8% maps to playbackRate 0.92 to 1.08
      deck.audio.playbackRate = 1 + (pitch / 100);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deckARef.current.audio) {
        deckARef.current.audio.pause();
        deckARef.current.audio.src = '';
      }
      if (deckBRef.current.audio) {
        deckBRef.current.audio.pause();
        deckBRef.current.audio.src = '';
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    loadTrack,
    play,
    pause,
    seek,
    setVolume,
    setEQ,
    setFilter,
    setCrossfader,
    setMasterVolume,
    setPitch,
    getPosition,
    isReady,
    deckAHasAudio,
    deckBHasAudio,
  };
};
