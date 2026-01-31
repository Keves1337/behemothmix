import { cn } from '@/lib/utils';

interface EQKnobsProps {
  deck: 'a' | 'b';
  high: number;
  mid: number;
  low: number;
  filter: number;
  onHighChange: (value: number) => void;
  onMidChange: (value: number) => void;
  onLowChange: (value: number) => void;
  onFilterChange: (value: number) => void;
}

interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}

const Knob = ({ label, value, onChange, color }: KnobProps) => {
  const rotation = (value - 50) * 2.7; // -135 to 135 degrees

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn('eq-label', `text-${color}`)}>{label}</span>
      <div 
        className="knob"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          borderTop: `2px solid hsl(var(--${color === 'eq-high' ? 'eq-high' : color === 'eq-mid' ? 'eq-mid' : 'eq-low'}))`
        }}
      />
      <span className="text-[10px] text-muted-foreground">
        {value > 50 ? `+${value - 50}` : value - 50}
      </span>
    </div>
  );
};

const EQKnobs = ({ 
  deck, 
  high, 
  mid, 
  low, 
  filter,
  onHighChange, 
  onMidChange, 
  onLowChange,
  onFilterChange 
}: EQKnobsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Knob 
          label="HI" 
          value={high} 
          onChange={onHighChange} 
          color="eq-high"
        />
        <Knob 
          label="MID" 
          value={mid} 
          onChange={onMidChange} 
          color="eq-mid"
        />
        <Knob 
          label="LOW" 
          value={low} 
          onChange={onLowChange} 
          color="eq-low"
        />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className={cn(
            'eq-label',
            deck === 'a' ? 'text-deck-a' : 'text-deck-b'
          )}>FILTER</span>
          <div 
            className={cn(
              'knob',
              deck === 'a' ? 'border-t-2 border-deck-a' : 'border-t-2 border-deck-b'
            )}
            style={{ transform: `rotate(${(filter - 50) * 2.7}deg)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EQKnobs;
