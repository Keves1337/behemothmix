import { useEffect, useCallback, useRef } from 'react';
import { useDJController } from './useDJController';
import { useAudioEngine } from './useAudioEngine';
import { Track } from '@/types/dj';
import { toast } from '@/hooks/use-toast';

export const useDJWithAudio = () => {
  const controller = useDJController();
  const audio = useAudioEngine();
  const animationFrameRef = useRef<number | null>(null);
  const lastPositionUpdateRef = useRef<{ a: number; b: number }>({ a: 0, b: 0 });

  // Load track with audio
  const loadTrackToDeck = useCallback(async (track: Track, deck: 'a' | 'b') => {
    // First load into controller
    controller.loadTrackToDeck(track, deck);
    
    // Then load audio if available
    if (track.audioFile || track.audioUrl) {
      const success = await audio.loadTrack(deck, track);
      if (success) {
        toast({
          title: "Track loaded",
          description: `${track.title} loaded to Deck ${deck.toUpperCase()} with audio`,
        });
      }
    }
  }, [controller, audio]);

  // Sync audio playback with controller state
  useEffect(() => {
    const syncAudio = () => {
      // Deck A
      if (controller.deckA.isPlaying && controller.deckA.track) {
        if (audio.deckAHasAudio) {
          audio.play('a');
        }
      } else {
        audio.pause('a');
      }

      // Deck B
      if (controller.deckB.isPlaying && controller.deckB.track) {
        if (audio.deckBHasAudio) {
          audio.play('b');
        }
      } else {
        audio.pause('b');
      }
    };

    syncAudio();
  }, [controller.deckA.isPlaying, controller.deckB.isPlaying, audio]);

  // Sync position from audio to controller
  useEffect(() => {
    const updatePositions = () => {
      // Only update position from audio if playing and audio is loaded
      if (controller.deckA.isPlaying && audio.deckAHasAudio) {
        const pos = audio.getPosition('a');
        if (Math.abs(pos - lastPositionUpdateRef.current.a) > 0.05) {
          lastPositionUpdateRef.current.a = pos;
          controller.updateDeckA({ position: pos });
        }
      }

      if (controller.deckB.isPlaying && audio.deckBHasAudio) {
        const pos = audio.getPosition('b');
        if (Math.abs(pos - lastPositionUpdateRef.current.b) > 0.05) {
          lastPositionUpdateRef.current.b = pos;
          controller.updateDeckB({ position: pos });
        }
      }

      animationFrameRef.current = requestAnimationFrame(updatePositions);
    };

    animationFrameRef.current = requestAnimationFrame(updatePositions);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [controller.deckA.isPlaying, controller.deckB.isPlaying, audio, controller]);

  // Sync volume changes
  useEffect(() => {
    audio.setVolume('a', controller.deckA.volume);
  }, [controller.deckA.volume, audio]);

  useEffect(() => {
    audio.setVolume('b', controller.deckB.volume);
  }, [controller.deckB.volume, audio]);

  // Sync EQ changes
  useEffect(() => {
    audio.setEQ('a', 'high', controller.deckA.eq.high);
    audio.setEQ('a', 'mid', controller.deckA.eq.mid);
    audio.setEQ('a', 'low', controller.deckA.eq.low);
  }, [controller.deckA.eq, audio]);

  useEffect(() => {
    audio.setEQ('b', 'high', controller.deckB.eq.high);
    audio.setEQ('b', 'mid', controller.deckB.eq.mid);
    audio.setEQ('b', 'low', controller.deckB.eq.low);
  }, [controller.deckB.eq, audio]);

  // Sync filter changes
  useEffect(() => {
    audio.setFilter('a', controller.deckA.filter);
  }, [controller.deckA.filter, audio]);

  useEffect(() => {
    audio.setFilter('b', controller.deckB.filter);
  }, [controller.deckB.filter, audio]);

  // Sync pitch changes
  useEffect(() => {
    audio.setPitch('a', controller.deckA.pitch);
  }, [controller.deckA.pitch, audio]);

  useEffect(() => {
    audio.setPitch('b', controller.deckB.pitch);
  }, [controller.deckB.pitch, audio]);

  // Sync crossfader
  useEffect(() => {
    audio.setCrossfader(controller.mixer.crossfader);
  }, [controller.mixer.crossfader, audio]);

  // Sync master volume
  useEffect(() => {
    audio.setMasterVolume(controller.mixer.masterVolume);
  }, [controller.mixer.masterVolume, audio]);

  // Extended updateDeckA that also seeks audio
  const updateDeckA = useCallback((updates: Parameters<typeof controller.updateDeckA>[0]) => {
    controller.updateDeckA(updates);
    
    // If position is being set directly (e.g., from seeking), sync audio
    if (updates.position !== undefined && audio.deckAHasAudio) {
      audio.seek('a', updates.position);
    }
  }, [controller, audio]);

  const updateDeckB = useCallback((updates: Parameters<typeof controller.updateDeckB>[0]) => {
    controller.updateDeckB(updates);
    
    if (updates.position !== undefined && audio.deckBHasAudio) {
      audio.seek('b', updates.position);
    }
  }, [controller, audio]);

  return {
    ...controller,
    loadTrackToDeck,
    updateDeckA,
    updateDeckB,
    deckAHasAudio: audio.deckAHasAudio,
    deckBHasAudio: audio.deckBHasAudio,
  };
};
