import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { HotCue, LoopState } from '@/types/dj';

interface WaveformProps {
  deck: 'a' | 'b';
  isPlaying: boolean;
  position: number;
  duration: number;
  hotCues?: HotCue[];
  loop?: LoopState;
}

const Waveform = ({ deck, isPlaying, position, duration, hotCues = [], loop }: WaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate random waveform data for visualization
  const waveformData = useMemo(() => {
    const data: number[] = [];
    for (let i = 0; i < 200; i++) {
      const base = Math.sin(i * 0.1) * 0.3;
      const noise = Math.random() * 0.7;
      data.push(Math.abs(base + noise));
    }
    return data;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;
    const playheadPosition = (position / duration) * width;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw loop region if active
    if (loop?.active) {
      const loopStart = (loop.inPoint / duration) * width;
      const loopEnd = (loop.outPoint / duration) * width;
      ctx.fillStyle = deck === 'a' ? 'rgba(0, 200, 255, 0.15)' : 'rgba(255, 150, 0, 0.15)';
      ctx.fillRect(loopStart, 0, loopEnd - loopStart, height);
      
      // Loop boundaries
      ctx.strokeStyle = deck === 'a' ? 'hsl(190, 100%, 50%)' : 'hsl(25, 100%, 50%)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(loopStart, 0);
      ctx.lineTo(loopStart, height);
      ctx.moveTo(loopEnd, 0);
      ctx.lineTo(loopEnd, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw waveform
    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;

      // Color based on position relative to playhead
      const isPast = x < playheadPosition;
      const deckColor = deck === 'a' ? 'hsl(190, 100%, 50%)' : 'hsl(25, 100%, 50%)';
      const pastColor = deck === 'a' ? 'hsl(190, 60%, 30%)' : 'hsl(25, 60%, 30%)';
      
      ctx.fillStyle = isPast ? pastColor : deckColor;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw hot cue markers
    hotCues.forEach(cue => {
      const cueX = (cue.position / duration) * width;
      ctx.fillStyle = cue.color;
      ctx.beginPath();
      ctx.moveTo(cueX, 0);
      ctx.lineTo(cueX + 6, 0);
      ctx.lineTo(cueX, 12);
      ctx.closePath();
      ctx.fill();
      
      // Vertical line
      ctx.strokeStyle = cue.color + '80';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cueX, 0);
      ctx.lineTo(cueX, height);
      ctx.stroke();
    });

    // Draw playhead
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.fillRect(playheadPosition - 1, 0, 2, height);
    ctx.shadowBlur = 0;

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

  }, [waveformData, position, duration, deck, hotCues, loop]);

  return (
    <div className={cn(
      'waveform-container',
      deck === 'a' ? 'border border-deck-a/20' : 'border border-deck-b/20'
    )}>
      <canvas
        ref={canvasRef}
        width={800}
        height={96}
        className="w-full h-full"
      />
      {isPlaying && (
        <div className={cn(
          'absolute top-0 left-0 w-full h-full opacity-20',
          deck === 'a' ? 'bg-gradient-to-r from-deck-a/20 to-transparent' : 'bg-gradient-to-r from-deck-b/20 to-transparent'
        )} />
      )}
      {/* Time display */}
      <div className="absolute bottom-1 left-2 text-[10px] font-mono text-white/70">
        {Math.floor(position / 60)}:{Math.floor(position % 60).toString().padStart(2, '0')}
      </div>
      <div className="absolute bottom-1 right-2 text-[10px] font-mono text-white/70">
        -{Math.floor((duration - position) / 60)}:{Math.floor((duration - position) % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default Waveform;
