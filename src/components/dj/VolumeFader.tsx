import { cn } from '@/lib/utils';

interface VolumeFaderProps {
  deck: 'a' | 'b';
  value: number;
  onChange: (value: number) => void;
}

const VolumeFader = ({ deck, value, onChange }: VolumeFaderProps) => {
  const position = 100 - value; // Invert for visual

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={cn(
        'text-[10px] font-semibold uppercase tracking-wider',
        deck === 'a' ? 'text-deck-a' : 'text-deck-b'
      )}>
        VOL
      </span>
      <div className="fader-vertical h-32">
        {/* Level indicators */}
        <div 
          className={cn(
            'absolute bottom-0 left-0 right-0 rounded-full transition-all',
            deck === 'a' ? 'bg-deck-a/50' : 'bg-deck-b/50'
          )}
          style={{ height: `${value}%` }}
        />
        {/* Thumb */}
        <div 
          className="fader-thumb"
          style={{ top: `${position}%`, transform: 'translateY(-50%)' }}
        />
        {/* Scale marks */}
        {[0, 25, 50, 75, 100].map((mark) => (
          <div 
            key={mark}
            className="absolute -right-2 w-1.5 h-0.5 bg-muted-foreground/30"
            style={{ top: `${100 - mark}%` }}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">{value}%</span>
    </div>
  );
};

export default VolumeFader;
