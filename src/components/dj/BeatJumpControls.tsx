import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BeatJumpControlsProps {
  deck: 'a' | 'b';
  beatJumpSize: number;
  onBeatJump: (direction: 1 | -1) => void;
  onSizeChange: (size: number) => void;
}

const BeatJumpControls = ({ deck, beatJumpSize, onBeatJump, onSizeChange }: BeatJumpControlsProps) => {
  const sizes = [1, 2, 4, 8, 16, 32];

  return (
    <div className="space-y-2">
      <span className={cn(
        'text-[10px] font-semibold uppercase tracking-wider',
        deck === 'a' ? 'text-deck-a' : 'text-deck-b'
      )}>
        Beat Jump
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onBeatJump(-1)}
          className={cn(
            'h-8 w-8 rounded flex items-center justify-center transition-all',
            'bg-muted/50 hover:bg-muted active:scale-95',
            deck === 'a' ? 'hover:text-deck-a' : 'hover:text-deck-b'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <select
          value={beatJumpSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className={cn(
            'flex-1 h-8 bg-muted/50 rounded text-xs text-center appearance-none cursor-pointer',
            'focus:outline-none focus:ring-1',
            deck === 'a' ? 'focus:ring-deck-a' : 'focus:ring-deck-b'
          )}
        >
          {sizes.map(size => (
            <option key={size} value={size}>{size} beats</option>
          ))}
        </select>
        <button
          onClick={() => onBeatJump(1)}
          className={cn(
            'h-8 w-8 rounded flex items-center justify-center transition-all',
            'bg-muted/50 hover:bg-muted active:scale-95',
            deck === 'a' ? 'hover:text-deck-a' : 'hover:text-deck-b'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BeatJumpControls;
