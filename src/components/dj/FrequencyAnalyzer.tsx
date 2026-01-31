import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface FrequencyAnalyzerProps {
  deck: 'a' | 'b';
  isPlaying: boolean;
  hasAudio: boolean;
  getFrequencyData: () => Uint8Array | null;
}

const FrequencyAnalyzer = ({ deck, isPlaying, hasAudio, getFrequencyData }: FrequencyAnalyzerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const smoothedDataRef = useRef<number[]>(new Array(64).fill(0));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get frequency data
    const frequencyData = getFrequencyData();
    
    if (!frequencyData || !isPlaying || !hasAudio) {
      // Draw idle state
      drawIdleState(ctx, width, height, deck);
      return;
    }

    // Process frequency data into bands
    const numBars = 32;
    const barWidth = width / numBars - 2;
    const dataStep = Math.floor(frequencyData.length / numBars);

    // Update smoothed data with lerp
    for (let i = 0; i < numBars; i++) {
      const dataIndex = i * dataStep;
      const value = frequencyData[dataIndex] / 255;
      smoothedDataRef.current[i] = smoothedDataRef.current[i] * 0.7 + value * 0.3;
    }

    // Define frequency band colors
    const deckHue = deck === 'a' ? 190 : 25;
    
    // Draw bars
    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + 2) + 1;
      const barHeight = smoothedDataRef.current[i] * height * 0.9;
      const y = height - barHeight;

      // Gradient based on frequency band
      let hue = deckHue;
      let saturation = 100;
      let lightness = 50;
      
      if (i < numBars * 0.25) {
        // Bass - deeper color
        lightness = 40;
      } else if (i < numBars * 0.6) {
        // Mid - main color
        lightness = 50;
      } else {
        // High - brighter
        lightness = 60;
        saturation = 80;
      }

      // Create gradient
      const gradient = ctx.createLinearGradient(x, height, x, y);
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness - 10}%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`);
      gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 1)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Glow effect for peaks
      if (smoothedDataRef.current[i] > 0.7) {
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, y, barWidth, Math.min(4, barHeight));
        ctx.shadowBlur = 0;
      }
    }

    // Draw level indicators (Bass, Mid, High)
    drawLevelIndicators(ctx, frequencyData, width, height, deckHue);

  }, [deck, isPlaying, hasAudio, getFrequencyData]);

  const drawIdleState = (ctx: CanvasRenderingContext2D, width: number, height: number, deck: 'a' | 'b') => {
    const numBars = 32;
    const barWidth = width / numBars - 2;
    const deckHue = deck === 'a' ? 190 : 25;

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + 2) + 1;
      const barHeight = 4;
      const y = height - barHeight - 2;

      ctx.fillStyle = `hsla(${deckHue}, 50%, 30%, 0.5)`;
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    // Draw "No Signal" text
    ctx.fillStyle = `hsla(${deckHue}, 30%, 50%, 0.6)`;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NO SIGNAL', width / 2, height / 2);
  };

  const drawLevelIndicators = (
    ctx: CanvasRenderingContext2D, 
    frequencyData: Uint8Array, 
    width: number, 
    height: number,
    deckHue: number
  ) => {
    const dataLen = frequencyData.length;
    
    // Calculate band averages
    const bassEnd = Math.floor(dataLen * 0.1);
    const midEnd = Math.floor(dataLen * 0.4);
    
    let bassSum = 0, midSum = 0, highSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += frequencyData[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += frequencyData[i];
    }
    for (let i = midEnd; i < dataLen; i++) {
      highSum += frequencyData[i];
    }
    
    const bassLevel = bassSum / (bassEnd * 255);
    const midLevel = midSum / ((midEnd - bassEnd) * 255);
    const highLevel = highSum / ((dataLen - midEnd) * 255);

    // Draw band labels at top
    const labelY = 12;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    
    // Bass
    const bassColor = bassLevel > 0.6 ? `hsl(${deckHue}, 100%, 60%)` : `hsl(${deckHue}, 60%, 40%)`;
    ctx.fillStyle = bassColor;
    ctx.fillText(`BASS ${Math.round(bassLevel * 100)}%`, 4, labelY);
    
    // Mid
    const midColor = midLevel > 0.5 ? `hsl(${deckHue}, 100%, 60%)` : `hsl(${deckHue}, 60%, 40%)`;
    ctx.fillStyle = midColor;
    ctx.textAlign = 'center';
    ctx.fillText(`MID ${Math.round(midLevel * 100)}%`, width / 2, labelY);
    
    // High
    const highColor = highLevel > 0.4 ? `hsl(${deckHue}, 100%, 60%)` : `hsl(${deckHue}, 60%, 40%)`;
    ctx.fillStyle = highColor;
    ctx.textAlign = 'right';
    ctx.fillText(`HIGH ${Math.round(highLevel * 100)}%`, width - 4, labelY);
  };

  useEffect(() => {
    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying && hasAudio) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      draw(); // Draw idle state once
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, hasAudio, draw]);

  return (
    <div className={cn(
      'relative rounded-lg overflow-hidden bg-black/40 border',
      deck === 'a' ? 'border-deck-a/30' : 'border-deck-b/30'
    )}>
      <canvas
        ref={canvasRef}
        width={200}
        height={60}
        className="w-full h-full"
      />
      {/* Corner label */}
      <div className={cn(
        'absolute bottom-1 right-1 text-[8px] font-mono uppercase opacity-50',
        deck === 'a' ? 'text-deck-a' : 'text-deck-b'
      )}>
        SPECTRUM
      </div>
    </div>
  );
};

export default FrequencyAnalyzer;
