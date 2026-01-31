import { useDJController } from '@/hooks/useDJController';
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
  } = useDJController();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header 
        masterVolume={mixer.masterVolume}
        onMasterVolumeChange={(value) => updateMixer({ masterVolume: value })}
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
          <span>Pioneer DDJ-SX1 Support • Connect via USB to enable hardware control</span>
          <span className="font-mono">Web MIDI API Ready</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
