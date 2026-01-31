import { cn } from '@/lib/utils';
import { Usb, Wifi, WifiOff } from 'lucide-react';

interface ControllerStatusProps {
  isConnected: boolean;
  controllerName: string;
}

const ControllerStatus = ({ isConnected, controllerName }: ControllerStatusProps) => {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
      isConnected ? 'bg-[hsl(var(--sync-active))]/10' : 'bg-muted/50'
    )}>
      <div className="relative">
        <Usb className={cn(
          'w-5 h-5',
          isConnected ? 'text-[hsl(var(--sync-active))]' : 'text-muted-foreground'
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
          isConnected ? 'text-[hsl(var(--sync-active))]' : 'text-muted-foreground'
        )}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </span>
      </div>
      {isConnected ? (
        <Wifi className="w-4 h-4 text-[hsl(var(--sync-active))] ml-auto" />
      ) : (
        <WifiOff className="w-4 h-4 text-muted-foreground ml-auto" />
      )}
    </div>
  );
};

export default ControllerStatus;
