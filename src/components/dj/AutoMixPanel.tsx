import { cn } from '@/lib/utils';
import { Zap, Clock, Shuffle } from 'lucide-react';
import { AutoMixSettings } from '@/types/dj';

interface AutoMixPanelProps {
  settings: AutoMixSettings;
  onSettingsChange: (settings: Partial<AutoMixSettings>) => void;
}

const AutoMixPanel = ({ settings, onSettingsChange }: AutoMixPanelProps) => {
  const transitionStyles: { id: AutoMixSettings['transitionStyle']; label: string }[] = [
    { id: 'crossfade', label: 'Crossfade' },
    { id: 'beatmatch', label: 'Beatmatch' },
    { id: 'cut', label: 'Cut' },
  ];

  return (
    <div className="p-4 rounded-lg bg-card/50 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className={cn(
            'w-5 h-5 transition-colors',
            settings.enabled ? 'text-primary' : 'text-muted-foreground'
          )} />
          <span className="font-display font-semibold text-sm uppercase tracking-wider">
            Auto Mix
          </span>
        </div>
        <button
          onClick={() => onSettingsChange({ enabled: !settings.enabled })}
          className={cn(
            'auto-mix-btn',
            settings.enabled && 'auto-mix-active'
          )}
        >
          {settings.enabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Transition Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Transition</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="4"
              max="32"
              step="4"
              value={settings.transitionTime}
              onChange={(e) => onSettingsChange({ transitionTime: Number(e.target.value) })}
              className="w-24 h-1 bg-muted rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary"
            />
            <span className="text-sm font-mono w-8">{settings.transitionTime}s</span>
          </div>
        </div>

        {/* Transition Style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shuffle className="w-4 h-4" />
            <span>Style</span>
          </div>
          <div className="flex gap-1">
            {transitionStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => onSettingsChange({ transitionStyle: style.id })}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  settings.transitionStyle === style.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoMixPanel;
