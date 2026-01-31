import { DeckState, HotCue, LoopState, Track } from '@/types/dj';
import Waveform from './Waveform';
import JogWheel from './JogWheel';
import TransportControls from './TransportControls';
import EQKnobs from './EQKnobs';
import VolumeFader from './VolumeFader';
import TrackInfo from './TrackInfo';
import HotCuePads from './HotCuePads';
import LoopControls from './LoopControls';
import BeatJumpControls from './BeatJumpControls';
import DeckModeControls from './DeckModeControls';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DeckProps {
  deckId: 'a' | 'b';
  state: DeckState;
  onStateChange: (newState: Partial<DeckState>) => void;
  onSetHotCue?: (index: number) => void;
  onDeleteHotCue?: (index: number) => void;
  onSetLoop?: (beats: number) => void;
  onToggleLoop?: () => void;
  onBeatJump?: (direction: 1 | -1) => void;
  onTrackDrop?: (track: Track) => void;
}

const Deck = ({ 
  deckId, 
  state, 
  onStateChange,
  onSetHotCue,
  onDeleteHotCue,
  onSetLoop,
  onToggleLoop,
  onBeatJump,
  onTrackDrop,
}: DeckProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const trackData = e.dataTransfer.getData('application/json');
      if (trackData) {
        const track: Track = JSON.parse(trackData);
        onTrackDrop?.(track);
      }
    } catch (err) {
      console.error('Failed to parse dropped track:', err);
    }
  };
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
    <div 
      className={cn(
        'deck-panel flex flex-col gap-3 transition-all',
        deckId === 'a' ? 'deck-a-panel' : 'deck-b-panel',
        isDragOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Deck Label & Mode Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'font-display text-2xl font-bold',
            deckId === 'a' ? 'text-deck-a' : 'text-deck-b'
          )}>
            DECK {deckId.toUpperCase()}
          </div>
          <DeckModeControls
            deck={deckId}
            keyLock={state.keyLock}
            quantize={state.quantize}
            slipMode={state.slipMode}
            onKeyLockToggle={() => onStateChange({ keyLock: !state.keyLock })}
            onQuantizeToggle={() => onStateChange({ quantize: !state.quantize })}
            onSlipModeToggle={() => onStateChange({ slipMode: !state.slipMode })}
          />
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
        hotCues={state.hotCues}
        loop={state.loop}
      />

      {/* Performance Pads Section */}
      <div className="grid grid-cols-2 gap-3">
        <HotCuePads
          deck={deckId}
          hotCues={state.hotCues}
          onSetCue={onSetHotCue || (() => {})}
          onDeleteCue={onDeleteHotCue || (() => {})}
        />
        <div className="space-y-3">
          <LoopControls
            deck={deckId}
            loop={state.loop}
            onSetLoop={onSetLoop || (() => {})}
            onToggleLoop={onToggleLoop || (() => {})}
          />
          <BeatJumpControls
            deck={deckId}
            beatJumpSize={state.beatJumpSize}
            onBeatJump={onBeatJump || (() => {})}
            onSizeChange={(size) => onStateChange({ beatJumpSize: size })}
          />
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex items-start gap-4">
        {/* Jog Wheel */}
        <JogWheel 
          deck={deckId}
          isPlaying={state.isPlaying}
          rotation={state.position * 6}
        />

        <div className="flex flex-col gap-3 flex-1">
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
          <div className="flex items-stretch gap-4">
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
