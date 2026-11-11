export type AnimalCategory = 'anac_koyun' | 'koc' | 'toklu' | 'kuzu';
export type AnimalGender = 'disi' | 'erkek';
export type AnimalStatus = 'aktif' | 'satildi' | 'kesildi' | 'oldu';
export type AnimalBreed = 
  | 'Merinos' 
  | 'Akkaraman' 
  | 'İvesi' 
  | 'Kıvırcık' 
  | 'Dorper' 
  | 'Sakız' 
  | 'Kangal' 
  | 'Diğer';

export interface WeightRecord {
  date: string;
  weight: number; // kg
  note?: string;
}

export interface QuarantineInfo {
  meatUntil?: string; // Et arınma tarihi YYYY-MM-DD
  milkUntil?: string; // Süt arınma tarihi YYYY-MM-DD
  medicineName?: string;
  active: boolean;
}

export interface Animal {
  id: string;
  earTag: string; // Kulak küpe no: örn "TR 16 00842"
  electronicTag?: string; // RFID / Chip
  name?: string;
  category: AnimalCategory;
  gender: AnimalGender;
  breed: AnimalBreed;
  birthDate: string; // YYYY-MM-DD
  status: AnimalStatus;
  statusChangeDate?: string;
  statusReason?: string;
  salePrice?: number; // Satıldıysa tutar
  origin: 'dogum' | 'satin_alma';
  originFarm?: string; // Geldiği İşletme
  motherTag?: string; // Anne Küpesi (Soy kütüğü)
  fatherTag?: string; // Baba Küpesi (Soy kütüğü)
  padok: string; // Padok / Bölme
  currentWeight: number; // kg
  weightHistory: WeightRecord[];
  isPregnant?: boolean;
  pregnancyDueDate?: string; // Tahmini doğum
  lastMatingDate?: string;
  quarantine?: QuarantineInfo;
  notes?: string;
  createdAt: string;
}

export interface MatingGroup {
  id: string;
  groupName: string;
  ramTag: string;
  ramBreed?: string;
  startDate: string;
  endDate?: string;
  padok: string;
  assignedEweTags: string[];
  status: 'aktif' | 'tamamlandi';
  notes?: string;
}

export interface PregnancyRecord {
  id: string;
  eweTag: string;
  ramTag?: string;
  matingDate: string;
  ultrasoundDate?: string;
  ultrasoundResult?: 'pozitif' | 'negatif' | 'supheli';
  expectedDueDate: string; // 150 gün sonra
  expectedLambCount?: number;
  actualBirthDate?: string;
  status: 'beklemede' | 'dogurdu' | 'dusuk' | 'bos';
  notes?: string;
}

export type BirthDifficulty = 'kolay' | 'yardimli' | 'guc' | 'sezaryen';

export interface NewbornLambItem {
  id: string;
  earTag: string;
  gender: AnimalGender;
  birthWeight: number; // kg
  status: 'canli' | 'olu';
  weaningDate?: string;
  weaningWeight?: number;
  isWeaned?: boolean;
}

export interface BirthRecord {
  id: string;
  eweTag: string;
  ramTag?: string;
  birthDate: string;
  difficulty: BirthDifficulty;
  totalLambs: number;
  aliveLambs: number;
  stillbornLambs: number;
  lambs: NewbornLambItem[];
  padok: string;
  notes?: string;
}

export type HealthRecordType = 'asi' | 'ic_parazit' | 'dis_parazit' | 'tirnak' | 'tedavi';

export interface HealthRecord {
  id: string;
  targetType: 'suru' | 'bireysel' | 'padok';
  targetTags: string[]; // Küpeler veya padok adı
  type: HealthRecordType;
  title: string; // Örn: Enterotoksemi / Çelerme Aşısı
  medicineName: string;
  dosage: string;
  applicationDate: string;
  nextScheduledDate?: string;
  meatWithdrawalDays: number; // Et arınma süresi (gün)
  milkWithdrawalDays: number; // Süt arınma süresi (gün)
  meatWithdrawalEndDate?: string;
  milkWithdrawalEndDate?: string;
  vetName?: string;
  cost: number;
  notes?: string;
}

export type FeedType = 'kaba' | 'konsantre' | 'mineral';

export interface FeedItem {
  id: string;
  name: string;
  type: FeedType;
  stockKg: number;
  minThresholdKg: number;
  unitCost: number; // TL / kg
  dryMatterPct: number; // Kuru Madde % (ör: 88%)
  crudeProteinPct: number; // Ham Protein % (ör: 18%)
  metabolicEnergy: number; // ME Mcal/kg (ör: 2.6)
  unit: 'kg' | 'balya' | 'torba';
  notes?: string;
}

export interface RationIngredient {
  feedId: string;
  amountKgPerAnimal: number;
}

export interface RationPlan {
  id: string;
  name: string;
  targetGroup: 'kuru_donem' | 'gebelik_son_ay' | 'laktasyon_ikiz' | 'laktasyon_tekiz' | 'besi_kuzusu' | 'damizlik_koc';
  targetGroupLabel: string;
  animalCount: number;
  ingredients: RationIngredient[];
  notes?: string;
}

export type FinanceType = 'gelir' | 'gider';

export type ExpenseCategory = 
  | 'yem' 
  | 'veteriner_ilac' 
  | 'iscilik' 
  | 'enerji_yakit' 
  | 'bakim_onarim' 
  | 'amortisman' 
  | 'diger_gider';

export type IncomeCategory = 
  | 'kuzu_satisi' 
  | 'damizlik_satisi' 
  | 'yapagi_yun' 
  | 'sut_satisi' 
  | 'gubre_satisi' 
  | 'destekleme_tesvik' 
  | 'diger_gelir';

export interface FinanceRecord {
  id: string;
  type: FinanceType;
  category: ExpenseCategory | IncomeCategory;
  categoryLabel: string;
  amount: number;
  date: string;
  description: string;
  relatedAnimalTag?: string;
  paymentStatus: 'odendi' | 'bekliyor';
  // Yem alımı entegrasyonu
  feedId?: string;
  feedQuantityKg?: number;
  feedUnitPrice?: number;
}

// 1. Ortaklık ve Kâr/Zarar Dağılımı
export interface FarmPartner {
  id: string;
  name: string;
  phone: string;
  sharePercent: number; // % ortaklık payı (ör: 50)
  investmentAmount?: number; // Başlangıç sermaye/katkı payı (TL)
  joinDate: string;
  notes?: string;
}

// 2. Zayi / Atık Yem Takibi
export type FeedWasteReason = 
  | 'bozulma_kuf' 
  | 'kemirgen_hasari' 
  | 'dokulme_israf' 
  | 'nem_rutubet' 
  | 'diger';

export interface FeedWasteRecord {
  id: string;
  feedId: string;
  feedName: string;
  amountKg: number;
  reason: FeedWasteReason;
  reasonLabel: string;
  costTL: number;
  date: string;
  notes?: string;
}

// 3. Depo & Demirbaş Yönetimi
export type EquipmentCategory = 
  | 'makine_ekipman' 
  | 'barinak_cit' 
  | 'suluk_yemlik' 
  | 'sagim_sut' 
  | 'guvenlik_enerji' 
  | 'diger';

export type EquipmentCondition = 'yeni' | 'iyi' | 'bakim_gerekli' | 'arizali';

export interface FarmEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  categoryLabel: string;
  quantity: number;
  purchaseDate: string;
  estimatedValueTL: number; // Toplam veya birim rayiç değeri
  condition: EquipmentCondition;
  conditionLabel: string;
  serialOrTagNo?: string;
  notes?: string;
}

export interface FarmAlert {
  id: string;
  type: 'dogum' | 'asi' | 'karantina' | 'yem' | 'weaning';
  level: 'acil' | 'uyari' | 'bilgi';
  title: string;
  message: string;
  targetTag?: string;
  date?: string;
  remainingDays?: number;
}
