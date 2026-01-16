import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Nation } from "@shared/schema";

interface RadarFiltersProps {
  nation: Nation;
  onNationChange: (nation: Nation) => void;
  month: string;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  minSales: number;
  onMinSalesChange: (value: number) => void;
  excludeNewEntry: boolean;
  onExcludeNewEntryChange: (value: boolean) => void;
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${year}년 ${parseInt(m)}월`;
}

export function RadarFilters({
  nation,
  onNationChange,
  month,
  availableMonths,
  onMonthChange,
  minSales,
  onMinSalesChange,
  excludeNewEntry,
  onExcludeNewEntryChange,
}: RadarFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between flex-wrap">
        <Tabs
          value={nation}
          onValueChange={(v) => onNationChange(v as Nation)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full sm:w-auto grid-cols-2" data-testid="tabs-nation">
            <TabsTrigger value="domestic" data-testid="tab-domestic">국산</TabsTrigger>
            <TabsTrigger value="export" data-testid="tab-export">수입</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={month} onValueChange={onMonthChange}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-month">
            <SelectValue placeholder="월 선택" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((m) => (
              <SelectItem key={m} value={m} data-testid={`option-month-${m}`}>
                {formatMonth(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-lg bg-muted/50 flex-wrap">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Label htmlFor="min-sales" className="text-sm font-medium">
              최소 판매량
            </Label>
            <span className="text-sm text-muted-foreground font-medium">
              {minSales.toLocaleString()}대 이상
            </span>
          </div>
          <Slider
            id="min-sales"
            value={[minSales]}
            onValueChange={(v) => onMinSalesChange(v[0])}
            min={0}
            max={2000}
            step={50}
            className="w-full"
            data-testid="slider-min-sales"
          />
        </div>

        <div className="flex items-center gap-3 sm:border-l sm:pl-6 sm:border-border">
          <Switch
            id="exclude-new"
            checked={excludeNewEntry}
            onCheckedChange={onExcludeNewEntryChange}
            data-testid="switch-exclude-new"
          />
          <Label htmlFor="exclude-new" className="text-sm cursor-pointer">
            신규 진입 제외
          </Label>
        </div>
      </div>
    </div>
  );
}
