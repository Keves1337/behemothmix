import { cn } from '@/lib/utils';
import { Track } from '@/types/dj';
import { Music2, Volume2, VolumeX } from 'lucide-react';

interface TrackInfoProps {
  deck: 'a' | 'b';
  track: Track | null;
  bpm: number;
  position: number;
  hasAudio?: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TrackInfo = ({ deck, track, bpm, position, hasAudio }: TrackInfoProps) => {
  const deckColor = deck === 'a' ? 'text-deck-a' : 'text-deck-b';
  const remaining = track ? track.duration - position : 0;

  return (
    <div className={cn(
      'flex flex-col gap-2 p-3 rounded-lg bg-card/50 backdrop-blur-sm',
      deck === 'a' ? 'border-l-2 border-deck-a' : 'border-l-2 border-deck-b'
    )}>
      {track ? (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn('font-semibold text-sm track-info', deckColor)}>
                  {track.title}
                </h3>
                {hasAudio ? (
                  <span title="Audio ready"><Volume2 className="w-3 h-3 text-primary" /></span>
                ) : (
                  <span title="No audio - UI simulation only"><VolumeX className="w-3 h-3 text-muted-foreground/50" /></span>
                )}
              </div>
              <p className="text-xs text-muted-foreground track-info">
                {track.artist}
              </p>
            </div>
            <div className="text-right">
              <div className="bpm-display">
                <span className={deckColor}>{bpm.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase">BPM</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">
              {formatTime(position)}
            </span>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {track.key}
            </span>
            <span className="text-muted-foreground font-mono">
              -{formatTime(remaining)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 py-4">
          <Music2 className={cn('w-8 h-8', deckColor, 'opacity-30')} />
          <div>
            <p className="text-sm text-muted-foreground">No track loaded</p>
            <p className="text-xs text-muted-foreground/60">Drag a track here or import MP3 files</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackInfo;
