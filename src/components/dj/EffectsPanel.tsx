import { cn } from '@/lib/utils';
import { Waves, Sparkles, Wind, Filter } from 'lucide-react';

interface EffectsPanelProps {
  deck: 'a' | 'b';
}

const effects = [
  { id: 'echo', name: 'ECHO', icon: Waves },
  { id: 'reverb', name: 'REVERB', icon: Sparkles },
  { id: 'flanger', name: 'FLANGER', icon: Wind },
  { id: 'filter', name: 'FILTER', icon: Filter },
];

const EffectsPanel = ({ deck }: EffectsPanelProps) => {
  return (
    <div className={cn(
      'p-3 rounded-lg bg-card/30 border',
      deck === 'a' ? 'border-deck-a/20' : 'border-deck-b/20'
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={cn(
          'w-4 h-4',
          deck === 'a' ? 'text-deck-a' : 'text-deck-b'
        )} />
        <span className="text-xs font-semibold uppercase tracking-wider">FX {deck.toUpperCase()}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {effects.map((effect) => (
          <button
            key={effect.id}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-md transition-all',
              'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <effect.icon className="w-4 h-4" />
            <span className="text-[9px] font-medium">{effect.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EffectsPanel;
