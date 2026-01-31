import { cn } from '@/lib/utils';
import { HotCue } from '@/types/dj';

interface HotCuePadsProps {
  deck: 'a' | 'b';
  hotCues: HotCue[];
  onSetCue: (index: number) => void;
  onDeleteCue: (index: number) => void;
}

const HotCuePads = ({ deck, hotCues, onSetCue, onDeleteCue }: HotCuePadsProps) => {
  const pads = [0, 1, 2, 3, 4, 5, 6, 7];
  const colors = ['#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#FFC107', '#00BCD4', '#E91E63', '#8BC34A'];

  const getCueForPad = (index: number) => hotCues.find(c => c.id === index);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-[10px] font-semibold uppercase tracking-wider',
          deck === 'a' ? 'text-deck-a' : 'text-deck-b'
        )}>
          Hot Cues
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {pads.map((index) => {
          const cue = getCueForPad(index);
          return (
            <button
              key={index}
              onClick={() => onSetCue(index)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (cue) onDeleteCue(index);
              }}
              className={cn(
                'h-8 rounded text-[10px] font-bold transition-all',
                'hover:scale-105 active:scale-95',
                cue 
                  ? 'text-background shadow-lg' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
              style={cue ? { 
                backgroundColor: cue.color,
                boxShadow: `0 0 10px ${cue.color}50`
              } : undefined}
              title={cue ? `${cue.label} (Right-click to delete)` : `Set Hot Cue ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HotCuePads;
