import { DeckState } from '@/types/dj';
import Waveform from './Waveform';
import JogWheel from './JogWheel';
import TransportControls from './TransportControls';
import EQKnobs from './EQKnobs';
import VolumeFader from './VolumeFader';
import TrackInfo from './TrackInfo';
import { cn } from '@/lib/utils';

interface DeckProps {
  deckId: 'a' | 'b';
  state: DeckState;
  onStateChange: (newState: Partial<DeckState>) => void;
}

const Deck = ({ deckId, state, onStateChange }: DeckProps) => {
  const handlePlay = () => {
    onStateChange({ isPlaying: !state.isPlaying });
  };

  const handleCue = () => {
    onStateChange({ position: state.cuePoint });
  };

  const handleSync = () => {
    onStateChange({ isSynced: !state.isSynced });
  };

  const handleVolumeChange = (value: number) => {
    onStateChange({ volume: value });
  };

  const handleEQChange = (type: 'high' | 'mid' | 'low', value: number) => {
    onStateChange({ 
      eq: { ...state.eq, [type]: value } 
    });
  };

  const handleFilterChange = (value: number) => {
    onStateChange({ filter: value });
  };

  return (
    <div className={cn(
      'deck-panel flex flex-col gap-4',
      deckId === 'a' ? 'deck-a-panel' : 'deck-b-panel'
    )}>
      {/* Deck Label */}
      <div className="flex items-center justify-between">
        <div className={cn(
          'font-display text-2xl font-bold',
          deckId === 'a' ? 'text-deck-a' : 'text-deck-b'
        )}>
          DECK {deckId.toUpperCase()}
        </div>
        {/* Pitch/Tempo */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground">PITCH</div>
          <div className={cn(
            'font-display text-lg font-semibold',
            state.pitch !== 0 
              ? (state.pitch > 0 ? 'text-[hsl(var(--sync-active))]' : 'text-destructive')
              : 'text-muted-foreground'
          )}>
            {state.pitch > 0 ? '+' : ''}{state.pitch.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Track Info */}
      <TrackInfo 
        deck={deckId}
        track={state.track}
        bpm={state.bpm}
        position={state.position}
      />

      {/* Waveform */}
      <Waveform 
        deck={deckId}
        isPlaying={state.isPlaying}
        position={state.position}
        duration={state.track?.duration || 300}
      />

      {/* Controls Section */}
      <div className="flex items-start gap-6">
        {/* Jog Wheel */}
        <JogWheel 
          deck={deckId}
          isPlaying={state.isPlaying}
          rotation={state.position * 6} // 6 degrees per second
        />

        <div className="flex flex-col gap-4 flex-1">
          {/* Transport Controls */}
          <TransportControls
            deck={deckId}
            isPlaying={state.isPlaying}
            isSynced={state.isSynced}
            onPlay={handlePlay}
            onCue={handleCue}
            onSync={handleSync}
          />

          {/* EQ and Volume Section */}
          <div className="flex items-stretch gap-6">
            <EQKnobs
              deck={deckId}
              high={state.eq.high}
              mid={state.eq.mid}
              low={state.eq.low}
              filter={state.filter}
              onHighChange={(v) => handleEQChange('high', v)}
              onMidChange={(v) => handleEQChange('mid', v)}
              onLowChange={(v) => handleEQChange('low', v)}
              onFilterChange={handleFilterChange}
            />
            <VolumeFader
              deck={deckId}
              value={state.volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deck;
