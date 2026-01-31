import { useCallback, useMemo } from 'react';
import { useWebMIDI, MIDIMessage } from './useWebMIDI';
import { DeckState } from '@/types/dj';

// DDJ-SX1 MIDI Control Mappings
// Based on Pioneer DDJ-SX1 MIDI specification
const MIDI_COMMANDS = {
  NOTE_OFF: 8,
  NOTE_ON: 9,
  CONTROL_CHANGE: 11,
};

// DDJ-SX1 specific note mappings per deck
const DDJ_SX1_NOTES = {
  // Deck 1 (Channel 0) / Deck 2 (Channel 1)
  PLAY: 0x0B,        // Play/Pause button
  CUE: 0x0C,         // Cue button
  SYNC: 0x58,        // Sync button
  HOT_CUE_1: 0x00,   // Hot cue 1
  HOT_CUE_2: 0x01,   // Hot cue 2
  HOT_CUE_3: 0x02,   // Hot cue 3
  HOT_CUE_4: 0x03,   // Hot cue 4
  HOT_CUE_5: 0x04,   // Hot cue 5
  HOT_CUE_6: 0x05,   // Hot cue 6
  HOT_CUE_7: 0x06,   // Hot cue 7
  HOT_CUE_8: 0x07,   // Hot cue 8
  LOOP_IN: 0x10,     // Loop in
  LOOP_OUT: 0x11,    // Loop out
  LOOP_EXIT: 0x4D,   // Loop exit/reloop
  SHIFT: 0x40,       // Shift button
  SLIP: 0x53,        // Slip mode
  VINYL: 0x17,       // Vinyl mode
  KEYLOCK: 0x1A,     // Key lock
  GRID: 0x79,        // Grid adjust
};

// Control Change mappings
const DDJ_SX1_CC = {
  // Deck 1 (Channel 0) / Deck 2 (Channel 1)
  JOG_WHEEL: 0x22,      // Jog wheel rotation
  JOG_TOUCH: 0x36,      // Jog wheel touch sensor
  PITCH_FADER: 0x00,    // Tempo/pitch fader
  
  // Mixer section (Channel 6)
  VOLUME_1: 0x13,       // Channel 1 volume fader
  VOLUME_2: 0x14,       // Channel 2 volume fader
  VOLUME_3: 0x15,       // Channel 3 volume fader
  VOLUME_4: 0x16,       // Channel 4 volume fader
  CROSSFADER: 0x1F,     // Crossfader
  
  // EQ (Channel 0 for deck 1, Channel 1 for deck 2)
  EQ_HIGH: 0x07,        // EQ High
  EQ_MID: 0x0B,         // EQ Mid
  EQ_LOW: 0x0F,         // EQ Low
  FILTER: 0x17,         // Filter knob
  
  // Effects
  FX_DRY_WET: 0x1A,     // FX dry/wet
  FX_PARAM_1: 0x1E,     // FX parameter 1
  FX_PARAM_2: 0x1F,     // FX parameter 2
  
  // Master
  MASTER_LEVEL: 0x00,   // Master level (Channel 6)
  HEADPHONE_MIX: 0x04,  // Headphone mix
  HEADPHONE_LEVEL: 0x05, // Headphone level
};

export interface DDJSX1Actions {
  // Deck A actions
  onDeckAPlay?: () => void;
  onDeckACue?: () => void;
  onDeckASync?: () => void;
  onDeckAJog?: (direction: number, velocity: number) => void;
  onDeckAPitch?: (value: number) => void;
  onDeckAVolume?: (value: number) => void;
  onDeckAEQHigh?: (value: number) => void;
  onDeckAEQMid?: (value: number) => void;
  onDeckAEQLow?: (value: number) => void;
  onDeckAFilter?: (value: number) => void;
  
  // Deck B actions
  onDeckBPlay?: () => void;
  onDeckBCue?: () => void;
  onDeckBSync?: () => void;
  onDeckBJog?: (direction: number, velocity: number) => void;
  onDeckBPitch?: (value: number) => void;
  onDeckBVolume?: (value: number) => void;
  onDeckBEQHigh?: (value: number) => void;
  onDeckBEQMid?: (value: number) => void;
  onDeckBEQLow?: (value: number) => void;
  onDeckBFilter?: (value: number) => void;
  
  // Mixer actions
  onCrossfader?: (value: number) => void;
  onMasterVolume?: (value: number) => void;
}

export const useDDJSX1 = (actions: DDJSX1Actions) => {
  // Handle MIDI messages
  const handleMIDIMessage = useCallback((message: MIDIMessage) => {
    const { command, channel, note, velocity } = message;
    
    // Determine which deck based on channel (0 = Deck A, 1 = Deck B)
    const isDeckA = channel === 0 || channel === 2;
    const isDeckB = channel === 1 || channel === 3;
    const isMixer = channel === 6;
    
    // Handle Note On messages (button presses)
    if (command === MIDI_COMMANDS.NOTE_ON && velocity > 0) {
      switch (note) {
        case DDJ_SX1_NOTES.PLAY:
          if (isDeckA) actions.onDeckAPlay?.();
          else if (isDeckB) actions.onDeckBPlay?.();
          break;
        case DDJ_SX1_NOTES.CUE:
          if (isDeckA) actions.onDeckACue?.();
          else if (isDeckB) actions.onDeckBCue?.();
          break;
        case DDJ_SX1_NOTES.SYNC:
          if (isDeckA) actions.onDeckASync?.();
          else if (isDeckB) actions.onDeckBSync?.();
          break;
      }
    }
    
    // Handle Control Change messages (faders, knobs)
    if (command === MIDI_COMMANDS.CONTROL_CHANGE) {
      // Normalize value to 0-100 range
      const normalizedValue = Math.round((velocity / 127) * 100);
      
      // Pitch fader (convert to -8% to +8% range)
      if (note === DDJ_SX1_CC.PITCH_FADER) {
        const pitchValue = ((velocity - 64) / 64) * 8;
        if (isDeckA) actions.onDeckAPitch?.(pitchValue);
        else if (isDeckB) actions.onDeckBPitch?.(pitchValue);
      }
      
      // Jog wheel
      if (note === DDJ_SX1_CC.JOG_WHEEL) {
        // Value > 64 = clockwise, < 64 = counter-clockwise
        const direction = velocity > 64 ? 1 : -1;
        const jogVelocity = Math.abs(velocity - 64);
        if (isDeckA) actions.onDeckAJog?.(direction, jogVelocity);
        else if (isDeckB) actions.onDeckBJog?.(direction, jogVelocity);
      }
      
      // EQ controls
      if (note === DDJ_SX1_CC.EQ_HIGH) {
        if (isDeckA) actions.onDeckAEQHigh?.(normalizedValue);
        else if (isDeckB) actions.onDeckBEQHigh?.(normalizedValue);
      }
      if (note === DDJ_SX1_CC.EQ_MID) {
        if (isDeckA) actions.onDeckAEQMid?.(normalizedValue);
        else if (isDeckB) actions.onDeckBEQMid?.(normalizedValue);
      }
      if (note === DDJ_SX1_CC.EQ_LOW) {
        if (isDeckA) actions.onDeckAEQLow?.(normalizedValue);
        else if (isDeckB) actions.onDeckBEQLow?.(normalizedValue);
      }
      
      // Filter
      if (note === DDJ_SX1_CC.FILTER) {
        if (isDeckA) actions.onDeckAFilter?.(normalizedValue);
        else if (isDeckB) actions.onDeckBFilter?.(normalizedValue);
      }
      
      // Mixer controls (Channel 6)
      if (isMixer) {
        if (note === DDJ_SX1_CC.CROSSFADER) {
          actions.onCrossfader?.(normalizedValue);
        }
        if (note === DDJ_SX1_CC.VOLUME_1) {
          actions.onDeckAVolume?.(normalizedValue);
        }
        if (note === DDJ_SX1_CC.VOLUME_2) {
          actions.onDeckBVolume?.(normalizedValue);
        }
        if (note === DDJ_SX1_CC.MASTER_LEVEL) {
          actions.onMasterVolume?.(normalizedValue);
        }
      }
    }
  }, [actions]);

  const webMidi = useWebMIDI({
    onMessage: handleMIDIMessage,
    onConnect: (device) => {
      console.log('DDJ-SX1 Connected:', device.name);
    },
    onDisconnect: (device) => {
      console.log('DDJ-SX1 Disconnected:', device.name);
    },
  });

  // Detect if DDJ-SX1 is specifically connected
  const isDDJSX1Connected = useMemo(() => {
    return webMidi.devices.some(
      d => d.name.toLowerCase().includes('ddj-sx') || 
           d.name.toLowerCase().includes('ddj sx')
    );
  }, [webMidi.devices]);

  return {
    ...webMidi,
    isDDJSX1Connected,
  };
};
