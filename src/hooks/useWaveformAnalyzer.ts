import { useRef, useCallback, useState } from 'react';
import { Track } from '@/types/dj';

interface WaveformData {
  // Full track overview waveform (for static display)
  overview: number[];
  // Peak data for visualization
  peaks: number[];
}

interface UseWaveformAnalyzerReturn {
  analyzeTrack: (track: Track) => Promise<number[] | null>;
  getRealtimeData: (deck: 'a' | 'b') => Uint8Array | null;
  connectAnalyser: (deck: 'a' | 'b', sourceNode: AudioNode, audioContext: AudioContext) => AnalyserNode;
  deckAWaveform: number[] | null;
  deckBWaveform: number[] | null;
  isAnalyzing: boolean;
}

export const useWaveformAnalyzer = (): UseWaveformAnalyzerReturn => {
  const [deckAWaveform, setDeckAWaveform] = useState<number[] | null>(null);
  const [deckBWaveform, setDeckBWaveform] = useState<number[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyser nodes for real-time visualization
  const deckAAnalyserRef = useRef<AnalyserNode | null>(null);
  const deckBAnalyserRef = useRef<AnalyserNode | null>(null);

  // Cache analyzed waveforms by track ID
  const waveformCacheRef = useRef<Map<string, number[]>>(new Map());

  // Analyze entire audio file to generate waveform overview
  const analyzeTrack = useCallback(async (track: Track): Promise<number[] | null> => {
    // Check cache first
    if (waveformCacheRef.current.has(track.id)) {
      return waveformCacheRef.current.get(track.id)!;
    }

    if (!track.audioFile && !track.audioUrl) {
      return null;
    }

    setIsAnalyzing(true);

    try {
      // Create offline audio context for analysis
      const offlineContext = new OfflineAudioContext(2, 44100 * track.duration, 44100);

      // Fetch or read the audio data
      let arrayBuffer: ArrayBuffer;
      
      if (track.audioFile) {
        arrayBuffer = await track.audioFile.arrayBuffer();
      } else if (track.audioUrl) {
        const response = await fetch(track.audioUrl);
        arrayBuffer = await response.arrayBuffer();
      } else {
        setIsAnalyzing(false);
        return null;
      }

      // Decode audio data
      const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);
      
      // Get channel data (use left channel or mix if stereo)
      const channelData = audioBuffer.getChannelData(0);
      const samples = channelData.length;
      
      // Number of bars in waveform display
      const numBars = 400; // Higher resolution for detailed view
      const samplesPerBar = Math.floor(samples / numBars);
      
      const waveform: number[] = [];
      
      for (let i = 0; i < numBars; i++) {
        const start = i * samplesPerBar;
        const end = start + samplesPerBar;
        
        // Calculate RMS (root mean square) for this segment
        let sum = 0;
        let peak = 0;
        
        for (let j = start; j < end && j < samples; j++) {
          const value = Math.abs(channelData[j]);
          sum += value * value;
          if (value > peak) peak = value;
        }
        
        // Use combination of RMS and peak for better visual representation
        const rms = Math.sqrt(sum / samplesPerBar);
        const combined = (rms * 0.7 + peak * 0.3);
        
        waveform.push(Math.min(1, combined * 2)); // Normalize and boost
      }

      // Normalize the entire waveform
      const maxValue = Math.max(...waveform);
      const normalizedWaveform = waveform.map(v => v / maxValue);

      // Cache the result
      waveformCacheRef.current.set(track.id, normalizedWaveform);
      
      setIsAnalyzing(false);
      return normalizedWaveform;
    } catch (error) {
      console.error('Error analyzing waveform:', error);
      setIsAnalyzing(false);
      return null;
    }
  }, []);

  // Connect an analyser node to the audio chain for real-time visualization
  const connectAnalyser = useCallback((
    deck: 'a' | 'b',
    sourceNode: AudioNode,
    audioContext: AudioContext
  ): AnalyserNode => {
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    
    // Store reference
    if (deck === 'a') {
      deckAAnalyserRef.current = analyser;
    } else {
      deckBAnalyserRef.current = analyser;
    }

    // Connect source to analyser (don't interrupt existing chain)
    sourceNode.connect(analyser);
    
    return analyser;
  }, []);

  // Get real-time frequency/waveform data for visualization
  const getRealtimeData = useCallback((deck: 'a' | 'b'): Uint8Array | null => {
    const analyser = deck === 'a' ? deckAAnalyserRef.current : deckBAnalyserRef.current;
    
    if (!analyser) return null;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(dataArray);
    
    return dataArray;
  }, []);

  return {
    analyzeTrack,
    getRealtimeData,
    connectAnalyser,
    deckAWaveform,
    deckBWaveform,
    isAnalyzing,
  };
};
