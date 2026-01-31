import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Activity, Radio, X } from 'lucide-react';
import { MIDIMessage } from '@/hooks/useWebMIDI';

interface MIDIMonitorProps {
  lastMessage: MIDIMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

const MIDIMonitor = ({ lastMessage, isOpen, onClose }: MIDIMonitorProps) => {
  const [messages, setMessages] = useState<MIDIMessage[]>([]);

  // Add message to history when it changes
  if (lastMessage && (messages.length === 0 || messages[0].timestamp !== lastMessage.timestamp)) {
    setMessages(prev => [lastMessage, ...prev].slice(0, 50));
  }

  const getCommandName = (command: number) => {
    switch (command) {
      case 8: return 'Note Off';
      case 9: return 'Note On';
      case 10: return 'Aftertouch';
      case 11: return 'CC';
      case 12: return 'Program';
      case 13: return 'Ch Pressure';
      case 14: return 'Pitch Bend';
      default: return `Cmd ${command}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-semibold">MIDI Monitor</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="max-h-72 overflow-y-auto scrollbar-thin p-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Radio className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Waiting for MIDI input...</p>
            <p className="text-xs">Move a control on your DDJ-SX1</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, index) => (
              <div
                key={`${msg.timestamp}-${index}`}
                className={cn(
                  'grid grid-cols-4 gap-2 p-2 rounded text-xs font-mono',
                  index === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-muted/30'
                )}
              >
                <div>
                  <span className="text-muted-foreground">Ch:</span>
                  <span className="ml-1">{msg.channel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cmd:</span>
                  <span className="ml-1">{getCommandName(msg.command)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Note:</span>
                  <span className="ml-1">{msg.note}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vel:</span>
                  <span className="ml-1">{msg.velocity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        {messages.length} messages captured
      </div>
    </div>
  );
};

export default MIDIMonitor;
