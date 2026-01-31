import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface WaveformProps {
  deck: 'a' | 'b';
  isPlaying: boolean;
  position: number;
  duration: number;
}

const Waveform = ({ deck, isPlaying, position, duration }: WaveformProps) => {
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

    // Draw playhead
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playheadPosition - 1, 0, 2, height);

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

  }, [waveformData, position, duration, deck]);

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
    </div>
  );
};

export default Waveform;
