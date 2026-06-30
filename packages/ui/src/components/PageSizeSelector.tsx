import { useEffect, useRef, useState } from 'react';
import { useImpositionStore } from '../store';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mmToUnit, unitToMm } from '@imposition/core';

const PAGE_PRESETS = {
  A4: { widthMm: 210, heightMm: 297, label: 'A4' },
  A3: { widthMm: 297, heightMm: 420, label: 'A3' },
  A5: { widthMm: 148, heightMm: 210, label: 'A5' },
  Letter: { widthMm: 215.9, heightMm: 279.4, label: 'Letter' },
  Legal: { widthMm: 215.9, heightMm: 355.6, label: 'Legal' },
  Photo: { widthMm: 100, heightMm: 150, label: 'Photo' },
} as const;

type PresetKey = keyof typeof PAGE_PRESETS;

export function PageSizeSelector() {
  const pageWidthMm = useImpositionStore((s) => s.pageWidthMm);
  const pageHeightMm = useImpositionStore((s) => s.pageHeightMm);
  const unit = useImpositionStore((s) => s.unit);
  const setPageSize = useImpositionStore((s) => s.setPageSize);

  const [selectMode, setSelectMode] = useState<PresetKey | 'custom'>('A4');
  const widthRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectMode === 'custom') {
      widthRef.current?.focus();
    }
  }, [selectMode]);

  const handleValueChange = (value: string) => {
    if (value === 'custom') {
      setSelectMode('custom');
      return;
    }
    const preset = PAGE_PRESETS[value as PresetKey];
    if (preset) {
      setSelectMode(value as PresetKey);
      setPageSize(preset.widthMm, preset.heightMm);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-sidebar-foreground/80">Page format</Label>
      <Select value={selectMode} onValueChange={handleValueChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PAGE_PRESETS) as PresetKey[]).map((key) => (
            <SelectItem key={key} value={key} className="text-xs">
              {PAGE_PRESETS[key].label} ({mmToUnit(PAGE_PRESETS[key].widthMm, unit)}&times;
              {mmToUnit(PAGE_PRESETS[key].heightMm, unit)} {unit})
            </SelectItem>
          ))}
          <SelectItem value="custom" className="text-xs">
            Custom
          </SelectItem>
        </SelectContent>
      </Select>
      {selectMode === 'custom' && (
        <div className="flex items-center gap-2">
          <Input
            ref={widthRef}
            type="number"
            value={mmToUnit(pageWidthMm, unit)}
            min={mmToUnit(50, unit)}
            max={mmToUnit(1000, unit)}
            step={unit === 'cm' ? 0.1 : 1}
            onChange={(e) => setPageSize(unitToMm(Number(e.target.value), unit), pageHeightMm)}
            className="h-7 text-xs"
          />
          <span className="text-xs text-sidebar-foreground/50">&times;</span>
          <Input
            type="number"
            value={mmToUnit(pageHeightMm, unit)}
            min={mmToUnit(50, unit)}
            max={mmToUnit(1000, unit)}
            step={unit === 'cm' ? 0.1 : 1}
            onChange={(e) => setPageSize(pageWidthMm, unitToMm(Number(e.target.value), unit))}
            className="h-7 text-xs"
          />
          <span className="text-xs text-sidebar-foreground/50">{unit}</span>
        </div>
      )}
    </div>
  );
}
