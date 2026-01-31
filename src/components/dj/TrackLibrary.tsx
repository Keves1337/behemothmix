import { useState } from 'react';
import { Track } from '@/types/dj';
import { cn } from '@/lib/utils';
import { Search, Music, Folder, Clock, Hash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportTracksModal from './ImportTracksModal';

interface TrackLibraryProps {
  tracks: Track[];
  onLoadToDeck: (track: Track, deck: 'a' | 'b') => void;
  onAddTracks?: (tracks: Track[]) => void;
}

const TrackLibrary = ({ tracks, onLoadToDeck, onAddTracks }: TrackLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-card/50 rounded-lg border border-border">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">LIBRARY</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-7 text-xs gap-1"
            onClick={() => setImportModalOpen(true)}
          >
            <Plus className="w-3 h-3" />
            Import
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-muted rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
        <div className="flex items-center gap-1">
          <Music className="w-3 h-3" />
          <span>Title / Artist</span>
        </div>
        <div className="flex items-center gap-1 w-16">
          <Hash className="w-3 h-3" />
          <span>BPM</span>
        </div>
        <div className="w-12 text-center">KEY</div>
        <div className="flex items-center gap-1 w-14">
          <Clock className="w-3 h-3" />
          <span>Time</span>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredTracks.map((track) => (
          <div
            key={track.id}
            className={cn(
              'library-item grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center group relative',
              selectedTrack === track.id && 'library-item-selected'
            )}
            onClick={() => setSelectedTrack(track.id)}
            onDoubleClick={() => onLoadToDeck(track, 'a')}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{track.title}</p>
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            </div>
            <div className="w-16 text-sm font-mono text-muted-foreground">
              {track.bpm.toFixed(1)}
            </div>
            <div className="w-12 text-xs text-center bg-muted px-1.5 py-0.5 rounded">
              {track.key}
            </div>
            <div className="w-14 text-sm font-mono text-muted-foreground">
              {formatDuration(track.duration)}
            </div>
            
            {/* Load buttons on hover */}
            <div className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 transition-opacity',
              'group-hover:opacity-100'
            )}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadToDeck(track, 'a');
                }}
                className="px-2 py-1 text-[10px] font-bold bg-deck-a/20 text-deck-a rounded hover:bg-deck-a/30"
              >
                A
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadToDeck(track, 'b');
                }}
                className="px-2 py-1 text-[10px] font-bold bg-deck-b/20 text-deck-b rounded hover:bg-deck-b/30"
              >
                B
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Track Count */}
      <div className="px-3 py-2 border-t border-border text-xs text-muted-foreground">
        {filteredTracks.length} tracks
      </div>

      {/* Import Modal */}
      <ImportTracksModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportTracks={onAddTracks || (() => {})}
      />
    </div>
  );
};

export default TrackLibrary;
