import { useState, useEffect } from 'react';
import { Settings, Volume2, Headphones, Maximize2, Activity, Download } from 'lucide-react';
import ControllerStatus from './ControllerStatus';
import MIDIMonitor from './MIDIMonitor';
import { MIDIDevice, MIDIMessage } from '@/hooks/useWebMIDI';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface HeaderProps {
  masterVolume: number;
  onMasterVolumeChange: (value: number) => void;
  // MIDI props
  midiConnected: boolean;
  midiSupported: boolean;
  midiDevices: MIDIDevice[];
  midiError: string | null;
  lastMidiMessage: MIDIMessage | null;
  onMidiRefresh: () => void;
  onMidiSelectDevice: (deviceId: string) => void;
}

const Header = ({ 
  masterVolume, 
  onMasterVolumeChange,
  midiConnected,
  midiSupported,
  midiDevices,
  midiError,
  lastMidiMessage,
  onMidiRefresh,
  onMidiSelectDevice,
}: HeaderProps) => {
  const [showMidiMonitor, setShowMidiMonitor] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capture the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        toast({
          title: "App installed!",
          description: "MixMaster DJ has been added to your desktop",
        });
      }
      setInstallPrompt(null);
    } else if (!isInstalled) {
      // Fallback for browsers that don't support beforeinstallprompt
      toast({
        title: "Install MixMaster DJ",
        description: "Click the install icon (⊕) in your browser's address bar, or use Menu → Install app",
      });
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 bg-card/50 border-b border-border backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="font-display font-black text-lg text-background">DJ</span>
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-secondary blur-lg opacity-50" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wider">
              <span className="text-deck-a">MIX</span>
              <span className="text-deck-b">MASTER</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Professional DJ System
            </p>
          </div>
        </div>

        {/* Center - Controller Status */}
        <ControllerStatus 
          isConnected={midiConnected}
          isSupported={midiSupported}
          controllerName="Pioneer DDJ-SX1"
          devices={midiDevices}
          error={midiError}
          onRefresh={onMidiRefresh}
          onSelectDevice={onMidiSelectDevice}
        />

        {/* Right - Master Controls */}
        <div className="flex items-center gap-6">
          {/* Master Volume */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Master</span>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
                className="w-24 h-1.5 bg-muted rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-primary
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--primary))]"
              />
            </div>
          </div>

          {/* MIDI Monitor Toggle */}
          <button 
            onClick={() => setShowMidiMonitor(!showMidiMonitor)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showMidiMonitor 
                ? 'bg-primary/20 text-primary' 
                : 'bg-muted/50 hover:bg-muted text-muted-foreground'
            )}
            title="MIDI Monitor"
          >
            <Activity className="w-5 h-5" />
          </button>

          {/* Install App Button */}
          {!isInstalled && (
            <button 
              onClick={handleInstallClick}
              className={cn(
                'p-2 rounded-lg transition-colors',
                installPrompt 
                  ? 'bg-primary/20 text-primary animate-pulse' 
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              )}
              title="Install App"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          {/* Headphones */}
          <button className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <Headphones className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Fullscreen */}
          <button className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <Maximize2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* MIDI Monitor Panel */}
      <MIDIMonitor 
        lastMessage={lastMidiMessage}
        isOpen={showMidiMonitor}
        onClose={() => setShowMidiMonitor(false)}
      />
    </>
  );
};

export default Header;
