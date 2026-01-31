import { useCallback, useMemo } from 'react';
import { useDJController } from '@/hooks/useDJController';
import { useDDJSX1 } from '@/hooks/useDDJSX1';
import Header from '@/components/dj/Header';
import Deck from '@/components/dj/Deck';
import Crossfader from '@/components/dj/Crossfader';
import TrackLibrary from '@/components/dj/TrackLibrary';
import AutoMixPanel from '@/components/dj/AutoMixPanel';
import EffectsPanel from '@/components/dj/EffectsPanel';

const Index = () => {
  const {
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
    addTracks,
  } = useDJController();

  // Deck A handlers
  const onDeckAPlay = useCallback(() => {
    updateDeckA({ isPlaying: !deckA.isPlaying });
  }, [deckA.isPlaying, updateDeckA]);
  
  const onDeckACue = useCallback(() => {
    updateDeckA({ position: deckA.cuePoint });
  }, [deckA.cuePoint, updateDeckA]);
  
  const onDeckASync = useCallback(() => {
    updateDeckA({ isSynced: !deckA.isSynced });
  }, [deckA.isSynced, updateDeckA]);
  
  const onDeckAJog = useCallback((direction: number, velocity: number) => {
    const nudge = direction * velocity * 0.1;
    updateDeckA({ position: Math.max(0, deckA.position + nudge) });
  }, [deckA.position, updateDeckA]);
  
  const onDeckAPitch = useCallback((value: number) => {
    updateDeckA({ pitch: value });
  }, [updateDeckA]);
  
  const onDeckAVolume = useCallback((value: number) => {
    updateDeckA({ volume: value });
  }, [updateDeckA]);
  
  const onDeckAEQHigh = useCallback((value: number) => {
    updateDeckA({ eq: { ...deckA.eq, high: value } });
  }, [deckA.eq, updateDeckA]);
  
  const onDeckAEQMid = useCallback((value: number) => {
    updateDeckA({ eq: { ...deckA.eq, mid: value } });
  }, [deckA.eq, updateDeckA]);
  
  const onDeckAEQLow = useCallback((value: number) => {
    updateDeckA({ eq: { ...deckA.eq, low: value } });
  }, [deckA.eq, updateDeckA]);
  
  const onDeckAFilter = useCallback((value: number) => {
    updateDeckA({ filter: value });
  }, [updateDeckA]);

  // Deck B handlers
  const onDeckBPlay = useCallback(() => {
    updateDeckB({ isPlaying: !deckB.isPlaying });
  }, [deckB.isPlaying, updateDeckB]);
  
  const onDeckBCue = useCallback(() => {
    updateDeckB({ position: deckB.cuePoint });
  }, [deckB.cuePoint, updateDeckB]);
  
  const onDeckBSync = useCallback(() => {
    updateDeckB({ isSynced: !deckB.isSynced });
  }, [deckB.isSynced, updateDeckB]);
  
  const onDeckBJog = useCallback((direction: number, velocity: number) => {
    const nudge = direction * velocity * 0.1;
    updateDeckB({ position: Math.max(0, deckB.position + nudge) });
  }, [deckB.position, updateDeckB]);
  
  const onDeckBPitch = useCallback((value: number) => {
    updateDeckB({ pitch: value });
  }, [updateDeckB]);
  
  const onDeckBVolume = useCallback((value: number) => {
    updateDeckB({ volume: value });
  }, [updateDeckB]);
  
  const onDeckBEQHigh = useCallback((value: number) => {
    updateDeckB({ eq: { ...deckB.eq, high: value } });
  }, [deckB.eq, updateDeckB]);
  
  const onDeckBEQMid = useCallback((value: number) => {
    updateDeckB({ eq: { ...deckB.eq, mid: value } });
  }, [deckB.eq, updateDeckB]);
  
  const onDeckBEQLow = useCallback((value: number) => {
    updateDeckB({ eq: { ...deckB.eq, low: value } });
  }, [deckB.eq, updateDeckB]);
  
  const onDeckBFilter = useCallback((value: number) => {
    updateDeckB({ filter: value });
  }, [updateDeckB]);

  // Mixer handlers
  const onCrossfader = useCallback((value: number) => {
    updateMixer({ crossfader: value });
  }, [updateMixer]);
  
  const onMasterVolume = useCallback((value: number) => {
    updateMixer({ masterVolume: value });
  }, [updateMixer]);

  // MIDI action handlers object
  const midiActions = useMemo(() => ({
    onDeckAPlay,
    onDeckACue,
    onDeckASync,
    onDeckAJog,
    onDeckAPitch,
    onDeckAVolume,
    onDeckAEQHigh,
    onDeckAEQMid,
    onDeckAEQLow,
    onDeckAFilter,
    onDeckBPlay,
    onDeckBCue,
    onDeckBSync,
    onDeckBJog,
    onDeckBPitch,
    onDeckBVolume,
    onDeckBEQHigh,
    onDeckBEQMid,
    onDeckBEQLow,
    onDeckBFilter,
    onCrossfader,
    onMasterVolume,
  }), [
    onDeckAPlay, onDeckACue, onDeckASync, onDeckAJog, onDeckAPitch, onDeckAVolume,
    onDeckAEQHigh, onDeckAEQMid, onDeckAEQLow, onDeckAFilter,
    onDeckBPlay, onDeckBCue, onDeckBSync, onDeckBJog, onDeckBPitch, onDeckBVolume,
    onDeckBEQHigh, onDeckBEQMid, onDeckBEQLow, onDeckBFilter,
    onCrossfader, onMasterVolume,
  ]);

  // Initialize DDJ-SX1 MIDI integration
  const midi = useDDJSX1(midiActions);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with MIDI status */}
      <Header 
        masterVolume={mixer.masterVolume}
        onMasterVolumeChange={(value) => updateMixer({ masterVolume: value })}
        midiConnected={midi.isConnected}
        midiSupported={midi.isSupported}
        midiDevices={midi.devices}
        midiError={midi.error}
        lastMidiMessage={midi.lastMessage}
        onMidiRefresh={midi.initMIDI}
        onMidiSelectDevice={midi.selectDevice}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 flex gap-4 overflow-hidden">
        {/* Left Side - Deck A */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Deck 
            deckId="a"
            state={deckA}
            onStateChange={updateDeckA}
          />
          <EffectsPanel deck="a" />
        </div>

        {/* Center - Mixer & Library */}
        <div className="w-80 flex flex-col gap-4">
          {/* Auto Mix */}
          <AutoMixPanel 
            settings={autoMix}
            onSettingsChange={updateAutoMix}
          />

          {/* Crossfader */}
          <div className="p-4 rounded-lg bg-card/50 border border-border">
            <Crossfader 
              value={mixer.crossfader}
              onChange={(value) => updateMixer({ crossfader: value })}
            />
          </div>

          {/* Track Library */}
          <div className="flex-1 min-h-0">
            <TrackLibrary 
              tracks={tracks}
              onLoadToDeck={loadTrackToDeck}
              onAddTracks={addTracks}
            />
          </div>
        </div>

        {/* Right Side - Deck B */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <Deck 
            deckId="b"
            state={deckB}
            onStateChange={updateDeckB}
          />
          <EffectsPanel deck="b" />
        </div>
      </div>

      {/* Footer - Controller Mapping Hint */}
      <footer className="px-6 py-2 border-t border-border bg-card/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {midi.isConnected 
              ? `✓ ${midi.activeDevice?.name || 'Controller'} connected - Hardware control active`
              : 'Pioneer DDJ-SX1 Support • Connect via USB to enable hardware control'
            }
          </span>
          <span className="font-mono">
            {midi.isSupported ? 'Web MIDI API Ready' : 'Web MIDI Not Supported'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
