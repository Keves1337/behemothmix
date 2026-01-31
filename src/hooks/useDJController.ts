import { useState, useEffect, useCallback, useRef } from 'react';
import { DeckState, MixerState, AutoMixSettings, Track, AutoMixState, HotCue, LoopState } from '@/types/dj';

const defaultLoop: LoopState = {
  active: false,
  inPoint: 0,
  outPoint: 0,
  length: 4,
};

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
  hotCues: [],
  loop: defaultLoop,
  slipMode: false,
  slipPosition: 0,
  keyLock: false,
  quantize: true,
  beatJumpSize: 4,
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
  smartSync: true,
  energyMatch: true,
  harmonic: true,
};

const defaultAutoMixState: AutoMixState = {
  isAnalyzing: false,
  currentPhase: 'idle',
  suggestedMixPoint: null,
  transitionProgress: 0,
  nextTrackReady: false,
  queuedTrackId: null,
};

// Generate simulated energy map for a track (energy levels per 8 beats)
const generateEnergyMap = (duration: number, bpm: number): number[] => {
  const beatsPerSecond = bpm / 60;
  const segmentLength = 8 / beatsPerSecond; // 8 beats per segment
  const segments = Math.ceil(duration / segmentLength);
  const map: number[] = [];
  
  // Simulate typical EDM track structure: intro -> buildup -> drop -> breakdown -> drop -> outro
  for (let i = 0; i < segments; i++) {
    const progress = i / segments;
    let energy: number;
    
    if (progress < 0.1) energy = 20 + Math.random() * 20; // Intro
    else if (progress < 0.2) energy = 40 + progress * 200; // Buildup 1
    else if (progress < 0.35) energy = 80 + Math.random() * 20; // Drop 1
    else if (progress < 0.45) energy = 40 + Math.random() * 20; // Breakdown
    else if (progress < 0.55) energy = 50 + (progress - 0.45) * 300; // Buildup 2
    else if (progress < 0.75) energy = 85 + Math.random() * 15; // Drop 2 (main)
    else if (progress < 0.9) energy = 60 - (progress - 0.75) * 200; // Outro buildup
    else energy = 20 + Math.random() * 15; // Outro
    
    map.push(Math.min(100, Math.max(0, energy)));
  }
  return map;
};

// Find drop points in energy map
const findDropPoints = (energyMap: number[], duration: number): number[] => {
  const drops: number[] = [];
  const segmentDuration = duration / energyMap.length;
  
  for (let i = 1; i < energyMap.length - 1; i++) {
    // A drop is where energy suddenly jumps up significantly
    if (energyMap[i] > energyMap[i - 1] + 25 && energyMap[i] > 70) {
      drops.push(i * segmentDuration);
    }
  }
  return drops;
};

// Sample tracks for demo with energy analysis
const sampleTracks: Track[] = [
  { id: '1', title: 'Midnight Pulse', artist: 'Neon Dreams', bpm: 128, duration: 245, key: '8A', introLength: 32, outroLength: 24 },
  { id: '2', title: 'Electric Horizon', artist: 'Synthwave Master', bpm: 124, duration: 312, key: '11B', introLength: 24, outroLength: 32 },
  { id: '3', title: 'Deep Space Nine', artist: 'Bass Commander', bpm: 130, duration: 278, key: '5A', introLength: 16, outroLength: 24 },
  { id: '4', title: 'Techno Revolution', artist: 'DJ Pulse', bpm: 132, duration: 289, key: '2A', introLength: 32, outroLength: 32 },
  { id: '5', title: 'Sunset Boulevard', artist: 'Chill Vibes', bpm: 118, duration: 234, key: '6B', introLength: 16, outroLength: 16 },
  { id: '6', title: 'Night Drive', artist: 'Retro Wave', bpm: 126, duration: 267, key: '9A', introLength: 24, outroLength: 24 },
  { id: '7', title: 'Digital Dreams', artist: 'Cyber Funk', bpm: 122, duration: 298, key: '4B', introLength: 32, outroLength: 24 },
  { id: '8', title: 'Underground Rhythm', artist: 'Deep House Collective', bpm: 124, duration: 321, key: '7A', introLength: 24, outroLength: 32 },
  { id: '9', title: 'Stellar Voyage', artist: 'Cosmic DJ', bpm: 128, duration: 276, key: '10B', introLength: 16, outroLength: 24 },
  { id: '10', title: 'Bass Drop City', artist: 'Heavy Beats', bpm: 140, duration: 198, key: '1A', introLength: 8, outroLength: 16 },
].map(track => ({
  ...track,
  energyMap: generateEnergyMap(track.duration, track.bpm),
  dropPoints: [],
})).map(track => ({
  ...track,
  dropPoints: findDropPoints(track.energyMap!, track.duration),
}));

// Camelot wheel for harmonic mixing
const camelotWheel: { [key: string]: string[] } = {
  '1A': ['1A', '12A', '2A', '1B'],
  '2A': ['2A', '1A', '3A', '2B'],
  '3A': ['3A', '2A', '4A', '3B'],
  '4A': ['4A', '3A', '5A', '4B'],
  '5A': ['5A', '4A', '6A', '5B'],
  '6A': ['6A', '5A', '7A', '6B'],
  '7A': ['7A', '6A', '8A', '7B'],
  '8A': ['8A', '7A', '9A', '8B'],
  '9A': ['9A', '8A', '10A', '9B'],
  '10A': ['10A', '9A', '11A', '10B'],
  '11A': ['11A', '10A', '12A', '11B'],
  '12A': ['12A', '11A', '1A', '12B'],
  '1B': ['1B', '12B', '2B', '1A'],
  '2B': ['2B', '1B', '3B', '2A'],
  '3B': ['3B', '2B', '4B', '3A'],
  '4B': ['4B', '3B', '5B', '4A'],
  '5B': ['5B', '4B', '6B', '5A'],
  '6B': ['6B', '5B', '7B', '6A'],
  '7B': ['7B', '6B', '8B', '7A'],
  '8B': ['8B', '7B', '9B', '8A'],
  '9B': ['9B', '8B', '10B', '9A'],
  '10B': ['10B', '9B', '11B', '10A'],
  '11B': ['11B', '10B', '12B', '11A'],
  '12B': ['12B', '11B', '1B', '12A'],
};

export const isHarmonicMatch = (key1: string, key2: string): boolean => {
  return camelotWheel[key1]?.includes(key2) || false;
};

export const useDJController = () => {
  const [deckA, setDeckA] = useState<DeckState>(defaultDeckState);
  const [deckB, setDeckB] = useState<DeckState>(defaultDeckState);
  const [mixer, setMixer] = useState<MixerState>(defaultMixerState);
  const [autoMix, setAutoMix] = useState<AutoMixSettings>(defaultAutoMixSettings);
  const [autoMixState, setAutoMixState] = useState<AutoMixState>(defaultAutoMixState);
  const [tracks, setTracks] = useState<Track[]>(sampleTracks);
  
  const transitionRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate playback progress with loop support
  useEffect(() => {
    const interval = setInterval(() => {
      if (deckA.isPlaying && deckA.track) {
        setDeckA(prev => {
          let newPosition = prev.position + 0.1;
          
          // Handle loop
          if (prev.loop.active && newPosition >= prev.loop.outPoint) {
            newPosition = prev.loop.inPoint;
          }
          
          // Handle track end
          if (newPosition >= prev.track!.duration) {
            newPosition = 0;
          }
          
          // Update slip position if slip mode is on
          const newSlipPosition = prev.slipMode ? prev.slipPosition + 0.1 : prev.position;
          
          return { ...prev, position: newPosition, slipPosition: newSlipPosition };
        });
      }
      if (deckB.isPlaying && deckB.track) {
        setDeckB(prev => {
          let newPosition = prev.position + 0.1;
          
          if (prev.loop.active && newPosition >= prev.loop.outPoint) {
            newPosition = prev.loop.inPoint;
          }
          
          if (newPosition >= prev.track!.duration) {
            newPosition = 0;
          }
          
          const newSlipPosition = prev.slipMode ? prev.slipPosition + 0.1 : prev.position;
          
          return { ...prev, position: newPosition, slipPosition: newSlipPosition };
        });
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
    // Analyze track if not already analyzed
    const analyzedTrack = {
      ...track,
      energyMap: track.energyMap || generateEnergyMap(track.duration, track.bpm),
    };
    if (!analyzedTrack.dropPoints) {
      analyzedTrack.dropPoints = findDropPoints(analyzedTrack.energyMap, track.duration);
    }

    const updates: Partial<DeckState> = {
      track: analyzedTrack,
      bpm: track.bpm,
      position: 0,
      cuePoint: 0,
      loop: defaultLoop,
      hotCues: [],
    };

    if (deck === 'a') {
      updateDeckA(updates);
    } else {
      updateDeckB(updates);
    }
  }, [updateDeckA, updateDeckB]);

  // Smart track selection for auto-mix
  const selectNextTrack = useCallback((currentTrack: Track, excludeIds: string[]): Track | null => {
    const availableTracks = tracks.filter(t => 
      t.id !== currentTrack.id && !excludeIds.includes(t.id)
    );
    
    if (availableTracks.length === 0) return null;

    // Score each track based on compatibility
    const scoredTracks = availableTracks.map(track => {
      let score = 0;
      
      // Harmonic compatibility (highest priority)
      if (autoMix.harmonic && isHarmonicMatch(currentTrack.key, track.key)) {
        score += 50;
      }
      
      // BPM compatibility (within ±6% is ideal)
      const bpmDiff = Math.abs(currentTrack.bpm - track.bpm) / currentTrack.bpm;
      if (bpmDiff <= 0.03) score += 40;
      else if (bpmDiff <= 0.06) score += 25;
      else if (bpmDiff <= 0.10) score += 10;
      
      // Energy matching
      if (autoMix.energyMatch && currentTrack.energyMap && track.energyMap) {
        const currentEnergy = currentTrack.energyMap[currentTrack.energyMap.length - 1] || 50;
        const nextEnergy = track.energyMap[0] || 50;
        const energyDiff = Math.abs(currentEnergy - nextEnergy);
        if (energyDiff <= 15) score += 20;
        else if (energyDiff <= 30) score += 10;
      }
      
      // Add some randomness to prevent repetitive playlists
      score += Math.random() * 10;
      
      return { track, score };
    });

    // Sort by score and pick the best
    scoredTracks.sort((a, b) => b.score - a.score);
    return scoredTracks[0]?.track || availableTracks[0];
  }, [tracks, autoMix.harmonic, autoMix.energyMatch]);

  // Auto-queue next track
  const autoQueueNextTrack = useCallback((targetDeck: 'a' | 'b', currentTrack: Track | null) => {
    if (!currentTrack) return;
    
    const otherDeckTrack = targetDeck === 'a' ? deckB.track : deckA.track;
    const excludeIds = [currentTrack.id];
    if (otherDeckTrack) excludeIds.push(otherDeckTrack.id);
    
    const nextTrack = selectNextTrack(currentTrack, excludeIds);
    if (nextTrack) {
      loadTrackToDeck(nextTrack, targetDeck);
      setAutoMixState(prev => ({ 
        ...prev, 
        nextTrackReady: true,
        queuedTrackId: nextTrack.id,
      }));
    }
  }, [selectNextTrack, deckA.track, deckB.track, loadTrackToDeck]);

  // Smart Auto-Mix Logic with auto-queue
  useEffect(() => {
    if (!autoMix.enabled) {
      if (transitionRef.current) {
        clearInterval(transitionRef.current);
        transitionRef.current = null;
      }
      setAutoMixState(prev => ({ ...prev, currentPhase: 'idle', transitionProgress: 0, queuedTrackId: null }));
      return;
    }

    const checkAutoMix = () => {
      const deckAPlaying = deckA.isPlaying && deckA.track;
      const deckBPlaying = deckB.isPlaying && deckB.track;
      
      // Determine which deck is the "main" playing deck
      let playingDeck: DeckState | null = null;
      let otherDeck: DeckState | null = null;
      let setPlayingDeck: typeof setDeckA | null = null;
      let setOtherDeck: typeof setDeckA | null = null;
      let playingDeckId: 'a' | 'b' = 'a';
      let otherDeckId: 'a' | 'b' = 'b';

      if (deckAPlaying && !deckBPlaying) {
        playingDeck = deckA;
        otherDeck = deckB;
        setPlayingDeck = setDeckA;
        setOtherDeck = setDeckB;
        playingDeckId = 'a';
        otherDeckId = 'b';
      } else if (deckBPlaying && !deckAPlaying) {
        playingDeck = deckB;
        otherDeck = deckA;
        setPlayingDeck = setDeckB;
        setOtherDeck = setDeckA;
        playingDeckId = 'b';
        otherDeckId = 'a';
      } else if (deckAPlaying && deckBPlaying) {
        // Both playing - use crossfader position to determine primary
        if (mixer.crossfader < 50) {
          playingDeck = deckA;
          otherDeck = deckB;
          setPlayingDeck = setDeckA;
          setOtherDeck = setDeckB;
          playingDeckId = 'a';
          otherDeckId = 'b';
        } else {
          playingDeck = deckB;
          otherDeck = deckA;
          setPlayingDeck = setDeckB;
          setOtherDeck = setDeckA;
          playingDeckId = 'b';
          otherDeckId = 'a';
        }
      }

      if (!playingDeck?.track || !setPlayingDeck || !setOtherDeck) return;

      // Auto-queue: If other deck is empty, queue a track
      if (!otherDeck?.track && autoMixState.currentPhase === 'idle') {
        setAutoMixState(prev => ({ ...prev, currentPhase: 'scanning', isAnalyzing: true }));
        autoQueueNextTrack(otherDeckId, playingDeck.track);
        setTimeout(() => {
          setAutoMixState(prev => ({ ...prev, currentPhase: 'waiting', isAnalyzing: false }));
        }, 1000);
        return;
      }

      if (!otherDeck?.track) return;

      const timeRemaining = playingDeck.track.duration - playingDeck.position;
      const outroStart = playingDeck.track.outroLength || 16;

      // Start transition when entering outro
      if (timeRemaining <= outroStart && autoMixState.currentPhase !== 'transitioning') {
        setAutoMixState(prev => ({ 
          ...prev, 
          currentPhase: 'transitioning',
          isAnalyzing: false,
        }));

        // Start the other deck
        setOtherDeck(prev => ({ ...prev, isPlaying: true, position: 0 }));

        // Begin crossfade
        const transitionSteps = autoMix.transitionTime * 10;
        let step = 0;
        const startCrossfader = mixer.crossfader;
        const targetCrossfader = playingDeckId === 'a' ? 100 : 0;

        transitionRef.current = setInterval(() => {
          step++;
          const progress = step / transitionSteps;
          const newCrossfader = startCrossfader + (targetCrossfader - startCrossfader) * progress;
          
          setMixer(prev => ({ ...prev, crossfader: newCrossfader }));
          setAutoMixState(prev => ({ ...prev, transitionProgress: progress * 100 }));

          if (step >= transitionSteps) {
            if (transitionRef.current) clearInterval(transitionRef.current);
            transitionRef.current = null;
            
            // Stop the old deck
            setPlayingDeck!(prev => ({ ...prev, isPlaying: false }));
            
            // Clear the old deck's track and queue next track for it
            setTimeout(() => {
              setPlayingDeck!(prev => ({ ...prev, track: null, position: 0 }));
              setAutoMixState(prev => ({ 
                ...prev, 
                currentPhase: 'idle', 
                transitionProgress: 0,
                nextTrackReady: false,
                queuedTrackId: null,
              }));
            }, 500);
          }
        }, 100);
      }
    };

    const autoMixInterval = setInterval(checkAutoMix, 500);
    return () => clearInterval(autoMixInterval);
  }, [autoMix.enabled, deckA.isPlaying, deckB.isPlaying, deckA.position, deckB.position, 
      deckA.track, deckB.track, autoMixState.currentPhase, mixer.crossfader, 
      autoMix.transitionTime, autoQueueNextTrack]);

  const addTracks = useCallback((newTracks: Track[]) => {
    const analyzedTracks = newTracks.map(track => ({
      ...track,
      energyMap: generateEnergyMap(track.duration, track.bpm),
      dropPoints: [],
    })).map(track => ({
      ...track,
      dropPoints: findDropPoints(track.energyMap!, track.duration),
    }));
    setTracks(prev => [...prev, ...analyzedTracks]);
  }, []);

  const editTrack = useCallback((trackId: string, title: string, artist: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, title, artist } : track
    ));
  }, []);

  const deleteTrack = useCallback((trackId: string) => {
    setTracks(prev => prev.filter(track => track.id !== trackId));
  }, []);

  // Hot cue management
  const setHotCue = useCallback((deck: 'a' | 'b', cueIndex: number) => {
    const deckState = deck === 'a' ? deckA : deckB;
    const setDeck = deck === 'a' ? setDeckA : setDeckB;
    
    const existingCue = deckState.hotCues.find(c => c.id === cueIndex);
    if (existingCue) {
      // Jump to existing cue
      setDeck(prev => ({ ...prev, position: existingCue.position }));
    } else {
      // Create new cue
      const colors = ['#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#FFC107', '#00BCD4', '#E91E63', '#8BC34A'];
      const newCue: HotCue = {
        id: cueIndex,
        position: deckState.position,
        label: `CUE ${cueIndex + 1}`,
        color: colors[cueIndex % colors.length],
        type: 'cue',
      };
      setDeck(prev => ({ ...prev, hotCues: [...prev.hotCues, newCue] }));
    }
  }, [deckA, deckB]);

  const deleteHotCue = useCallback((deck: 'a' | 'b', cueIndex: number) => {
    const setDeck = deck === 'a' ? setDeckA : setDeckB;
    setDeck(prev => ({ 
      ...prev, 
      hotCues: prev.hotCues.filter(c => c.id !== cueIndex) 
    }));
  }, []);

  // Loop control
  const setLoop = useCallback((deck: 'a' | 'b', beats: number) => {
    const deckState = deck === 'a' ? deckA : deckB;
    const setDeck = deck === 'a' ? setDeckA : setDeckB;
    
    if (!deckState.track) return;
    
    const beatsPerSecond = deckState.bpm / 60;
    const loopLength = beats / beatsPerSecond;
    
    setDeck(prev => ({
      ...prev,
      loop: {
        active: true,
        inPoint: prev.position,
        outPoint: prev.position + loopLength,
        length: beats,
      },
    }));
  }, [deckA, deckB]);

  const toggleLoop = useCallback((deck: 'a' | 'b') => {
    const setDeck = deck === 'a' ? setDeckA : setDeckB;
    setDeck(prev => ({
      ...prev,
      loop: { ...prev.loop, active: !prev.loop.active },
    }));
  }, []);

  // Beat jump
  const beatJump = useCallback((deck: 'a' | 'b', direction: 1 | -1) => {
    const deckState = deck === 'a' ? deckA : deckB;
    const setDeck = deck === 'a' ? setDeckA : setDeckB;
    
    if (!deckState.track) return;
    
    const beatsPerSecond = deckState.bpm / 60;
    const jumpSeconds = deckState.beatJumpSize / beatsPerSecond * direction;
    
    setDeck(prev => ({
      ...prev,
      position: Math.max(0, Math.min(prev.track!.duration, prev.position + jumpSeconds)),
    }));
  }, [deckA, deckB]);

  return {
    deckA,
    deckB,
    mixer,
    autoMix,
    autoMixState,
    tracks,
    updateDeckA,
    updateDeckB,
    updateMixer,
    updateAutoMix,
    loadTrackToDeck,
    addTracks,
    editTrack,
    deleteTrack,
    setHotCue,
    deleteHotCue,
    setLoop,
    toggleLoop,
    beatJump,
    isHarmonicMatch,
  };
};
