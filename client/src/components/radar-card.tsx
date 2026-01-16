import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Car } from "lucide-react";
import type { RadarModel } from "@shared/schema";

interface RadarCardProps {
  model: RadarModel;
  rank: number;
}

function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

function formatPercent(num: number): string {
  const sign = num > 0 ? "+" : "";
  return `${sign}${(num * 100).toFixed(1)}%`;
}

function formatChange(num: number): string {
  const sign = num > 0 ? "+" : "";
  return `${sign}${formatNumber(num)}`;
}

export function RadarCard({ model, rank }: RadarCardProps) {
  const isPositiveChange = model.momAbs > 0;
  const isNewEntry = model.prevSales === 0;
  const rankUp = model.rankChange > 0;
  const rankDown = model.rankChange < 0;

  return (
    <Card className="p-4" data-testid={`card-model-${model.id}`}>
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{rank}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg truncate" data-testid={`text-model-name-${model.id}`}>
              {model.modelName}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {model.brandName}
            </Badge>
            {isNewEntry && (
              <Badge className="bg-chart-2 text-white text-xs">NEW</Badge>
            )}
          </div>
          
          <div className="mt-2 flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium" data-testid={`text-sales-${model.id}`}>
                {formatNumber(model.sales)}
              </span>
              <span className="text-muted-foreground">대</span>
            </div>
            
            <div className={`flex items-center gap-1 ${isPositiveChange ? "text-chart-2" : "text-destructive"}`}>
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium" data-testid={`text-mom-abs-${model.id}`}>
                {formatChange(model.momAbs)}대
              </span>
              <span className="text-muted-foreground">
                ({formatPercent(model.momPct)})
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {rankUp && (
                <>
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <span className="text-chart-2 font-medium">
                    {model.rankChange}위
                  </span>
                </>
              )}
              {rankDown && (
                <>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-medium">
                    {Math.abs(model.rankChange)}위
                  </span>
                </>
              )}
              {!rankUp && !rankDown && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">순위 유지</span>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-muted-foreground">
              전월: {formatNumber(model.prevSales)}대 | 순위: {model.rank}위 (전월 {model.prevRank ?? "-"}위)
            </div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              data-testid={`button-danawa-link-${model.id}`}
            >
              <a href={model.danawaUrl} target="_blank" rel="noopener noreferrer">
                다나와 원문
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
