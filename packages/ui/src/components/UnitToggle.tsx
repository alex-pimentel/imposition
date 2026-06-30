import { File } from 'lucide-react';
import { useImpositionStore } from '../store';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export function UnitToggle() {
  const unit = useImpositionStore((s) => s.unit);
  const setUnit = useImpositionStore((s) => s.setUnit);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2">
      <File size={14} className="text-sidebar-foreground/60" />
      <Label className="flex flex-1 items-center gap-2 text-xs text-sidebar-foreground/80">
        <span
          className={
            unit === 'mm' ? 'font-medium text-sidebar-foreground' : 'text-sidebar-foreground/50'
          }
        >
          mm
        </span>
        <Switch
          checked={unit === 'cm'}
          onCheckedChange={(v) => setUnit(v ? 'cm' : 'mm')}
          className="scale-75"
        />
        <span
          className={
            unit === 'cm' ? 'font-medium text-sidebar-foreground' : 'text-sidebar-foreground/50'
          }
        >
          cm
        </span>
      </Label>
    </div>
  );
}
