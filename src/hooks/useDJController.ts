import { useState, useEffect, useCallback } from 'react';
import { DeckState, MixerState, AutoMixSettings, Track } from '@/types/dj';

const defaultDeckState: DeckState = {
  track: null,
  isPlaying: false,
  position: 0,
  bpm: 128,
  pitch: 0,
  volume: 80,
  eq: { high: 50, mid: 50, low: 50 },
  filter: 50,
  isSynced: false,
  cuePoint: 0,
};

const defaultMixerState: MixerState = {
  crossfader: 50,
  masterVolume: 80,
  headphoneVolume: 70,
  headphoneMix: 50,
};

const defaultAutoMixSettings: AutoMixSettings = {
  enabled: false,
  transitionTime: 16,
  transitionStyle: 'crossfade',
};

// Sample tracks for demo
const sampleTracks: Track[] = [
  { id: '1', title: 'Midnight Pulse', artist: 'Neon Dreams', bpm: 128, duration: 245, key: '8A' },
  { id: '2', title: 'Electric Horizon', artist: 'Synthwave Master', bpm: 124, duration: 312, key: '11B' },
  { id: '3', title: 'Deep Space Nine', artist: 'Bass Commander', bpm: 130, duration: 278, key: '5A' },
  { id: '4', title: 'Techno Revolution', artist: 'DJ Pulse', bpm: 132, duration: 289, key: '2A' },
  { id: '5', title: 'Sunset Boulevard', artist: 'Chill Vibes', bpm: 118, duration: 234, key: '6B' },
  { id: '6', title: 'Night Drive', artist: 'Retro Wave', bpm: 126, duration: 267, key: '9A' },
  { id: '7', title: 'Digital Dreams', artist: 'Cyber Funk', bpm: 122, duration: 298, key: '4B' },
  { id: '8', title: 'Underground Rhythm', artist: 'Deep House Collective', bpm: 124, duration: 321, key: '7A' },
  { id: '9', title: 'Stellar Voyage', artist: 'Cosmic DJ', bpm: 128, duration: 276, key: '10B' },
  { id: '10', title: 'Bass Drop City', artist: 'Heavy Beats', bpm: 140, duration: 198, key: '1A' },
];

export const useDJController = () => {
  const [deckA, setDeckA] = useState<DeckState>(defaultDeckState);
  const [deckB, setDeckB] = useState<DeckState>(defaultDeckState);
  const [mixer, setMixer] = useState<MixerState>(defaultMixerState);
  const [autoMix, setAutoMix] = useState<AutoMixSettings>(defaultAutoMixSettings);
  const [tracks] = useState<Track[]>(sampleTracks);

  // Simulate playback progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (deckA.isPlaying && deckA.track) {
        setDeckA(prev => ({
          ...prev,
          position: prev.position >= prev.track!.duration ? 0 : prev.position + 0.1,
        }));
      }
      if (deckB.isPlaying && deckB.track) {
        setDeckB(prev => ({
          ...prev,
          position: prev.position >= prev.track!.duration ? 0 : prev.position + 0.1,
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [deckA.isPlaying, deckB.isPlaying]);

  const updateDeckA = useCallback((updates: Partial<DeckState>) => {
    setDeckA(prev => ({ ...prev, ...updates }));
  }, []);

  const updateDeckB = useCallback((updates: Partial<DeckState>) => {
    setDeckB(prev => ({ ...prev, ...updates }));
  }, []);

  const updateMixer = useCallback((updates: Partial<MixerState>) => {
    setMixer(prev => ({ ...prev, ...updates }));
  }, []);

  const updateAutoMix = useCallback((updates: Partial<AutoMixSettings>) => {
    setAutoMix(prev => ({ ...prev, ...updates }));
  }, []);

  const loadTrackToDeck = useCallback((track: Track, deck: 'a' | 'b') => {
    const updates = {
      track,
      bpm: track.bpm,
      position: 0,
      cuePoint: 0,
    };

    if (deck === 'a') {
      updateDeckA(updates);
    } else {
      updateDeckB(updates);
    }
  }, [updateDeckA, updateDeckB]);

  return {
    deckA,
    deckB,
    mixer,
    autoMix,
    tracks,
    updateDeckA,
    updateDeckB,
    updateMixer,
    updateAutoMix,
    loadTrackToDeck,
  };
};
