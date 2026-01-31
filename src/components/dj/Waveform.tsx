import { useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { HotCue, LoopState } from '@/types/dj';

interface WaveformProps {
  deck: 'a' | 'b';
  isPlaying: boolean;
  position: number;
  duration: number;
  hotCues?: HotCue[];
  loop?: LoopState;
  waveformData?: number[] | null;
  realtimeData?: Float32Array | null;
  hasAudio?: boolean;
}

const Waveform = ({ 
  deck, 
  isPlaying, 
  position, 
  duration, 
  hotCues = [], 
  loop,
  waveformData,
  realtimeData,
  hasAudio = false
}: WaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Generate fallback waveform data for demo tracks
  const fallbackWaveformData = useMemo(() => {
    const data: number[] = [];
    for (let i = 0; i < 400; i++) {
      const base = Math.sin(i * 0.1) * 0.3;
      const noise = Math.random() * 0.7;
      data.push(Math.abs(base + noise));
    }
    return data;
  }, []);

  // Use real waveform data if available, otherwise fallback
  const displayWaveform = waveformData && waveformData.length > 0 ? waveformData : fallbackWaveformData;

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / displayWaveform.length;
    const playheadPosition = duration > 0 ? (position / duration) * width : 0;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw loop region if active
    if (loop?.active && duration > 0) {
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

    // Draw main waveform
    const deckColor = deck === 'a' ? 'hsl(190, 100%, 50%)' : 'hsl(25, 100%, 50%)';
    const pastColor = deck === 'a' ? 'hsl(190, 60%, 30%)' : 'hsl(25, 60%, 30%)';
    const futureColorBright = deck === 'a' ? 'hsl(190, 100%, 55%)' : 'hsl(25, 100%, 55%)';
    
    displayWaveform.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.85;
      const y = (height - barHeight) / 2;

      // Color based on position relative to playhead
      const isPast = x < playheadPosition;
      
      // Create gradient effect for future waveform
      if (!isPast && hasAudio) {
        const distanceFromPlayhead = (x - playheadPosition) / width;
        const alpha = 1 - distanceFromPlayhead * 0.3;
        ctx.fillStyle = deck === 'a' 
          ? `hsla(190, 100%, 50%, ${alpha})`
          : `hsla(25, 100%, 50%, ${alpha})`;
      } else {
        ctx.fillStyle = isPast ? pastColor : deckColor;
      }
      
      ctx.fillRect(x, y, Math.max(barWidth - 0.5, 1), barHeight);
    });

    // Draw real-time waveform overlay when playing with audio
    if (isPlaying && hasAudio && realtimeData && realtimeData.length > 0) {
      const sliceWidth = 150; // Width of real-time display area around playhead
      const startX = Math.max(0, playheadPosition - sliceWidth / 2);
      const endX = Math.min(width, playheadPosition + sliceWidth / 2);
      
      ctx.strokeStyle = deck === 'a' 
        ? 'rgba(0, 255, 255, 0.8)' 
        : 'rgba(255, 200, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const dataLen = realtimeData.length;
      const step = Math.ceil(dataLen / sliceWidth);
      
      for (let i = 0; i < sliceWidth; i++) {
        const dataIndex = Math.min(i * step, dataLen - 1);
        const value = realtimeData[dataIndex];
        const x = startX + i;
        const y = height / 2 + (value * height * 0.4);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw hot cue markers
    if (duration > 0) {
      hotCues.forEach(cue => {
        const cueX = (cue.position / duration) * width;
        ctx.fillStyle = cue.color;
        ctx.beginPath();
        ctx.moveTo(cueX, 0);
        ctx.lineTo(cueX + 8, 0);
        ctx.lineTo(cueX, 14);
        ctx.closePath();
        ctx.fill();
        
        // Vertical line
        ctx.strokeStyle = cue.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cueX, 0);
        ctx.lineTo(cueX, height);
        ctx.stroke();
      });
    }

    // Draw playhead
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.fillRect(playheadPosition - 1.5, 0, 3, height);
    ctx.shadowBlur = 0;

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Audio indicator
    if (hasAudio) {
      ctx.fillStyle = deck === 'a' ? 'hsl(190, 100%, 50%)' : 'hsl(25, 100%, 50%)';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('🔊', 8, 14);
    }
  }, [displayWaveform, position, duration, deck, hotCues, loop, isPlaying, hasAudio, realtimeData]);

  // Animation loop for smooth real-time updates
  useEffect(() => {
    if (isPlaying && hasAudio) {
      const animate = () => {
        drawWaveform();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      drawWaveform();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, hasAudio, drawWaveform]);

  // Redraw when position changes (for non-playing state)
  useEffect(() => {
    if (!isPlaying || !hasAudio) {
      drawWaveform();
    }
  }, [position, drawWaveform, isPlaying, hasAudio]);

  return (
    <div className={cn(
      'waveform-container relative',
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
          'absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none',
          deck === 'a' ? 'bg-gradient-to-r from-deck-a/20 to-transparent' : 'bg-gradient-to-r from-deck-b/20 to-transparent'
        )} />
      )}
      {/* Time display */}
      <div className="absolute bottom-1 left-2 text-[10px] font-mono text-white/70">
        {Math.floor(position / 60)}:{Math.floor(position % 60).toString().padStart(2, '0')}.{Math.floor((position % 1) * 10)}
      </div>
      <div className="absolute bottom-1 right-2 text-[10px] font-mono text-white/70">
        -{Math.floor((duration - position) / 60)}:{Math.floor((duration - position) % 60).toString().padStart(2, '0')}
      </div>
      {/* Waveform type indicator */}
      {waveformData && waveformData.length > 0 && (
        <div className="absolute top-1 right-2 text-[8px] font-mono text-white/50 uppercase">
          Analyzed
        </div>
      )}
    </div>
  );
};

export default Waveform;
