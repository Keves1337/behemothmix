import { useCallback, useMemo } from 'react';
import { useDJWithAudio } from '@/hooks/useDJWithAudio';
import { useDDJSX1 } from '@/hooks/useDDJSX1';
import Header from '@/components/dj/Header';
import Deck from '@/components/dj/Deck';
import Crossfader from '@/components/dj/Crossfader';
import TrackLibrary from '@/components/dj/TrackLibrary';
import AutoMixPanel from '@/components/dj/AutoMixPanel';
import EffectsPanel from '@/components/dj/EffectsPanel';
import FrequencyAnalyzer from '@/components/dj/FrequencyAnalyzer';

const Index = () => {
  const {
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
    deckAHasAudio,
    deckBHasAudio,
    deckAWaveform,
    deckBWaveform,
    deckARealtimeData,
    deckBRealtimeData,
    getFrequencyData,
  } = useDJWithAudio();

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
      <div className="flex-1 p-3 flex gap-3 overflow-hidden">
        {/* Left Side - Deck A */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <Deck 
            deckId="a"
            state={deckA}
            onStateChange={updateDeckA}
            onSetHotCue={(index) => setHotCue('a', index)}
            onDeleteHotCue={(index) => deleteHotCue('a', index)}
            onSetLoop={(beats) => setLoop('a', beats)}
            onToggleLoop={() => toggleLoop('a')}
            onBeatJump={(dir) => beatJump('a', dir)}
            onTrackDrop={(track) => loadTrackToDeck(track, 'a')}
            hasAudio={deckAHasAudio}
            waveformData={deckAWaveform}
            realtimeData={deckARealtimeData}
          />
          <FrequencyAnalyzer 
            deck="a"
            isPlaying={deckA.isPlaying}
            hasAudio={deckAHasAudio}
            getFrequencyData={() => getFrequencyData('a')}
          />
          <EffectsPanel deck="a" />
        </div>

        {/* Center - Mixer & Library */}
        <div className="w-80 flex flex-col gap-3">
          {/* Auto Mix */}
          <AutoMixPanel 
            settings={autoMix}
            state={autoMixState}
            onSettingsChange={updateAutoMix}
            tracks={tracks}
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
              onEditTrack={editTrack}
              onDeleteTrack={deleteTrack}
            />
          </div>
        </div>

        {/* Right Side - Deck B */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <Deck 
            deckId="b"
            state={deckB}
            onStateChange={updateDeckB}
            onSetHotCue={(index) => setHotCue('b', index)}
            onDeleteHotCue={(index) => deleteHotCue('b', index)}
            onSetLoop={(beats) => setLoop('b', beats)}
            onToggleLoop={() => toggleLoop('b')}
            onBeatJump={(dir) => beatJump('b', dir)}
            onTrackDrop={(track) => loadTrackToDeck(track, 'b')}
            hasAudio={deckBHasAudio}
            waveformData={deckBWaveform}
            realtimeData={deckBRealtimeData}
          />
          <FrequencyAnalyzer 
            deck="b"
            isPlaying={deckB.isPlaying}
            hasAudio={deckBHasAudio}
            getFrequencyData={() => getFrequencyData('b')}
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
              : 'Pro Features: Hot Cues • Loops • Beat Jump • Smart Auto-Mix • Key Lock • Slip Mode'
            }
          </span>
          <span className="text-center text-muted-foreground/70">
            Developed, Designed & Tested by <a href="https://keves1337.github.io/johnqablog/#about" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline transition-colors">Johnatan Milrad</a>
          </span>
          <span className="font-mono">
            {autoMix.enabled ? 'AUTO-MIX ACTIVE' : midi.isSupported ? 'Web MIDI Ready' : 'Serato/Rekordbox Style'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
