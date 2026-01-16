import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

type Nation = "domestic" | "export";

interface RadarModel {
  id: string;
  month: string;
  nation: Nation;
  rank: number;
  prevRank: number | null;
  modelName: string;
  brandName: string;
  sales: number;
  prevSales: number;
  momAbs: number;
  momPct: number;
  rankChange: number;
  score: number;
  danawaUrl: string;
}

interface RadarQuery {
  month?: string;
  nation?: Nation;
  minSales?: number;
  excludeNewEntry?: boolean;
}

interface RadarResponse {
  data: RadarModel[];
  currentMonth: string;
  availableMonths: string[];
}

function zScore(values: number[]): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length) || 1;
  return values.map(v => (v - mean) / std);
}

function calculateScores(models: Omit<RadarModel, "score">[]): RadarModel[] {
  if (models.length === 0) return [];
  
  const momAbsValues = models.map(m => m.momAbs);
  const momPctValues = models.map(m => Math.min(m.momPct, 5));
  const rankChangeValues = models.map(m => m.rankChange);
  
  const zMomAbs = zScore(momAbsValues);
  const zMomPct = zScore(momPctValues);
  const zRankChange = zScore(rankChangeValues);
  
  return models.map((model, i) => ({
    ...model,
    score: 0.55 * zMomAbs[i] + 0.35 * zMomPct[i] + 0.10 * zRankChange[i],
  }));
}

const domesticModels = [
  { brand: "현대", models: ["그랜저", "아반떼", "쏘나타", "투싼", "싼타페", "팰리세이드", "캐스퍼", "아이오닉5", "아이오닉6", "코나", "스타리아", "베뉴", "넥쏘"] },
  { brand: "기아", models: ["쏘렌토", "셀토스", "카니발", "스포티지", "K8", "K5", "K3", "레이", "모닝", "니로", "EV6", "EV9", "봉고3", "모하비"] },
  { brand: "제네시스", models: ["G80", "G90", "GV70", "GV80", "G70", "GV60", "GV80쿠페"] },
  { brand: "르노코리아", models: ["QM6", "XM3", "SM6", "그랑 콜레오스", "아르카나"] },
  { brand: "KG모빌리티", models: ["토레스", "코란도", "렉스턴", "티볼리", "렉스턴스포츠"] },
  { brand: "쉐보레", models: ["트레일블레이저", "트랙스", "이쿼녹스", "볼트EV", "타호", "콜로라도"] },
];

const importModels = [
  { brand: "벤츠", models: ["E-Class", "S-Class", "C-Class", "GLE", "GLC", "A-Class", "EQS", "EQE", "AMG GT"] },
  { brand: "BMW", models: ["5시리즈", "3시리즈", "7시리즈", "X5", "X3", "X7", "iX", "i4", "M3", "M5"] },
  { brand: "아우디", models: ["A6", "A4", "Q5", "Q7", "e-tron GT", "Q8", "A8", "RS6"] },
  { brand: "테슬라", models: ["모델Y", "모델3", "모델S", "모델X", "사이버트럭"] },
  { brand: "폭스바겐", models: ["티구안", "파사트", "골프", "ID.4", "아테온", "투아렉"] },
  { brand: "볼보", models: ["XC60", "XC90", "S90", "XC40", "EX30", "EX90", "C40"] },
  { brand: "렉서스", models: ["ES", "RX", "NX", "LS", "LX", "RZ", "GX"] },
  { brand: "토요타", models: ["캠리", "RAV4", "프리우스", "하이랜더", "크라운", "bZ4X"] },
  { brand: "포르쉐", models: ["카이엔", "마칸", "911", "파나메라", "타이칸"] },
];

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateSampleData(nation: Nation, month: string): RadarModel[] {
  const modelList = nation === "domestic" ? domesticModels : importModels;
  const models: Omit<RadarModel, "score">[] = [];
  
  let rank = 1;
  const seed = month.split("-").reduce((a, b) => a + parseInt(b), 0);
  
  for (const brandData of modelList) {
    for (const modelName of brandData.models) {
      const pseudoRandom = Math.sin(seed * rank * 9999) * 10000;
      const randomValue = pseudoRandom - Math.floor(pseudoRandom);
      
      const baseSales = Math.floor(randomValue * 5000) + 200;
      const changePercent = (randomValue - 0.3) * 0.8;
      const prevSales = Math.max(0, Math.floor(baseSales / (1 + changePercent)));
      const sales = baseSales;
      const momAbs = sales - prevSales;
      const momPct = prevSales > 0 ? momAbs / prevSales : changePercent > 0 ? 5 : 0;
      
      const prevRank = rank + Math.floor((randomValue - 0.5) * 20);
      const rankChange = prevRank - rank;
      
      models.push({
        id: generateId(),
        month,
        nation,
        rank,
        prevRank: prevSales > 0 ? prevRank : null,
        modelName,
        brandName: brandData.brand,
        sales,
        prevSales,
        momAbs,
        momPct,
        rankChange,
        danawaUrl: `https://auto.danawa.com/auto/?Month=${month}-00&Nation=${nation === "domestic" ? "domestic" : "export"}&Tab=Model&Work=record`,
      });
      
      rank++;
    }
  }
  
  return calculateScores(models);
}

function getAvailableMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  for (let i = 0; i < 12; i++) {
    let year = currentYear;
    let month = currentMonth - i;
    
    if (month < 0) {
      month += 12;
      year -= 1;
    }
    
    months.push(`${year}-${String(month + 1).padStart(2, "0")}`);
  }
  
  return months;
}

function getCurrentMonth(): string {
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return `${year}-${String(prevMonth + 1).padStart(2, "0")}`;
}

function getRadarData(query: RadarQuery): RadarResponse {
  const nation = query.nation || "domestic";
  const month = query.month || getCurrentMonth();
  const availableMonths = getAvailableMonths();
  const currentMonth = getCurrentMonth();
  
  let data = generateSampleData(nation, month);
  
  if (query.minSales !== undefined) {
    data = data.filter(m => m.sales >= query.minSales!);
  }
  
  if (query.excludeNewEntry) {
    data = data.filter(m => m.prevSales > 0);
  }
  
  return {
    data,
    currentMonth,
    availableMonths,
  };
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const params = event.queryStringParameters || {};
  
  try {
    const query: RadarQuery = {
      month: params.month || undefined,
      nation: (params.nation as Nation) || undefined,
      minSales: params.minSales ? Number(params.minSales) : undefined,
      excludeNewEntry: params.excludeNewEntry === "true",
    };
    
    const result = getRadarData(query);
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error fetching radar data:", error);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Invalid query parameters" }),
    };
  }
};

export { handler };
