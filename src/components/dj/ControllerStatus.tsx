import { cn } from '@/lib/utils';
import { Usb, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { MIDIDevice } from '@/hooks/useWebMIDI';

interface ControllerStatusProps {
  isConnected: boolean;
  isSupported: boolean;
  controllerName: string;
  devices: MIDIDevice[];
  error: string | null;
  onRefresh: () => void;
  onSelectDevice: (deviceId: string) => void;
}

const ControllerStatus = ({ 
  isConnected, 
  isSupported,
  controllerName, 
  devices,
  error,
  onRefresh,
  onSelectDevice,
}: ControllerStatusProps) => {
  return (
    <div className="relative group">
      <div className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer',
        isConnected ? 'bg-[hsl(var(--sync-active))]/10' : 'bg-muted/50',
        !isSupported && 'bg-destructive/10'
      )}>
        <div className="relative">
          <Usb className={cn(
            'w-5 h-5',
            isConnected ? 'text-[hsl(var(--sync-active))]' : 
            !isSupported ? 'text-destructive' : 'text-muted-foreground'
          )} />
          {isConnected && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[hsl(var(--sync-active))] rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {controllerName}
          </span>
          <span className={cn(
            'text-[10px]',
            isConnected ? 'text-[hsl(var(--sync-active))]' : 
            !isSupported ? 'text-destructive' :
            'text-muted-foreground'
          )}>
            {!isSupported ? 'Not Supported' :
             isConnected ? 'Connected' : 
             error ? 'Error' : 'Not Connected'}
          </span>
        </div>
        {isConnected ? (
          <Wifi className="w-4 h-4 text-[hsl(var(--sync-active))] ml-auto" />
        ) : !isSupported ? (
          <AlertCircle className="w-4 h-4 text-destructive ml-auto" />
        ) : (
          <WifiOff className="w-4 h-4 text-muted-foreground ml-auto" />
        )}
      </div>

      {/* Dropdown for device selection */}
      <div className="absolute top-full left-0 mt-1 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="bg-popover border border-border rounded-lg shadow-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              MIDI Devices
            </span>
            <button
              onClick={onRefresh}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Refresh devices"
            >
              <RefreshCw className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          {!isSupported ? (
            <div className="py-2 text-sm text-destructive">
              Web MIDI is not supported in this browser. Please use Chrome, Edge, or Opera.
            </div>
          ) : error ? (
            <div className="py-2 text-sm text-destructive">
              {error}
            </div>
          ) : devices.length === 0 ? (
            <div className="py-2 text-sm text-muted-foreground">
              No MIDI devices found. Connect your DDJ-SX1 via USB.
            </div>
          ) : (
            <div className="space-y-1">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => onSelectDevice(device.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    device.state === 'connected' 
                      ? 'bg-[hsl(var(--sync-active))]/10 text-[hsl(var(--sync-active))]'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="font-medium">{device.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {device.manufacturer} • {device.state}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
            Supported: Pioneer DDJ-SX, DDJ-SX2, DDJ-SX3
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerStatus;
