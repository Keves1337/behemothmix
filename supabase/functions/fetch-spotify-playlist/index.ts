import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SpotifyTrack {
  title: string;
  artist: string;
  duration: number;
  bpm: number;
  key: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playlistUrl } = await req.json();
    
    if (!playlistUrl) {
      return new Response(
        JSON.stringify({ error: 'Playlist URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract playlist ID from URL
    const playlistMatch = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
    if (!playlistMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid Spotify playlist URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const playlistId = playlistMatch[1];
    
    // Fetch the Spotify embed page which contains track data
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract the JSON data from the script tag
    const scriptMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    
    let tracks: SpotifyTrack[] = [];
    let playlistName = 'Unknown Playlist';
    
    if (scriptMatch) {
      try {
        const jsonData = JSON.parse(scriptMatch[1]);
        const playlistData = jsonData?.props?.pageProps?.state?.data?.entity;
        
        if (playlistData) {
          playlistName = playlistData.name || playlistName;
          
          const trackList = playlistData.trackList || [];
          tracks = trackList.map((item: any, index: number) => {
            const track = item.track || item;
            // Try multiple paths for track name and artist
            const name = track.name || track.title || item.name || item.title || `Track ${index + 1}`;
            const artists = track.artists || item.artists || [];
            const artistName = artists.length > 0 
              ? artists.map((a: any) => a.name || a).filter(Boolean).join(', ') 
              : 'Unknown Artist';
            const durationMs = track.duration || track.duration_ms || item.duration || item.duration_ms || 180000;
            
            return {
              title: name,
              artist: artistName,
              duration: Math.round(durationMs / 1000),
              bpm: 128,
              key: '?',
            };
          });
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
    }
    
    // Try alternative extraction from resource attribute
    if (tracks.length === 0 || tracks.every(t => t.title.startsWith('Track '))) {
      const resourceMatch = html.match(/data-resource="([^"]+)"/);
      if (resourceMatch) {
        try {
          const resourceData = JSON.parse(decodeURIComponent(resourceMatch[1]));
          if (resourceData.tracks) {
            tracks = resourceData.tracks.map((item: any, index: number) => ({
              title: item.name || item.title || `Track ${index + 1}`,
              artist: (item.artists || []).map((a: any) => a.name).join(', ') || 'Unknown Artist',
              duration: Math.round((item.duration_ms || 180000) / 1000),
              bpm: 128,
              key: '?',
            }));
          }
        } catch (e) {
          console.error('Resource parse error:', e);
        }
      }
    }

    // Fallback: Try to extract from oEmbed if no tracks found
    if (tracks.length === 0) {
      try {
        const oEmbedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(playlistUrl)}`;
        const oEmbedResponse = await fetch(oEmbedUrl);
        if (oEmbedResponse.ok) {
          const oEmbedData = await oEmbedResponse.json();
          playlistName = oEmbedData.title || playlistName;
        }
      } catch (e) {
        console.error('oEmbed fallback error:', e);
      }
      
      // Return empty tracks with playlist info
      return new Response(
        JSON.stringify({ 
          playlistName,
          tracks: [],
          message: 'Could not extract individual tracks. The playlist may be private or restricted.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        playlistName,
        tracks,
        trackCount: tracks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error fetching Spotify playlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch playlist';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
