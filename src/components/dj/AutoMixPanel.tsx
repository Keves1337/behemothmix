import { cn } from '@/lib/utils';
import { Zap, Clock, Shuffle, Brain, Music2, Waves, Activity, ListMusic, Sparkles } from 'lucide-react';
import { AutoMixSettings, AutoMixState, Track } from '@/types/dj';

interface AutoMixPanelProps {
  settings: AutoMixSettings;
  state?: AutoMixState;
  onSettingsChange: (settings: Partial<AutoMixSettings>) => void;
  tracks?: Track[];
}

const AutoMixPanel = ({ settings, state, onSettingsChange, tracks }: AutoMixPanelProps) => {
  const queuedTrack = tracks?.find(t => t.id === state?.queuedTrackId);

  const transitionStyles: { id: AutoMixSettings['transitionStyle']; label: string; icon: React.ReactNode }[] = [
    { id: 'auto', label: 'Auto', icon: <Sparkles className="w-3 h-3" /> },
    { id: 'crossfade', label: 'Fade', icon: <Waves className="w-3 h-3" /> },
    { id: 'beatmatch', label: 'Beat', icon: <Activity className="w-3 h-3" /> },
    { id: 'drop', label: 'Drop', icon: <Zap className="w-3 h-3" /> },
    { id: 'cut', label: 'Cut', icon: <Music2 className="w-3 h-3" /> },
  ];

  const styleLabels: Record<string, string> = {
    crossfade: 'Crossfade',
    beatmatch: 'Beatmatch',
    drop: 'Drop Mix',
    cut: 'Hard Cut',
  };

  return (
    <div className="p-4 rounded-lg bg-card/50 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className={cn(
            'w-5 h-5 transition-colors',
            settings.enabled ? 'text-primary' : 'text-muted-foreground'
          )} />
          <span className="font-display font-semibold text-sm uppercase tracking-wider">
            Smart Mix
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

      {/* Status indicator */}
      {settings.enabled && state && (
        <div className="mb-4 p-2 rounded bg-muted/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status:</span>
            <span className={cn(
              'font-semibold uppercase',
              state.currentPhase === 'transitioning' && 'text-[hsl(var(--sync-active))]',
              state.currentPhase === 'scanning' && 'text-primary animate-pulse',
              state.currentPhase === 'waiting' && 'text-primary',
              state.currentPhase === 'idle' && 'text-muted-foreground'
            )}>
              {state.currentPhase === 'idle' && 'Ready'}
              {state.currentPhase === 'scanning' && 'Finding next...'}
              {state.currentPhase === 'waiting' && 'Next queued'}
              {state.currentPhase === 'transitioning' && 'Mixing...'}
            </span>
          </div>
          
          {/* Queued track display */}
          {queuedTrack && (state.currentPhase === 'waiting' || state.currentPhase === 'transitioning') && (
            <div className="flex items-center gap-2 text-xs bg-primary/10 rounded p-1.5">
              <ListMusic className="w-3 h-3 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate text-foreground">{queuedTrack.title}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="truncate">{queuedTrack.artist} • {queuedTrack.bpm} BPM</span>
                  {state.selectedStyle && settings.transitionStyle === 'auto' && (
                    <span className="text-primary font-medium">
                      → {styleLabels[state.selectedStyle]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {state.currentPhase === 'transitioning' && (
            <div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-deck-a to-deck-b transition-all"
                  style={{ width: `${state.transitionProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1">
                {Math.round(state.transitionProgress)}% complete
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Transition Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Duration</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="4"
              max="32"
              step="4"
              value={settings.transitionTime}
              onChange={(e) => onSettingsChange({ transitionTime: Number(e.target.value) })}
              className="w-20 h-1 bg-muted rounded-full appearance-none cursor-pointer
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
                  'flex items-center gap-1 px-2 py-1 text-[10px] rounded transition-colors',
                  settings.transitionStyle === style.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
                title={style.id === 'drop' ? 'Mix at drop points for maximum energy' : ''}
              >
                {style.icon}
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Features */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Brain className="w-3 h-3" />
            <span className="uppercase tracking-wider">Smart Features</span>
          </div>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Auto Sync BPM
            </span>
            <div 
              onClick={() => onSettingsChange({ smartSync: !settings.smartSync })}
              className={cn(
                'w-8 h-4 rounded-full transition-colors relative cursor-pointer',
                settings.smartSync ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                settings.smartSync ? 'translate-x-4' : 'translate-x-0.5'
              )} />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Energy Match
            </span>
            <div 
              onClick={() => onSettingsChange({ energyMatch: !settings.energyMatch })}
              className={cn(
                'w-8 h-4 rounded-full transition-colors relative cursor-pointer',
                settings.energyMatch ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                settings.energyMatch ? 'translate-x-4' : 'translate-x-0.5'
              )} />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Harmonic Mix
            </span>
            <div 
              onClick={() => onSettingsChange({ harmonic: !settings.harmonic })}
              className={cn(
                'w-8 h-4 rounded-full transition-colors relative cursor-pointer',
                settings.harmonic ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                settings.harmonic ? 'translate-x-4' : 'translate-x-0.5'
              )} />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AutoMixPanel;
