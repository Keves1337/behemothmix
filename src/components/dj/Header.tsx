import { Settings, Volume2, Headphones, Maximize2 } from 'lucide-react';
import ControllerStatus from './ControllerStatus';
import { cn } from '@/lib/utils';

interface HeaderProps {
  masterVolume: number;
  onMasterVolumeChange: (value: number) => void;
}

const Header = ({ masterVolume, onMasterVolumeChange }: HeaderProps) => {
  return (
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
        isConnected={false}
        controllerName="Pioneer DDJ-SX1"
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
  );
};

export default Header;
