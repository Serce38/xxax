import { Animal, AnimalCategory, FeedItem, FinanceRecord, RationPlan } from '../types/farm';

// Standart koyun gebelik süresi: ortalama 150 gün (148-152 gün arası)
export const GESTATION_DAYS = 150;

/**
 * Gebelik tahmini doğum tarihini hesaplar (Aşım + 150 gün)
 */
export function calculateDueDate(matingDateStr: string): string {
  const matingDate = new Date(matingDateStr);
  const dueDate = new Date(matingDate.getTime() + GESTATION_DAYS * 24 * 60 * 60 * 1000);
  return dueDate.toISOString().split('T')[0];
}

/**
 * Gebeliğin kaçıncı gününde olunduğu ve kalan gün hesabı
 */
export function getPregnancyProgress(matingDateStr: string, dueDateStr?: string): {
  dayOfPregnancy: number;
  daysRemaining: number;
  progressPercent: number;
  isOverdue: boolean;
} {
  const mating = new Date(matingDateStr).getTime();
  const now = new Date().getTime();
  const due = dueDateStr ? new Date(dueDateStr).getTime() : mating + GESTATION_DAYS * 24 * 60 * 60 * 1000;
  
  const elapsedMs = now - mating;
  const dayOfPregnancy = Math.max(0, Math.floor(elapsedMs / (24 * 60 * 60 * 1000)));
  const remainingMs = due - now;
  const daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  const progressPercent = Math.min(100, Math.max(0, Math.round((dayOfPregnancy / GESTATION_DAYS) * 100)));
  const isOverdue = daysRemaining < 0;

  return {
    dayOfPregnancy,
    daysRemaining,
    progressPercent,
    isOverdue
  };
}

/**
 * Hayvanın yaşını insan okunabilir formatta hesaplar (Örn: "2 Yaş 4 Ay" veya "45 Günlük")
 */
export function calculateAge(birthDateStr: string): string {
  const birth = new Date(birthDateStr);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 60) {
    return `${diffDays} Günlük`;
  }
  
  const months = Math.floor(diffDays / 30.4375);
  if (months < 12) {
    return `${months} Aylık`;
  }
  
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) {
    return `${years} Yaşında`;
  }
  return `${years} Yaş ${remMonths} Ay`;
}

/**
 * Günlük Canlı Ağırlık Artışı (GCAA / ADG) hesaplar (Gram / Gün)
 */
export function calculateADG(
  w1: number, 
  d1: string, 
  w2: number, 
  d2: string
): { adgGrams: number; days: number } {
  const date1 = new Date(d1).getTime();
  const date2 = new Date(d2).getTime();
  const days = Math.max(1, Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)));
  const gainKg = w2 - w1;
  const adgGrams = Math.round((gainKg * 1000) / days);
  return { adgGrams, days };
}

/**
 * Kategori Etiketi ve Renk Sınıfı
 */
export function getCategoryMeta(cat: AnimalCategory): {
  label: string;
  badgeClass: string;
  dotColor: string;
} {
  switch (cat) {
    case 'anac_koyun':
      return {
        label: 'Anaç Koyun',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        dotColor: 'bg-emerald-500'
      };
    case 'koc':
      return {
        label: 'Koç',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
        dotColor: 'bg-amber-500'
      };
    case 'toklu':
      return {
        label: 'Toklu',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
        dotColor: 'bg-indigo-500'
      };
    case 'kuzu':
      return {
        label: 'Kuzu',
        badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
        dotColor: 'bg-sky-500'
      };
  }
}

/**
 * Yaşam Durumu Etiketi ve Rengi
 */
export function getStatusMeta(status: Animal['status']): {
  label: string;
  colorClass: string;
} {
  switch (status) {
    case 'aktif':
      return { label: 'Aktif Sürüde', colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' };
    case 'satildi':
      return { label: 'Satıldı', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' };
    case 'kesildi':
      return { label: 'Kesildi', colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' };
    case 'oldu':
      return { label: 'Öldü / Telef', colorClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' };
  }
}

/**
 * İlaç Arınma (Karantina) Süresi Kontrolü
 */
export function checkWithdrawalActive(endDateStr?: string): {
  isActive: boolean;
  remainingDays: number;
} {
  if (!endDateStr) return { isActive: false, remainingDays: 0 };
  const end = new Date(endDateStr).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return {
    isActive: diffDays > 0,
    remainingDays: Math.max(0, diffDays)
  };
}

/**
 * Rasyon Besin Değeri ve Maliyet Analizi
 */
export function analyzeRation(plan: RationPlan, feeds: FeedItem[]): {
  totalDailyCostPerHead: number;
  totalDailyCostGroup: number;
  totalDryMatterKg: number;
  totalProteinGrams: number;
  crudeProteinPercent: number;
  totalEnergyMcal: number;
  energyDensityMcalPerKgKM: number;
} {
  const feedMap = new Map(feeds.map(f => [f.id, f]));
  let totalCostPerHead = 0;
  let totalDM = 0;
  let totalProteinGrams = 0;
  let totalEnergy = 0;

  for (const item of plan.ingredients) {
    const feed = feedMap.get(item.feedId);
    if (!feed) continue;
    const kg = item.amountKgPerAnimal;
    totalCostPerHead += kg * feed.unitCost;
    
    // Kuru Madde kg
    const dmKg = kg * (feed.dryMatterPct / 100);
    totalDM += dmKg;

    // Protein gram (KM üzerinden)
    const proteinGrams = dmKg * (feed.crudeProteinPct / 100) * 1000;
    totalProteinGrams += proteinGrams;

    // Enerji (ME Mcal)
    totalEnergy += dmKg * feed.metabolicEnergy;
  }

  const crudeProteinPercent = totalDM > 0 ? (totalProteinGrams / (totalDM * 1000)) * 100 : 0;
  const energyDensityMcalPerKgKM = totalDM > 0 ? totalEnergy / totalDM : 0;

  return {
    totalDailyCostPerHead: Math.round(totalCostPerHead * 100) / 100,
    totalDailyCostGroup: Math.round(totalCostPerHead * plan.animalCount * 100) / 100,
    totalDryMatterKg: Math.round(totalDM * 100) / 100,
    totalProteinGrams: Math.round(totalProteinGrams),
    crudeProteinPercent: Math.round(crudeProteinPercent * 10) / 10,
    totalEnergyMcal: Math.round(totalEnergy * 100) / 100,
    energyDensityMcalPerKgKM: Math.round(energyDensityMcalPerKgKM * 100) / 100
  };
}

/**
 * Finansal Özet ve Başa Baş (Break-even) Analizi
 */
export function calculateFinancialSummary(
  finances: FinanceRecord[], 
  activeAnimalCount: number,
  lambCountProduced: number
): {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
  costPerAnimal: number;
  costPerLambProduced: number;
  breakEvenLambsNeeded: number;
  averageLambSalePrice: number;
} {
  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};

  let totalLambSalesAmount = 0;
  let lambSalesCount = 0;

  for (const item of finances) {
    if (item.type === 'gelir') {
      totalIncome += item.amount;
      incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount;
      if (item.category === 'kuzu_satisi') {
        totalLambSalesAmount += item.amount;
        lambSalesCount += 1;
      }
    } else {
      totalExpense += item.amount;
      expenseByCategory[item.category] = (expenseByCategory[item.category] || 0) + item.amount;
    }
  }

  const netProfit = totalIncome - totalExpense;
  const costPerAnimal = activeAnimalCount > 0 ? Math.round(totalExpense / activeAnimalCount) : 0;
  const costPerLambProduced = lambCountProduced > 0 ? Math.round(totalExpense / lambCountProduced) : 0;

  // Ortalama kuzu satış fiyatı (yoksa varsayılan 5.000 TL piyasa ortalaması)
  const averageLambSalePrice = lambSalesCount > 0 ? Math.round(totalLambSalesAmount / lambSalesCount) : 5200;
  const breakEvenLambsNeeded = averageLambSalePrice > 0 ? Math.ceil(totalExpense / averageLambSalePrice) : 0;

  return {
    totalIncome,
    totalExpense,
    netProfit,
    expenseByCategory,
    incomeByCategory,
    costPerAnimal,
    costPerLambProduced,
    breakEvenLambsNeeded,
    averageLambSalePrice
  };
}

/**
 * Para formatlama (Türk Lirası)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(amount);
}
