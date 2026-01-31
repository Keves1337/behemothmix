import { useState, useEffect, useCallback, useRef } from 'react';

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
  connection: string;
}

export interface MIDIMessage {
  command: number;
  channel: number;
  note: number;
  velocity: number;
  timestamp: number;
}

interface UseWebMIDIOptions {
  onMessage?: (message: MIDIMessage, deviceId: string) => void;
  onConnect?: (device: MIDIDevice) => void;
  onDisconnect?: (device: MIDIDevice) => void;
}

export const useWebMIDI = (options: UseWebMIDIOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState<MIDIDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<MIDIDevice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<MIDIMessage | null>(null);
  
  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const inputsRef = useRef<Map<string, MIDIInput>>(new Map());

  // Parse MIDI message
  const parseMIDIMessage = useCallback((data: Uint8Array): MIDIMessage => {
    const command = data[0] >> 4;
    const channel = data[0] & 0x0f;
    const note = data[1];
    const velocity = data.length > 2 ? data[2] : 0;
    
    return {
      command,
      channel,
      note,
      velocity,
      timestamp: performance.now(),
    };
  }, []);

  // Handle incoming MIDI messages
  const handleMIDIMessage = useCallback((event: MIDIMessageEvent, deviceId: string) => {
    if (!event.data) return;
    
    const message = parseMIDIMessage(event.data);
    setLastMessage(message);
    
    options.onMessage?.(message, deviceId);
  }, [parseMIDIMessage, options]);

  // Setup input listeners
  const setupInputListener = useCallback((input: MIDIInput) => {
    const deviceId = input.id;
    
    input.onmidimessage = (event) => handleMIDIMessage(event, deviceId);
    inputsRef.current.set(deviceId, input);
    
    console.log(`MIDI input connected: ${input.name}`);
  }, [handleMIDIMessage]);

  // Handle state changes
  const handleStateChange = useCallback((event: MIDIConnectionEvent) => {
    const port = event.port;
    
    if (port.type === 'input') {
      const device: MIDIDevice = {
        id: port.id,
        name: port.name || 'Unknown Device',
        manufacturer: port.manufacturer || 'Unknown',
        state: port.state,
        connection: port.connection,
      };
      
      if (port.state === 'connected') {
        setupInputListener(port as MIDIInput);
        setDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (exists) {
            return prev.map(d => d.id === device.id ? device : d);
          }
          return [...prev, device];
        });
        
        // Auto-select DDJ-SX1 if detected
        if (device.name.toLowerCase().includes('ddj-sx') || 
            device.name.toLowerCase().includes('pioneer')) {
          setActiveDevice(device);
          setIsConnected(true);
        }
        
        options.onConnect?.(device);
      } else if (port.state === 'disconnected') {
        inputsRef.current.delete(port.id);
        setDevices(prev => prev.filter(d => d.id !== device.id));
        
        if (activeDevice?.id === device.id) {
          setActiveDevice(null);
          setIsConnected(false);
        }
        
        options.onDisconnect?.(device);
      }
    }
  }, [activeDevice, setupInputListener, options]);

  // Initialize MIDI
  const initMIDI = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false);
      setError('Web MIDI API is not supported in this browser');
      return;
    }

    setIsSupported(true);

    try {
      const midiAccess = await navigator.requestMIDIAccess({ sysex: true });
      midiAccessRef.current = midiAccess;
      
      // Setup existing inputs
      midiAccess.inputs.forEach((input) => {
        setupInputListener(input);
        
        const device: MIDIDevice = {
          id: input.id,
          name: input.name || 'Unknown Device',
          manufacturer: input.manufacturer || 'Unknown',
          state: input.state,
          connection: input.connection,
        };
        
        setDevices(prev => [...prev, device]);
        
        // Auto-select DDJ-SX1
        if (device.name.toLowerCase().includes('ddj-sx') || 
            device.name.toLowerCase().includes('pioneer')) {
          setActiveDevice(device);
          setIsConnected(true);
        }
      });
      
      // Listen for state changes
      midiAccess.onstatechange = handleStateChange;
      
      setError(null);
    } catch (err) {
      console.error('MIDI access error:', err);
      setError('Failed to access MIDI devices. Please check permissions.');
    }
  }, [setupInputListener, handleStateChange]);

  // Send MIDI message (for LED feedback)
  const sendMessage = useCallback((deviceId: string, data: number[]) => {
    if (!midiAccessRef.current) return;
    
    const output = midiAccessRef.current.outputs.get(deviceId);
    if (output) {
      output.send(data);
    }
  }, []);

  // Select a specific device
  const selectDevice = useCallback((deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      setActiveDevice(device);
      setIsConnected(true);
    }
  }, [devices]);

  // Request MIDI access on mount
  useEffect(() => {
    initMIDI();
    
    return () => {
      inputsRef.current.forEach((input) => {
        input.onmidimessage = null;
      });
      inputsRef.current.clear();
    };
  }, [initMIDI]);

  return {
    isSupported,
    isConnected,
    devices,
    activeDevice,
    error,
    lastMessage,
    initMIDI,
    sendMessage,
    selectDevice,
  };
};
