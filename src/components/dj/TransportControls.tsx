import { Play, Pause, SkipBack, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransportControlsProps {
  deck: 'a' | 'b';
  isPlaying: boolean;
  isSynced: boolean;
  onPlay: () => void;
  onCue: () => void;
  onSync: () => void;
}

const TransportControls = ({ 
  deck, 
  isPlaying, 
  isSynced, 
  onPlay, 
  onCue, 
  onSync 
}: TransportControlsProps) => {
  const deckColor = deck === 'a' ? 'deck-a' : 'deck-b';

  return (
    <div className="flex items-center gap-3">
      {/* Sync Button */}
      <button
        onClick={onSync}
        className={cn(
          'px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all',
          isSynced 
            ? 'bg-[hsl(var(--sync-active))] text-background shadow-[0_0_15px_hsl(120,100%,45%,0.5)]' 
            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
        )}
      >
        SYNC
      </button>

      {/* Cue Button */}
      <button
        onClick={onCue}
        className={cn(
          'transport-btn',
          deck === 'a' 
            ? 'hover:border-deck-a border border-transparent' 
            : 'hover:border-deck-b border border-transparent'
        )}
      >
        <SkipBack className="w-5 h-5" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={onPlay}
        className={cn(
          'transport-btn w-14 h-14',
          isPlaying && 'transport-btn-active'
        )}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-1" />
        )}
      </button>

      {/* Loop Button */}
      <button
        className={cn(
          'transport-btn',
          deck === 'a' 
            ? 'hover:border-deck-a border border-transparent' 
            : 'hover:border-deck-b border border-transparent'
        )}
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TransportControls;
