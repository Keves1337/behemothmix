import { useState, useRef } from 'react';
import { Track } from '@/types/dj';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Youtube, Music, Loader2, X, FolderOpen, Disc, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImportTracksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportTracks: (tracks: Track[]) => void;
}

interface PendingTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  key: string;
  file?: File;
}

const ImportTracksModal = ({ open, onOpenChange, onImportTracks }: ImportTracksModalProps) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [spotifyPlaylistInfo, setSpotifyPlaylistInfo] = useState<{title: string; thumbnail: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: PendingTrack[] = [];
    
    Array.from(files).forEach((file, index) => {
      if (file.type === 'audio/mpeg' || file.type === 'audio/wav' || file.name.endsWith('.mp3') || file.name.endsWith('.wav')) {
        // Extract track name from filename (remove extension)
        const fileName = file.name.replace(/\.(mp3|wav)$/i, '');
        // Try to parse "Artist - Title" format, otherwise use filename as title
        const parts = fileName.split(' - ');
        const title = parts.length > 1 ? parts.slice(1).join(' - ') : fileName;
        const artist = parts.length > 1 ? parts[0] : artistName || 'Unknown Artist';

        newTracks.push({
          id: `upload-${Date.now()}-${index}`,
          title: title.trim(),
          artist: artist.trim(),
          bpm: 128, // Default BPM - user can edit
          duration: 0, // Will be calculated when loaded
          key: '?',
          file,
        });
      }
    });

    if (newTracks.length === 0) {
      toast({
        title: "No valid files",
        description: "Please select MP3 or WAV files",
        variant: "destructive",
      });
      return;
    }

    setPendingTracks(prev => [...prev, ...newTracks]);
    
    // Calculate durations using Audio API
    newTracks.forEach((track) => {
      if (track.file) {
        const audio = new Audio();
        audio.src = URL.createObjectURL(track.file);
        audio.onloadedmetadata = () => {
          setPendingTracks(prev => 
            prev.map(t => 
              t.id === track.id 
                ? { ...t, duration: Math.round(audio.duration) }
                : t
            )
          );
          URL.revokeObjectURL(audio.src);
        };
      }
    });
  };

  const handleYoutubeImport = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "Enter URL",
        description: "Please enter a YouTube playlist URL",
        variant: "destructive",
      });
      return;
    }

    // Extract playlist ID from URL
    const playlistMatch = youtubeUrl.match(/[?&]list=([^&]+)/);
    if (!playlistMatch) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube playlist URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // For now, we'll create placeholder tracks from the URL
      // In a real implementation, you'd call an edge function to fetch metadata
      toast({
        title: "YouTube Import",
        description: "YouTube playlist import requires API setup. For now, please use the MP3 upload option.",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Could not fetch playlist data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyImport = async () => {
    if (!spotifyUrl.trim()) {
      toast({
        title: "Enter URL",
        description: "Please enter a Spotify playlist URL",
        variant: "destructive",
      });
      return;
    }

    // Extract playlist ID from various Spotify URL formats
    const playlistMatch = spotifyUrl.match(/playlist\/([a-zA-Z0-9]+)/);
    if (!playlistMatch) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Spotify playlist URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use Spotify's oEmbed API (no auth required)
      const oEmbedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlist info');
      }
      
      const data = await response.json();
      
      setSpotifyPlaylistInfo({
        title: data.title || 'Unknown Playlist',
        thumbnail: data.thumbnail_url || '',
      });
      
      toast({
        title: "Playlist found!",
        description: `"${data.title}" - You can now add tracks manually based on this playlist`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Could not fetch playlist data. Check the URL and try again.",
        variant: "destructive",
      });
      setSpotifyPlaylistInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const removePendingTrack = (id: string) => {
    setPendingTracks(prev => prev.filter(t => t.id !== id));
  };

  const updatePendingTrack = (id: string, updates: Partial<PendingTrack>) => {
    setPendingTracks(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const handleImport = () => {
    if (pendingTracks.length === 0) {
      toast({
        title: "No tracks",
        description: "Add some tracks before importing",
        variant: "destructive",
      });
      return;
    }

    // Apply album artist if set
    const tracksToImport: Track[] = pendingTracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: artistName || t.artist,
      bpm: t.bpm,
      duration: t.duration || 180,
      key: t.key,
    }));

    onImportTracks(tracksToImport);
    
    toast({
      title: "Tracks imported!",
      description: `Added ${tracksToImport.length} tracks to library`,
    });

    // Reset state
    setPendingTracks([]);
    setYoutubeUrl('');
    setSpotifyUrl('');
    setSpotifyPlaylistInfo(null);
    setAlbumName('');
    setArtistName('');
    onOpenChange(false);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Import Tracks
          </DialogTitle>
          <DialogDescription>
            Upload MP3 files or import from YouTube playlist
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="spotify" className="flex items-center gap-2">
              <Disc className="w-4 h-4" />
              Spotify
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              YouTube
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Quick Spotify Sync */}
            <div className="mb-4 p-3 bg-[hsl(142,70%,45%)]/10 border border-[hsl(142,70%,45%)]/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Disc className="w-4 h-4 text-[hsl(142,70%,45%)]" />
                <span className="text-sm font-medium">Quick Spotify Sync</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste Spotify playlist URL..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="flex-1 text-sm h-8"
                />
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1.5 h-8 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-black"
                  disabled={!spotifyUrl.match(/playlist\/([a-zA-Z0-9]+)/)}
                  onClick={() => {
                    const playlistId = spotifyUrl.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
                    if (playlistId) {
                      window.open(`spotify:playlist:${playlistId}`, '_blank');
                    }
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Spotify
                </Button>
              </div>
            </div>

            {/* Album Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <Label htmlFor="albumName" className="text-xs text-muted-foreground">Album Name (optional)</Label>
                <Input
                  id="albumName"
                  placeholder="My Album"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="artistName" className="text-xs text-muted-foreground">Artist (applies to all)</Label>
                <Input
                  id="artistName"
                  placeholder="Artist Name"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <FolderOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to select MP3/WAV files</p>
              <p className="text-xs text-muted-foreground mt-1">or drag and drop your album folder</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Pending Tracks List */}
            {pendingTracks.length > 0 && (
              <div className="flex-1 min-h-0 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{pendingTracks.length} tracks ready</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setPendingTracks([])}
                    className="text-xs text-muted-foreground"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
                  {pendingTracks.map((track) => (
                    <div 
                      key={track.id}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
                    >
                      <Music className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) => updatePendingTrack(track.id, { title: e.target.value })}
                          className="w-full bg-transparent text-sm font-medium focus:outline-none focus:bg-background/50 rounded px-1"
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <input
                            type="text"
                            value={track.artist}
                            onChange={(e) => updatePendingTrack(track.id, { artist: e.target.value })}
                            className="bg-transparent focus:outline-none focus:bg-background/50 rounded px-1 w-24"
                            placeholder="Artist"
                          />
                          <span>•</span>
                          <input
                            type="number"
                            value={track.bpm}
                            onChange={(e) => updatePendingTrack(track.id, { bpm: Number(e.target.value) })}
                            className="bg-transparent focus:outline-none focus:bg-background/50 rounded px-1 w-12 text-center"
                          />
                          <span>BPM</span>
                          <span>•</span>
                          <span>{formatDuration(track.duration)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removePendingTrack(track.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="spotify" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="spotifyUrl" className="text-xs text-muted-foreground">Spotify Playlist URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="spotifyUrl"
                    placeholder="https://open.spotify.com/playlist/..."
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSpotifyImport}
                    disabled={isLoading}
                    variant="secondary"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Fetch'
                    )}
                  </Button>
                </div>
              </div>

              {spotifyPlaylistInfo && (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  {spotifyPlaylistInfo.thumbnail && (
                    <img 
                      src={spotifyPlaylistInfo.thumbnail} 
                      alt="Playlist cover" 
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{spotifyPlaylistInfo.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Playlist found! Open it in your Spotify app.
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="shrink-0 gap-2"
                    onClick={() => {
                      // Convert web URL to Spotify URI for desktop app
                      const playlistId = spotifyUrl.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];
                      if (playlistId) {
                        window.open(`spotify:playlist:${playlistId}`, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Spotify
                  </Button>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">How it works:</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• Paste a Spotify playlist share URL above</li>
                  <li>• Click "Fetch" to load the playlist info</li>
                  <li>• Click "Open in Spotify" to launch it in your desktop app</li>
                  <li>• No Spotify API key required!</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="youtube" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="youtubeUrl" className="text-xs text-muted-foreground">YouTube Playlist URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="youtubeUrl"
                    placeholder="https://www.youtube.com/playlist?list=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleYoutubeImport}
                    disabled={isLoading}
                    variant="secondary"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Fetch'
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">How it works:</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• Paste a YouTube playlist URL above</li>
                  <li>• We'll extract track titles and metadata</li>
                  <li>• Note: Audio files are not downloaded (metadata only)</li>
                  <li>• You can then match with your local files</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Import Button */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={pendingTracks.length === 0}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Import {pendingTracks.length > 0 ? `${pendingTracks.length} Tracks` : 'Tracks'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTracksModal;
