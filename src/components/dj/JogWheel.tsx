import { cn } from '@/lib/utils';

interface JogWheelProps {
  deck: 'a' | 'b';
  isPlaying: boolean;
  rotation: number;
}

const JogWheel = ({ deck, isPlaying, rotation }: JogWheelProps) => {
  return (
    <div className={cn(
      'jog-wheel w-36 h-36',
      deck === 'a' ? 'jog-wheel-a' : 'jog-wheel-b'
    )}>
      <div 
        className="jog-wheel-inner"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="vinyl-groove" />
        <div className={cn(
          'w-2 h-2 rounded-full absolute top-6',
          deck === 'a' ? 'bg-deck-a' : 'bg-deck-b',
          isPlaying && 'animate-pulse-glow'
        )} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'w-8 h-8 rounded-full',
            deck === 'a' ? 'bg-deck-a/20' : 'bg-deck-b/20'
          )} />
        </div>
      </div>
    </div>
  );
};

export default JogWheel;
