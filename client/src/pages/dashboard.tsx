import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { RadarCard } from "@/components/radar-card";
import { RadarFilters } from "@/components/radar-filters";
import { RadarListSkeleton } from "@/components/radar-skeleton";
import { EmptyState } from "@/components/empty-state";
import type { Nation, RadarResponse } from "@shared/schema";

function buildRadarUrl(nation: Nation, month?: string): string {
  const params = new URLSearchParams();
  params.set("nation", nation);
  if (month) params.set("month", month);
  return `/api/radar?${params.toString()}`;
}

export default function Dashboard() {
  const [nation, setNation] = useState<Nation>("domestic");
  const [month, setMonth] = useState<string>("");
  const [minSales, setMinSales] = useState(300);
  const [excludeNewEntry, setExcludeNewEntry] = useState(false);

  const url = buildRadarUrl(nation, month || undefined);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<RadarResponse>({
    queryKey: [url],
  });

  const actualMonth = month || data?.currentMonth || "";
  const availableMonths = data?.availableMonths || [];

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    
    return data.data
      .filter((model) => {
        if (model.sales < minSales) return false;
        if (excludeNewEntry && model.prevSales === 0) return false;
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [data?.data, minSales, excludeNewEntry]);

  const stats = useMemo(() => {
    if (!data?.data) return null;
    
    const filtered = data.data.filter(m => m.sales >= minSales);
    const totalSales = filtered.reduce((sum, m) => sum + m.sales, 0);
    const avgGrowth = filtered.length > 0 
      ? filtered.reduce((sum, m) => sum + m.momPct, 0) / filtered.length 
      : 0;
    const risersCount = filtered.filter(m => m.momAbs > 0).length;
    
    return { totalSales, avgGrowth, risersCount, totalCount: filtered.length };
  }, [data?.data, minSales]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight" data-testid="text-header-title">자동차 판매 레이더</h1>
              <p className="text-xs text-muted-foreground" data-testid="text-header-subtitle">다나와 기반 급상승 모델</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4" data-testid="card-total-sales">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">총 판매량</p>
                  <p className="font-bold text-lg" data-testid="text-total-sales">{stats.totalSales.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4" data-testid="card-avg-growth">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">평균 성장률</p>
                  <p className="font-bold text-lg" data-testid="text-avg-growth">
                    {stats.avgGrowth >= 0 ? "+" : ""}{(stats.avgGrowth * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4" data-testid="card-risers-count">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">상승 모델</p>
                  <p className="font-bold text-lg" data-testid="text-risers-count">{stats.risersCount}개</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4" data-testid="card-total-count">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">전체 모델</p>
                  <p className="font-bold text-lg" data-testid="text-total-count">{stats.totalCount}개</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card className="p-4 md:p-6">
          <RadarFilters
            nation={nation}
            onNationChange={setNation}
            month={actualMonth}
            availableMonths={availableMonths}
            onMonthChange={setMonth}
            minSales={minSales}
            onMinSalesChange={setMinSales}
            excludeNewEntry={excludeNewEntry}
            onExcludeNewEntryChange={setExcludeNewEntry}
          />
        </Card>

        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 flex-wrap" data-testid="text-section-title">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              Top 20 급상승 모델
            </h2>
            <span className="text-sm text-muted-foreground" data-testid="text-current-month">
              {actualMonth && `${actualMonth.split("-")[0]}년 ${parseInt(actualMonth.split("-")[1])}월 기준`}
            </span>
          </div>

          {isLoading ? (
            <RadarListSkeleton count={10} />
          ) : isError ? (
            <Card className="p-8">
              <EmptyState
                title="데이터를 불러올 수 없습니다"
                description="잠시 후 다시 시도해주세요."
              />
            </Card>
          ) : filteredData.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                title="조건에 맞는 모델이 없습니다"
                description="필터 조건을 변경해보세요."
              />
            </Card>
          ) : (
            <div className="space-y-4" data-testid="radar-list">
              {filteredData.map((model, index) => (
                <RadarCard key={model.id} model={model} rank={index + 1} />
              ))}
            </div>
          )}
        </div>

        <footer className="pt-8 pb-4 text-center text-xs text-muted-foreground">
          <p>데이터 출처: 다나와 자동차 (KAMA/KAIDA 기반)</p>
          <p className="mt-1">국산: 매월 1일, 트림 상세 25일 / 수입: 15일경 갱신</p>
        </footer>
      </main>
    </div>
  );
}
