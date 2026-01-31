import { cn } from '@/lib/utils';
import { Key, Magnet, Layers } from 'lucide-react';

interface DeckModeControlsProps {
  deck: 'a' | 'b';
  keyLock: boolean;
  quantize: boolean;
  slipMode: boolean;
  onKeyLockToggle: () => void;
  onQuantizeToggle: () => void;
  onSlipModeToggle: () => void;
}

const DeckModeControls = ({ 
  deck, 
  keyLock, 
  quantize, 
  slipMode,
  onKeyLockToggle,
  onQuantizeToggle,
  onSlipModeToggle,
}: DeckModeControlsProps) => {
  return (
    <div className="flex gap-1">
      <button
        onClick={onKeyLockToggle}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all',
          keyLock
            ? deck === 'a' ? 'bg-deck-a/20 text-deck-a' : 'bg-deck-b/20 text-deck-b'
            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
        )}
        title="Key Lock - Keep original key when changing tempo"
      >
        <Key className="w-3 h-3" />
        KEY
      </button>
      <button
        onClick={onQuantizeToggle}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all',
          quantize
            ? 'bg-[hsl(var(--sync-active))]/20 text-[hsl(var(--sync-active))]'
            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
        )}
        title="Quantize - Snap actions to beat grid"
      >
        <Magnet className="w-3 h-3" />
        QTZ
      </button>
      <button
        onClick={onSlipModeToggle}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all',
          slipMode
            ? 'bg-accent/20 text-accent'
            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
        )}
        title="Slip Mode - Track continues in background during scratches/loops"
      >
        <Layers className="w-3 h-3" />
        SLIP
      </button>
    </div>
  );
};

export default DeckModeControls;
