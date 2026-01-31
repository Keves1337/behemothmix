import { cn } from '@/lib/utils';
import { LoopState } from '@/types/dj';
import { RotateCcw } from 'lucide-react';

interface LoopControlsProps {
  deck: 'a' | 'b';
  loop: LoopState;
  onSetLoop: (beats: number) => void;
  onToggleLoop: () => void;
}

const LoopControls = ({ deck, loop, onSetLoop, onToggleLoop }: LoopControlsProps) => {
  const loopSizes = [0.25, 0.5, 1, 2, 4, 8, 16, 32];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-[10px] font-semibold uppercase tracking-wider',
          deck === 'a' ? 'text-deck-a' : 'text-deck-b'
        )}>
          Loop
        </span>
        <button
          onClick={onToggleLoop}
          className={cn(
            'p-1 rounded transition-colors',
            loop.active 
              ? 'bg-[hsl(var(--sync-active))] text-background' 
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          )}
          title={loop.active ? 'Exit Loop' : 'Reactivate Loop'}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {loopSizes.map((size) => (
          <button
            key={size}
            onClick={() => onSetLoop(size)}
            className={cn(
              'h-6 rounded text-[9px] font-bold transition-all',
              'hover:scale-105 active:scale-95',
              loop.active && loop.length === size
                ? deck === 'a' 
                  ? 'bg-deck-a text-background' 
                  : 'bg-deck-b text-background'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {size < 1 ? `1/${1/size}` : size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoopControls;
