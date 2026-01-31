import { useCallback, useRef } from 'react';

interface BPMResult {
  bpm: number;
  confidence: number;
}

export const useBPMDetector = () => {
  const cacheRef = useRef<Map<string, BPMResult>>(new Map());

  const detectBPM = useCallback(async (audioFile: File): Promise<BPMResult | null> => {
    // Check cache
    const cacheKey = `${audioFile.name}-${audioFile.size}`;
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey)!;
    }

    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioContext = new OfflineAudioContext(1, 44100 * 30, 44100); // Analyze first 30 seconds
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Get mono channel data
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      // Limit analysis to first 30 seconds
      const analysisLength = Math.min(channelData.length, sampleRate * 30);
      const samples = channelData.slice(0, analysisLength);
      
      // Step 1: Apply low-pass filter to focus on bass/kick frequencies
      const filtered = lowPassFilter(samples, sampleRate, 150);
      
      // Step 2: Calculate energy envelope
      const hopSize = Math.floor(sampleRate / 100); // 10ms hops
      const envelope = calculateEnvelope(filtered, hopSize);
      
      // Step 3: Detect onsets (peaks in energy)
      const onsets = detectOnsets(envelope, hopSize, sampleRate);
      
      // Step 4: Calculate inter-onset intervals and find BPM
      const result = calculateBPMFromOnsets(onsets, sampleRate);
      
      if (result) {
        cacheRef.current.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('BPM detection error:', error);
      return null;
    }
  }, []);

  return { detectBPM };
};

// Simple low-pass filter using moving average
function lowPassFilter(samples: Float32Array, sampleRate: number, cutoff: number): Float32Array {
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  
  const filtered = new Float32Array(samples.length);
  filtered[0] = samples[0];
  
  for (let i = 1; i < samples.length; i++) {
    filtered[i] = filtered[i - 1] + alpha * (samples[i] - filtered[i - 1]);
  }
  
  return filtered;
}

// Calculate energy envelope using RMS
function calculateEnvelope(samples: Float32Array, hopSize: number): number[] {
  const envelope: number[] = [];
  const windowSize = hopSize * 2;
  
  for (let i = 0; i < samples.length - windowSize; i += hopSize) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      sum += samples[i + j] * samples[i + j];
    }
    envelope.push(Math.sqrt(sum / windowSize));
  }
  
  return envelope;
}

// Detect onsets as peaks in the envelope
function detectOnsets(envelope: number[], hopSize: number, sampleRate: number): number[] {
  const onsets: number[] = [];
  const minInterval = Math.floor((sampleRate / hopSize) * 0.1); // Min 100ms between onsets
  
  // Calculate first derivative (difference)
  const diff: number[] = [];
  for (let i = 1; i < envelope.length; i++) {
    diff.push(Math.max(0, envelope[i] - envelope[i - 1]));
  }
  
  // Find threshold using median + std
  const sortedDiff = [...diff].sort((a, b) => a - b);
  const median = sortedDiff[Math.floor(sortedDiff.length / 2)];
  const std = Math.sqrt(diff.reduce((sum, v) => sum + (v - median) ** 2, 0) / diff.length);
  const threshold = median + std * 1.5;
  
  let lastOnset = -minInterval;
  
  for (let i = 1; i < diff.length - 1; i++) {
    if (diff[i] > threshold && 
        diff[i] > diff[i - 1] && 
        diff[i] >= diff[i + 1] &&
        i - lastOnset >= minInterval) {
      onsets.push(i * hopSize);
      lastOnset = i;
    }
  }
  
  return onsets;
}

// Calculate BPM from onset intervals using histogram
function calculateBPMFromOnsets(onsets: number[], sampleRate: number): BPMResult | null {
  if (onsets.length < 4) return null;
  
  // Calculate all inter-onset intervals
  const intervals: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    const interval = (onsets[i] - onsets[i - 1]) / sampleRate;
    // Only consider intervals in reasonable BPM range (60-200 BPM = 0.3-1s)
    if (interval >= 0.3 && interval <= 1.0) {
      intervals.push(interval);
    }
  }
  
  if (intervals.length < 3) return null;
  
  // Create histogram of BPMs
  const bpmCounts: Map<number, number> = new Map();
  
  intervals.forEach(interval => {
    // Try different beat divisions
    for (const divisor of [1, 2, 0.5]) {
      const bpm = Math.round(60 / (interval * divisor));
      if (bpm >= 60 && bpm <= 200) {
        bpmCounts.set(bpm, (bpmCounts.get(bpm) || 0) + 1);
      }
    }
  });
  
  // Find clusters of similar BPMs
  const bpmGroups: Map<number, number> = new Map();
  bpmCounts.forEach((count, bpm) => {
    // Group BPMs within ±2 range
    const roundedBpm = Math.round(bpm / 2) * 2;
    bpmGroups.set(roundedBpm, (bpmGroups.get(roundedBpm) || 0) + count);
  });
  
  // Find the most common BPM group
  let maxCount = 0;
  let detectedBpm = 0;
  
  bpmGroups.forEach((count, bpm) => {
    if (count > maxCount) {
      maxCount = count;
      detectedBpm = bpm;
    }
  });
  
  if (detectedBpm === 0) return null;
  
  // Calculate confidence based on how consistent the intervals are
  const expectedInterval = 60 / detectedBpm;
  let matchingIntervals = 0;
  
  intervals.forEach(interval => {
    // Check if interval matches detected BPM (or half/double)
    for (const mult of [1, 2, 0.5]) {
      if (Math.abs(interval * mult - expectedInterval) < 0.05) {
        matchingIntervals++;
        break;
      }
    }
  });
  
  const confidence = Math.min(1, matchingIntervals / intervals.length);
  
  return {
    bpm: detectedBpm,
    confidence: Math.round(confidence * 100) / 100,
  };
}
