import { 
  Animal, 
  BirthRecord, 
  FarmEquipment,
  FarmPartner,
  FeedItem, 
  FeedWasteRecord,
  FinanceRecord, 
  HealthRecord, 
  MatingGroup, 
  PregnancyRecord, 
  RationPlan 
} from '../types/farm';
import { FarmRoom, User, UserFarmPermission } from '../types/auth';
import { 
  INITIAL_ANIMALS, 
  INITIAL_BIRTHS, 
  INITIAL_EQUIPMENTS,
  INITIAL_FEEDS, 
  INITIAL_FEED_WASTES,
  INITIAL_FINANCES, 
  INITIAL_HEALTH_RECORDS, 
  INITIAL_MATING_GROUPS, 
  INITIAL_PARTNERS,
  INITIAL_PREGNANCIES, 
  INITIAL_RATIONS 
} from '../data/mockData';

const STORAGE_KEY = 'ciftlik_pro_v2_data';

export interface FarmState {
  // Çok kullanıcılı ve Oda sistemi
  users: User[];
  farmRooms: FarmRoom[];
  permissions: UserFarmPermission[];
  activeUserId: string | null;
  activeFarmId: string | null;

  // Çiftlik Verileri
  animals: Animal[];
  matingGroups: MatingGroup[];
  pregnancies: PregnancyRecord[];
  births: BirthRecord[];
  healthRecords: HealthRecord[];
  feeds: FeedItem[];
  feedWastes: FeedWasteRecord[];
  rations: RationPlan[];
  finances: FinanceRecord[];
  partners: FarmPartner[];
  equipments: FarmEquipment[];
  lastSavedAt: string;
}

// Varsayılan Örnek Kullanıcılar ve Çiftlik Odası
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-01',
    username: 'mustafa',
    fullName: 'Mustafa Serçe (Çiftlik Sahibi)',
    passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // '123'
    salt: 'salt_mustafa',
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-02',
    username: 'ahmet',
    fullName: 'Ahmet Çoban (Sürü Yöneticisi)',
    passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    salt: 'salt_ahmet',
    createdAt: '2025-01-05'
  },
  {
    id: 'usr-03',
    username: 'kemal',
    fullName: 'Vet. Hekim Kemal Dağdelen',
    passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    salt: 'salt_kemal',
    createdAt: '2025-01-10'
  }
];

export const INITIAL_ROOMS: FarmRoom[] = [
  {
    id: 'farm-01',
    roomNumber: 'CF-1084',
    roomPasswordHash: 'koyun123',
    roomPasswordHint: 'koyun123',
    name: 'Bereket Damızlık Merinos Çiftliği',
    ownerId: 'usr-01',
    ownerUsername: 'mustafa',
    createdAt: '2025-01-01'
  }
];

export const INITIAL_PERMISSIONS: UserFarmPermission[] = [
  {
    id: 'perm-01',
    farmId: 'farm-01',
    userId: 'usr-01',
    username: 'mustafa',
    fullName: 'Mustafa Serçe (Çiftlik Sahibi)',
    role: 'owner',
    canEdit: true,
    joinedAt: '2025-01-01'
  },
  {
    id: 'perm-02',
    farmId: 'farm-01',
    userId: 'usr-02',
    username: 'ahmet',
    fullName: 'Ahmet Çoban (Sürü Yöneticisi)',
    role: 'editor',
    canEdit: true,
    joinedAt: '2025-01-05'
  },
  {
    id: 'perm-03',
    farmId: 'farm-01',
    userId: 'usr-03',
    username: 'kemal',
    fullName: 'Vet. Hekim Kemal Dağdelen',
    role: 'viewer',
    canEdit: false, // Salt okunur / Gözlemci
    joinedAt: '2025-01-10'
  }
];

export function loadFarmData(): FarmState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.animals)) {
        // Eski versiyondan migrate ediliyorsa eksik alanları doldur
        if (!parsed.users || !Array.isArray(parsed.users)) {
          parsed.users = INITIAL_USERS;
          parsed.farmRooms = INITIAL_ROOMS;
          parsed.permissions = INITIAL_PERMISSIONS;
          parsed.activeUserId = 'usr-01';
          parsed.activeFarmId = 'farm-01';
        }
        if (!parsed.partners || !Array.isArray(parsed.partners)) {
          parsed.partners = INITIAL_PARTNERS;
        }
        if (!parsed.feedWastes || !Array.isArray(parsed.feedWastes)) {
          parsed.feedWastes = INITIAL_FEED_WASTES;
        }
        if (!parsed.equipments || !Array.isArray(parsed.equipments)) {
          parsed.equipments = INITIAL_EQUIPMENTS;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('LocalStorage load failed, using seed data:', err);
  }

  const initial: FarmState = {
    users: INITIAL_USERS,
    farmRooms: INITIAL_ROOMS,
    permissions: INITIAL_PERMISSIONS,
    activeUserId: 'usr-01', // Varsayılan oturum açmış kullanıcı (Çiftlik Sahibi)
    activeFarmId: 'farm-01', // Varsayılan çiftlik odası

    animals: INITIAL_ANIMALS,
    matingGroups: INITIAL_MATING_GROUPS,
    pregnancies: INITIAL_PREGNANCIES,
    births: INITIAL_BIRTHS,
    healthRecords: INITIAL_HEALTH_RECORDS,
    feeds: INITIAL_FEEDS,
    feedWastes: INITIAL_FEED_WASTES,
    rations: INITIAL_RATIONS,
    finances: INITIAL_FINANCES,
    partners: INITIAL_PARTNERS,
    equipments: INITIAL_EQUIPMENTS,
    lastSavedAt: new Date().toISOString()
  };

  saveFarmData(initial);
  return initial;
}

export function saveFarmData(state: FarmState): void {
  try {
    state.lastSavedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('LocalStorage save error:', err);
  }
}

export function exportFarmDataAsJson(state: FarmState): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(state, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `ciftlik_pro_yedek_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importFarmDataFromJson(
  jsonText: string, 
  onSuccess: (data: FarmState) => void, 
  onError: (msg: string) => void
): void {
  try {
    const data = JSON.parse(jsonText);
    if (!data.animals || !Array.isArray(data.animals)) {
      throw new Error('Geçersiz dosya formatı: Hayvan kayıtları bulunamadı.');
    }
    saveFarmData(data);
    onSuccess(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Yedek yükleme başarısız';
    onError(message);
  }
}

export function resetFarmData(): FarmState {
  const initial: FarmState = {
    users: INITIAL_USERS,
    farmRooms: INITIAL_ROOMS,
    permissions: INITIAL_PERMISSIONS,
    activeUserId: 'usr-01',
    activeFarmId: 'farm-01',

    animals: INITIAL_ANIMALS,
    matingGroups: INITIAL_MATING_GROUPS,
    pregnancies: INITIAL_PREGNANCIES,
    births: INITIAL_BIRTHS,
    healthRecords: INITIAL_HEALTH_RECORDS,
    feeds: INITIAL_FEEDS,
    rations: INITIAL_RATIONS,
    finances: INITIAL_FINANCES,
    lastSavedAt: new Date().toISOString()
  };
  saveFarmData(initial);
  return initial;
}
