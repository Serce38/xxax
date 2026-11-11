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

// Tarihleri bugüne göre dinamik ayarlamak için yardımcı
const now = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (days: number) => {
  const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return formatDate(d);
};

export const INITIAL_ANIMALS: Animal[] = [
  // --- DAMIZLIK KOÇLAR ---
  {
    id: 'koc-01',
    earTag: 'TR 16 00101',
    name: 'Boran (Lider Koç)',
    category: 'koc',
    gender: 'erkek',
    breed: 'Merinos',
    birthDate: '2023-02-15',
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00012',
    fatherTag: 'TR 16 00001',
    padok: 'Padok K-1 (Damızlık Koçlar)',
    currentWeight: 112,
    weightHistory: [
      { date: '2024-03-01', weight: 95 },
      { date: '2024-09-10', weight: 104 },
      { date: '2025-01-15', weight: 112 }
    ],
    notes: 'Yüksek ikizlilik genotipli damızlık, sakin mizaçlı ve güçlü cüsse.',
    createdAt: '2023-02-15'
  },
  {
    id: 'koc-02',
    earTag: 'TR 16 00102',
    name: 'Karasakal',
    category: 'koc',
    gender: 'erkek',
    breed: 'Kıvırcık',
    birthDate: '2023-04-10',
    status: 'aktif',
    origin: 'satin_alma',
    originFarm: 'Mustafakemalpaşa Damızlık Birliği',
    padok: 'Padok K-1 (Damızlık Koçlar)',
    currentWeight: 98,
    weightHistory: [
      { date: '2024-05-01', weight: 88 },
      { date: '2024-11-20', weight: 98 }
    ],
    notes: 'Kıvırcık ırkı et kalitesi tescilli, kuyruksuz safkan.',
    createdAt: '2023-04-10'
  },
  {
    id: 'koc-03',
    earTag: 'TR 16 00103',
    name: 'Şahin (İvesi Koçu)',
    category: 'koc',
    gender: 'erkek',
    breed: 'İvesi',
    birthDate: '2022-11-05',
    status: 'aktif',
    origin: 'satin_alma',
    originFarm: 'Ceylanpınar TİGEM',
    padok: 'Padok K-2 (Sütçü Koçlar)',
    currentWeight: 105,
    weightHistory: [
      { date: '2024-01-10', weight: 96 },
      { date: '2024-10-15', weight: 105 }
    ],
    notes: 'Süt verimi rekorlu hat soyundan.',
    createdAt: '2022-11-05'
  },

  // --- ANAÇ KOYUNLAR ---
  {
    id: 'koyun-01',
    earTag: 'TR 16 00201',
    name: 'Kınalı 1',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'Merinos',
    birthDate: '2022-03-12',
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00045',
    fatherTag: 'TR 16 00001',
    padok: 'Padok A-1 (Doğumhane)',
    currentWeight: 74,
    weightHistory: [
      { date: '2024-02-10', weight: 68 },
      { date: '2024-08-15', weight: 71 },
      { date: '2025-01-20', weight: 74 }
    ],
    isPregnant: true,
    lastMatingDate: addDays(-147), // 147 gün önce aşım -> 3 GÜN SONRA DOĞUM!
    pregnancyDueDate: addDays(3),
    notes: 'Ultrason ile ikiz gebelik teyit edildi. Memeler dolmaya başladı.',
    createdAt: '2022-03-12'
  },
  {
    id: 'koyun-02',
    earTag: 'TR 16 00202',
    name: 'Gözlüklü',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'Merinos',
    birthDate: '2022-04-01',
    status: 'aktif',
    origin: 'dogum',
    padok: 'Padok A-1 (Doğumhane)',
    currentWeight: 76,
    weightHistory: [{ date: '2024-10-01', weight: 76 }],
    isPregnant: true,
    lastMatingDate: addDays(-150), // 150. GÜN: BUGÜN DOĞUM!
    pregnancyDueDate: addDays(0),
    notes: '150 günlük gebelik tamamlandı. Bugün doğum bekleniyor.',
    createdAt: '2022-04-01'
  },
  {
    id: 'koyun-03',
    earTag: 'TR 16 00203',
    name: 'Nazlı',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'Kıvırcık',
    birthDate: '2023-01-18',
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00050',
    fatherTag: 'TR 16 00102',
    padok: 'Padok B-2 (Gebe Sürü)',
    currentWeight: 66,
    weightHistory: [{ date: '2024-11-10', weight: 66 }],
    isPregnant: true,
    lastMatingDate: addDays(-135), // 15 gün sonra doğum
    pregnancyDueDate: addDays(15),
    notes: 'Ultrason: Tekiz kuzu.',
    createdAt: '2023-01-18'
  },
  {
    id: 'koyun-04',
    earTag: 'TR 16 00204',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'İvesi',
    birthDate: '2022-02-28',
    status: 'aktif',
    origin: 'satin_alma',
    originFarm: 'Şanlıurfa Damızlık Çiftliği',
    padok: 'Padok S-1 (Süt Sağılanlar)',
    currentWeight: 69,
    weightHistory: [{ date: '2024-12-05', weight: 69 }],
    isPregnant: false,
    quarantine: {
      active: true,
      meatUntil: addDays(12), // 12 gün kesim yasağı
      milkUntil: addDays(4),  // 4 gün süt dökülecek
      medicineName: 'Draxxin (Tulathromycin - Solunum Tedavisi)'
    },
    notes: 'Hafif öksürük tedavisi gördü. Arınma süresi bitene kadar süt sağılıp dökülmeli.',
    createdAt: '2022-02-28'
  },
  {
    id: 'koyun-05',
    earTag: 'TR 16 00205',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'Akkaraman',
    birthDate: '2021-10-15',
    status: 'aktif',
    origin: 'satin_alma',
    originFarm: 'Konya Karapınar İşletmesi',
    padok: 'Padok C (Mera Grubu)',
    currentWeight: 72,
    weightHistory: [{ date: '2024-09-01', weight: 72 }],
    isPregnant: true,
    lastMatingDate: addDays(-110),
    pregnancyDueDate: addDays(40),
    notes: 'Kaba yemi iyi değerlendiriyor, mera performansı yüksek.',
    createdAt: '2021-10-15'
  },
  {
    id: 'koyun-06',
    earTag: 'TR 16 00206',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'Sakız',
    birthDate: '2022-05-20',
    status: 'aktif',
    origin: 'satin_alma',
    originFarm: 'Çeşme Sakız Damızlığı',
    padok: 'Padok S-1 (Süt Sağılanlar)',
    currentWeight: 58,
    weightHistory: [{ date: '2024-11-12', weight: 58 }],
    isPregnant: false,
    notes: 'Geçen yıl üçüz doğurdu, süt verimi 2.5 litre/gün.',
    createdAt: '2022-05-20'
  },
  {
    id: 'koyun-07',
    earTag: 'TR 16 00207',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'Merinos',
    birthDate: '2022-03-25',
    status: 'aktif',
    origin: 'dogum',
    padok: 'Padok B-1 (Gebe Sürü)',
    currentWeight: 73,
    weightHistory: [{ date: '2024-10-15', weight: 73 }],
    isPregnant: true,
    lastMatingDate: addDays(-144),
    pregnancyDueDate: addDays(6), // 6 gün kaldı
    notes: 'Kondisyon skoru 3.5, meme gelişimi tamamlanmak üzere.',
    createdAt: '2022-03-25'
  },
  {
    id: 'koyun-08',
    earTag: 'TR 16 00208',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'Kıvırcık',
    birthDate: '2022-06-14',
    status: 'satildi',
    statusChangeDate: addDays(-20),
    statusReason: 'Damızlık olarak komşu işletmeye satıldı',
    salePrice: 12500,
    origin: 'dogum',
    padok: 'Ayrıldı',
    currentWeight: 67,
    weightHistory: [{ date: '2024-08-01', weight: 67 }],
    notes: 'Damızlık vasfı yüksek anaç satışı.',
    createdAt: '2022-06-14'
  },
  {
    id: 'koyun-09',
    earTag: 'TR 16 00209',
    category: 'anac_koyun',
    gender: 'disi',
    breed: 'Akkaraman',
    birthDate: '2020-04-10',
    status: 'oldu',
    statusChangeDate: addDays(-45),
    statusReason: 'Şişme (Akut Timpani / Gazlı Şişkinlik)',
    origin: 'dogum',
    padok: 'Kayıt Arşivi',
    currentWeight: 65,
    weightHistory: [{ date: '2024-05-01', weight: 65 }],
    notes: 'Mera dönüşü taze yoncaya bağlı gaz birikmesi, otopsi veteriner onaylı.',
    createdAt: '2020-04-10'
  },

  // --- TOKLULAR ---
  {
    id: 'toklu-01',
    earTag: 'TR 16 00301',
    name: 'Beyaz İnci',
    category: 'toklu',
    gender: 'disi',
    breed: 'Merinos',
    birthDate: '2024-02-10',
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00201',
    fatherTag: 'TR 16 00101',
    padok: 'Padok T-1 (Dişi Toklular)',
    currentWeight: 54,
    weightHistory: [
      { date: '2024-06-15', weight: 32 },
      { date: '2024-09-20', weight: 44 },
      { date: '2025-01-10', weight: 54 }
    ],
    notes: 'Gelecek sezon koça katılacak üstün genetik dişi toklu.',
    createdAt: '2024-02-10'
  },
  {
    id: 'toklu-02',
    earTag: 'TR 16 00302',
    category: 'toklu',
    gender: 'disi',
    breed: 'Merinos',
    birthDate: '2024-02-10',
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00201',
    fatherTag: 'TR 16 00101',
    padok: 'Padok T-1 (Dişi Toklular)',
    currentWeight: 52,
    weightHistory: [
      { date: '2024-06-15', weight: 30 },
      { date: '2025-01-10', weight: 52 }
    ],
    notes: 'Kınalı 1 ikiz yavrusu.',
    createdAt: '2024-02-10'
  },
  {
    id: 'toklu-03',
    earTag: 'TR 16 00303',
    name: 'Genç Boğa',
    category: 'toklu',
    gender: 'erkek',
    breed: 'Kıvırcık',
    birthDate: '2024-03-05',
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00203',
    fatherTag: 'TR 16 00102',
    padok: 'Padok T-2 (Aday Koçlar)',
    currentWeight: 68,
    weightHistory: [
      { date: '2024-07-01', weight: 42 },
      { date: '2024-11-15', weight: 58 },
      { date: '2025-01-25', weight: 68 }
    ],
    notes: 'Gelişimi mükemmel, aday damızlık koç.',
    createdAt: '2024-03-05'
  },

  // --- KUZULAR ---
  {
    id: 'kuzu-01',
    earTag: 'TR 16 00401',
    category: 'kuzu',
    gender: 'erkek',
    breed: 'Merinos',
    birthDate: addDays(-70), // 70 günlük -> Sütten kesilme zamanı!
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00202',
    fatherTag: 'TR 16 00101',
    padok: 'Padok KZ-1 (Kuzu Bölmesi)',
    currentWeight: 26.5,
    weightHistory: [
      { date: addDays(-70), weight: 4.2, note: 'Doğum ağırlığı' },
      { date: addDays(-30), weight: 16.0 },
      { date: addDays(-2), weight: 26.5 }
    ],
    notes: 'Günlük artış 318 gr/gün. Kuzu başlangıç yemini iştahla tüketiyor.',
    createdAt: addDays(-70)
  },
  {
    id: 'kuzu-02',
    earTag: 'TR 16 00402',
    category: 'kuzu',
    gender: 'disi',
    breed: 'Merinos',
    birthDate: addDays(-70),
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00202',
    fatherTag: 'TR 16 00101',
    padok: 'Padok KZ-1 (Kuzu Bölmesi)',
    currentWeight: 24.0,
    weightHistory: [
      { date: addDays(-70), weight: 3.8, note: 'Doğum ağırlığı' },
      { date: addDays(-2), weight: 24.0 }
    ],
    notes: 'İkiz dişi kuzu.',
    createdAt: addDays(-70)
  },
  {
    id: 'kuzu-03',
    earTag: 'TR 16 00403',
    category: 'kuzu',
    gender: 'erkek',
    breed: 'Kıvırcık',
    birthDate: addDays(-35),
    status: 'aktif',
    origin: 'dogum',
    motherTag: 'TR 16 00203',
    fatherTag: 'TR 16 00102',
    padok: 'Padok KZ-2 (Emzirenler)',
    currentWeight: 14.5,
    weightHistory: [
      { date: addDays(-35), weight: 4.5, note: 'Doğum ağırlığı' },
      { date: addDays(-5), weight: 14.5 }
    ],
    notes: 'Annesini emiyor, kaba yem tırtıklamaya başladı.',
    createdAt: addDays(-35)
  },
  {
    id: 'kuzu-04',
    earTag: 'TR 16 00404',
    category: 'kuzu',
    gender: 'erkek',
    breed: 'Merinos',
    birthDate: addDays(-110),
    status: 'satildi',
    statusChangeDate: addDays(-10),
    statusReason: 'Kurbanlık/Besi satışı (42 kg canlı ağırlık)',
    salePrice: 6500,
    origin: 'dogum',
    padok: 'Satıldı',
    currentWeight: 42,
    weightHistory: [
      { date: addDays(-110), weight: 4.1 },
      { date: addDays(-10), weight: 42 }
    ],
    notes: 'Besi randımanı %52.',
    createdAt: addDays(-110)
  }
];

export const INITIAL_MATING_GROUPS: MatingGroup[] = [
  {
    id: 'mating-01',
    groupName: 'Grup 1 - Merinos Islah ve Et Verimi',
    ramTag: 'TR 16 00101',
    ramBreed: 'Merinos',
    startDate: addDays(-150),
    endDate: addDays(-110),
    padok: 'Padok B-1',
    assignedEweTags: ['TR 16 00201', 'TR 16 00202', 'TR 16 00207'],
    status: 'aktif',
    notes: 'Aşım takvimi tamamlandı, gebelikler ultrasonla doğrulandı.'
  },
  {
    id: 'mating-02',
    groupName: 'Grup 2 - Kıvırcık Safkan Aşımı',
    ramTag: 'TR 16 00102',
    ramBreed: 'Kıvırcık',
    startDate: addDays(-138),
    endDate: addDays(-95),
    padok: 'Padok B-2',
    assignedEweTags: ['TR 16 00203', 'TR 16 00208'],
    status: 'aktif',
    notes: 'Doğal serbest aşım uygulandı.'
  }
];

export const INITIAL_PREGNANCIES: PregnancyRecord[] = [
  {
    id: 'preg-01',
    eweTag: 'TR 16 00202', // 150. GÜN: BUGÜN!
    ramTag: 'TR 16 00101',
    matingDate: addDays(-150),
    ultrasoundDate: addDays(-90),
    ultrasoundResult: 'pozitif',
    expectedDueDate: addDays(0),
    expectedLambCount: 2,
    status: 'beklemede',
    notes: 'Meme dolgun, kuyruk sokumu çökmüş durumda, doğum an meselesi.'
  },
  {
    id: 'preg-02',
    eweTag: 'TR 16 00201', // 3 GÜN KALDI
    ramTag: 'TR 16 00101',
    matingDate: addDays(-147),
    ultrasoundDate: addDays(-88),
    ultrasoundResult: 'pozitif',
    expectedDueDate: addDays(3),
    expectedLambCount: 2,
    status: 'beklemede',
    notes: 'Doğumhanede temiz altlık hazırlandı.'
  },
  {
    id: 'preg-03',
    eweTag: 'TR 16 00207', // 6 GÜN KALDI
    ramTag: 'TR 16 00101',
    matingDate: addDays(-144),
    ultrasoundDate: addDays(-85),
    ultrasoundResult: 'pozitif',
    expectedDueDate: addDays(6),
    expectedLambCount: 1,
    status: 'beklemede',
    notes: 'Tekiz iri yavru bekleniyor.'
  },
  {
    id: 'preg-04',
    eweTag: 'TR 16 00203', // 15 GÜN KALDI
    ramTag: 'TR 16 00102',
    matingDate: addDays(-135),
    ultrasoundDate: addDays(-75),
    ultrasoundResult: 'pozitif',
    expectedDueDate: addDays(15),
    expectedLambCount: 1,
    status: 'beklemede',
    notes: 'Konsantre yem takviyesi artırıldı.'
  },
  {
    id: 'preg-05',
    eweTag: 'TR 16 00205', // 40 GÜN KALDI
    ramTag: 'TR 16 00101',
    matingDate: addDays(-110),
    ultrasoundDate: addDays(-50),
    ultrasoundResult: 'pozitif',
    expectedDueDate: addDays(40),
    expectedLambCount: 2,
    status: 'beklemede',
    notes: 'Gebeliğin son dönemi besleme programına alındı.'
  }
];

export const INITIAL_BIRTHS: BirthRecord[] = [
  {
    id: 'birth-rec-01',
    eweTag: 'TR 16 00202',
    ramTag: 'TR 16 00101',
    birthDate: addDays(-70),
    difficulty: 'kolay',
    totalLambs: 2,
    aliveLambs: 2,
    stillbornLambs: 0,
    padok: 'Padok A-1 (Doğumhane)',
    lambs: [
      {
        id: 'nl-01',
        earTag: 'TR 16 00401',
        gender: 'erkek',
        birthWeight: 4.2,
        status: 'canli',
        weaningDate: addDays(5),
        weaningWeight: 26.5,
        isWeaned: false
      },
      {
        id: 'nl-02',
        earTag: 'TR 16 00402',
        gender: 'disi',
        birthWeight: 3.8,
        status: 'canli',
        weaningDate: addDays(5),
        weaningWeight: 24.0,
        isWeaned: false
      }
    ],
    notes: 'Sorunsuz ikiz doğum. Göbek kordonu tentürdiyotla dezenfekte edildi, ağız sütü ilk 1 saat içinde emzirildi.'
  },
  {
    id: 'birth-rec-02',
    eweTag: 'TR 16 00203',
    ramTag: 'TR 16 00102',
    birthDate: addDays(-35),
    difficulty: 'kolay',
    totalLambs: 1,
    aliveLambs: 1,
    stillbornLambs: 0,
    padok: 'Padok A-2 (Doğumhane)',
    lambs: [
      {
        id: 'nl-03',
        earTag: 'TR 16 00403',
        gender: 'erkek',
        birthWeight: 4.5,
        status: 'canli',
        isWeaned: false
      }
    ],
    notes: 'Sağlıklı koç kuzusu.'
  }
];

export const INITIAL_HEALTH_RECORDS: HealthRecord[] = [
  {
    id: 'hlth-01',
    targetType: 'suru',
    targetTags: ['Tüm Anaç ve Koç Sürüsü (32 Hayvan)'],
    type: 'asi',
    title: 'Enterotoksemi (Çelerme) Aşısı',
    medicineName: 'Clostrivax 8 / Enterotoksemi Karma',
    dosage: '2 ml / Hayvan başı Cilt altı',
    applicationDate: addDays(-60),
    nextScheduledDate: addDays(120), // 6 ayda bir
    meatWithdrawalDays: 21,
    milkWithdrawalDays: 0,
    vetName: 'Vet. Hekim Kemal Dağdelen',
    cost: 1600,
    notes: 'Sürü geneli rapel doz uygulandı. Hiçbir lokal reaksiyon gözlenmedi.'
  },
  {
    id: 'hlth-02',
    targetType: 'suru',
    targetTags: ['Tüm Sürü'],
    type: 'asi',
    title: 'Koyun Keçi Çiçek Aşısı',
    medicineName: 'Poxvac Çiçek Aşısı (Doyuk)',
    dosage: '0.5 ml kuyruk altı dikiş',
    applicationDate: addDays(-180),
    nextScheduledDate: addDays(4), // 4 GÜN SONRA YENİLEME GEREKİYOR!
    meatWithdrawalDays: 14,
    milkWithdrawalDays: 0,
    vetName: 'Tarım İlçe Müdürlüğü Aşı Ekibi',
    cost: 850,
    notes: 'Bahar dönemi çiçek aşılama periyodu geldi.'
  },
  {
    id: 'hlth-03',
    targetType: 'suru',
    targetTags: ['Mera ve Ağıl Grubu'],
    type: 'ic_parazit',
    title: 'İç Parazit Mücadelesi (Kelebek ve Şerit)',
    medicineName: 'Albendazol Oral Süspansiyon (Vermitan)',
    dosage: '10 ml / Ağızdan',
    applicationDate: addDays(-40),
    nextScheduledDate: addDays(50),
    meatWithdrawalDays: 14,
    milkWithdrawalDays: 4,
    vetName: 'Vet. Hekim Kemal Dağdelen',
    cost: 1200,
    notes: 'Karaciğer kelebeğine karşı ilkbahar dozu.'
  },
  {
    id: 'hlth-04',
    targetType: 'suru',
    targetTags: ['Tüm Yetişkin Sürü'],
    type: 'dis_parazit',
    title: 'Dış Parazit (Kene / Uyuz) Banyosu',
    medicineName: 'Flumethrin Dökme Çözelti (Bayticol)',
    dosage: '10 ml sırt çizgisine dökme',
    applicationDate: addDays(-25),
    nextScheduledDate: addDays(35),
    meatWithdrawalDays: 7,
    milkWithdrawalDays: 0,
    vetName: 'İşletme Teknisyeni',
    cost: 950,
    notes: 'Kene mevsimi öncesi koruyucu dökme yapıldı.'
  },
  {
    id: 'hlth-05',
    targetType: 'bireysel',
    targetTags: ['TR 16 00204'],
    type: 'tedavi',
    title: 'Solunum Yolu Tedavisi & Antibiyotik',
    medicineName: 'Draxxin (Tulathromycin)',
    dosage: '2.5 ml boyun kas içi',
    applicationDate: addDays(-2),
    meatWithdrawalDays: 14,
    milkWithdrawalDays: 6,
    meatWithdrawalEndDate: addDays(12),
    milkWithdrawalEndDate: addDays(4),
    vetName: 'Vet. Hekim Kemal Dağdelen',
    cost: 450,
    notes: 'DİKKAT: 12 gün et, 4 gün süt arınma süresi var! Kesime sevk edilemez.'
  },
  {
    id: 'hlth-06',
    targetType: 'suru',
    targetTags: ['Tüm Koçlar ve Anaçlar'],
    type: 'tirnak',
    title: 'Genel Sürü Tırnak Kesimi ve Bakımı',
    medicineName: 'Çinko Sülfat %10 Ayak Banyosu',
    dosage: 'Tırnak makası + 5 dk banyo',
    applicationDate: addDays(-90),
    nextScheduledDate: addDays(2), // 2 GÜN KALDI!
    meatWithdrawalDays: 0,
    milkWithdrawalDays: 0,
    vetName: 'Çoban Ekibi',
    cost: 300,
    notes: 'Piyeten ve tırnak çürüğü önleme amaçlı periyodik bakım.'
  }
];

export const INITIAL_FEEDS: FeedItem[] = [
  {
    id: 'feed-01',
    name: 'Yonca Balyası (1. Kalite Çiçeklenme Başlangıcı)',
    type: 'kaba',
    stockKg: 4200,
    minThresholdKg: 1500,
    unitCost: 6.5, // 6.5 TL/kg
    dryMatterPct: 88,
    crudeProteinPct: 18.5,
    metabolicEnergy: 2.25,
    unit: 'kg',
    notes: 'Yeşil, yapraklı, küfsüz balya. Anaçlar ve emzirenler için temel yem.'
  },
  {
    id: 'feed-02',
    name: 'Buğday Samanı (Kıyılmış)',
    type: 'kaba',
    stockKg: 650, // KRİTİK SEVİYE (< 1000 kg)
    minThresholdKg: 1000,
    unitCost: 2.8,
    dryMatterPct: 90,
    crudeProteinPct: 3.5,
    metabolicEnergy: 1.45,
    unit: 'kg',
    notes: 'Rumen dolgunluğu ve lif kaynağı. Stok kritik seviyede!'
  },
  {
    id: 'feed-03',
    name: 'Mısır Silajı (İyi Fermente)',
    type: 'kaba',
    stockKg: 8500,
    minThresholdKg: 2000,
    unitCost: 2.2,
    dryMatterPct: 32,
    crudeProteinPct: 8.2,
    metabolicEnergy: 2.45,
    unit: 'kg',
    notes: 'Yüksek enerji ve lezzetli sulu kaba yem.'
  },
  {
    id: 'feed-04',
    name: 'Arpa Ezmesi (Tavlanmış / Flake)',
    type: 'konsantre',
    stockKg: 3100,
    minThresholdKg: 1200,
    unitCost: 8.2,
    dryMatterPct: 89,
    crudeProteinPct: 11.5,
    metabolicEnergy: 2.95,
    unit: 'kg',
    notes: 'Nişasta ve metabolik enerji kaynağı.'
  },
  {
    id: 'feed-05',
    name: 'Kuzu Büyütme Pelet Yemi (%18 HP)',
    type: 'konsantre',
    stockKg: 1800,
    minThresholdKg: 800,
    unitCost: 11.5,
    dryMatterPct: 89,
    crudeProteinPct: 18.0,
    metabolicEnergy: 2.75,
    unit: 'kg',
    notes: 'Kuzuların sütten kesim ve büyüme dönemi için özel vitamin-mineral katkılı pelet.'
  },
  {
    id: 'feed-06',
    name: 'Koyun Süt Yemi (%19 HP - 2600 ME)',
    type: 'konsantre',
    stockKg: 450, // KRİTİK SEVİYE (< 600 kg)
    minThresholdKg: 600,
    unitCost: 10.8,
    dryMatterPct: 88,
    crudeProteinPct: 19.0,
    metabolicEnergy: 2.65,
    unit: 'kg',
    notes: 'Emziren ve yüksek süt veren koyunların dengeli rasyonu için.'
  },
  {
    id: 'feed-07',
    name: 'Mineral & Vitamin Yalama Taşı',
    type: 'mineral',
    stockKg: 120,
    minThresholdKg: 40,
    unitCost: 28.0,
    dryMatterPct: 98,
    crudeProteinPct: 0,
    metabolicEnergy: 0,
    unit: 'kg',
    notes: 'Padoklarda serbest erişim tuz ve iz element bloğu.'
  }
];

export const INITIAL_RATIONS: RationPlan[] = [
  {
    id: 'ration-01',
    name: 'Laktasyon (İkizli Emziren Anaç Koyun)',
    targetGroup: 'laktasyon_ikiz',
    targetGroupLabel: 'İkizli Emziren Koyunlar (Pik Dönem)',
    animalCount: 12,
    ingredients: [
      { feedId: 'feed-01', amountKgPerAnimal: 1.5 }, // 1.5 kg Yonca
      { feedId: 'feed-03', amountKgPerAnimal: 2.0 }, // 2.0 kg Silaj
      { feedId: 'feed-04', amountKgPerAnimal: 0.6 }, // 0.6 kg Arpa
      { feedId: 'feed-06', amountKgPerAnimal: 0.8 }  // 0.8 kg Süt Yemi
    ],
    notes: 'Yüksek süt üretimi ve kondisyon kaybını önleme amaçlı yoğun rasyon.'
  },
  {
    id: 'ration-02',
    name: 'Gebeliğin Son Ayı (Doğuma Hazırlık)',
    targetGroup: 'gebelik_son_ay',
    targetGroupLabel: 'Doğuma 30 Gün Kalan Gebe Koyunlar',
    animalCount: 15,
    ingredients: [
      { feedId: 'feed-01', amountKgPerAnimal: 1.2 },
      { feedId: 'feed-02', amountKgPerAnimal: 0.5 },
      { feedId: 'feed-04', amountKgPerAnimal: 0.5 },
      { feedId: 'feed-06', amountKgPerAnimal: 0.4 }
    ],
    notes: 'Gebelik toksemisini (ikiz hastalığı) önlemek için enerji yoğun rasyon.'
  },
  {
    id: 'ration-03',
    name: 'Kuzu Besi Rasyonu (Hızlı Canlı Ağırlık Artışı)',
    targetGroup: 'besi_kuzusu',
    targetGroupLabel: 'Sütten Kesilmiş Besi Kuzuları (20-45 kg)',
    animalCount: 20,
    ingredients: [
      { feedId: 'feed-01', amountKgPerAnimal: 0.4 }, // Lif
      { feedId: 'feed-05', amountKgPerAnimal: 1.1 }, // Kuzu Büyütme
      { feedId: 'feed-04', amountKgPerAnimal: 0.3 }  // Arpa
    ],
    notes: 'Hedeflenen GCAA: 320-350 gram/gün.'
  }
];

export const INITIAL_FINANCES: FinanceRecord[] = [
  // GELİRLER
  {
    id: 'fin-01',
    type: 'gelir',
    category: 'kuzu_satisi',
    categoryLabel: 'Kuzu Satışı (Kasaplık / Besi)',
    amount: 52000, // 8 adet kuzu x 6500 TL
    date: addDays(-12),
    description: '8 Adet sütten kesilmiş toklu/besi kuzusu satışı (Kombina teslimi)',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-02',
    type: 'gelir',
    category: 'damizlik_satisi',
    categoryLabel: 'Damızlık Satışı',
    amount: 25000,
    date: addDays(-20),
    description: '2 Adet Merinos damızlık anaç koyun satışı (TR 16 00208 vd.)',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-03',
    type: 'gelir',
    category: 'sut_satisi',
    categoryLabel: 'Koyun Sütü Satışı',
    amount: 14800,
    date: addDays(-7),
    description: 'Haftalık toptan koyun sütü teslimi (Mandıra - 370 Litre x 40 TL)',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-04',
    type: 'gelir',
    category: 'yapagi_yun',
    categoryLabel: 'Yapağı / Yün Geliri',
    amount: 6400,
    date: addDays(-50),
    description: 'Kırkım dönemi ince Merinos yapağısı satışı (320 kg)',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-05',
    type: 'gelir',
    category: 'destekleme_tesvik',
    categoryLabel: 'Tarım Bakanlığı Anaç Koyun Desteği',
    amount: 18500,
    date: addDays(-30),
    description: 'T.C. Tarım ve Orman Bakanlığı küçükbaş hayvancılık anaç desteği',
    paymentStatus: 'odendi'
  },

  // GİDERLER
  {
    id: 'fin-06',
    type: 'gider',
    category: 'yem',
    categoryLabel: 'Yem Alımı (Yonca ve Pelet Yem)',
    amount: 32000,
    date: addDays(-25),
    description: '300 Balya 1. Sınıf Yonca + 20 Çuval Kuzu Büyütme Peleti',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-07',
    type: 'gider',
    category: 'yem',
    categoryLabel: 'Arpa Ezmesi Alımı',
    amount: 12500,
    date: addDays(-15),
    description: '1.5 Ton TMO tavlanmış arpa ezmesi',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-08',
    type: 'gider',
    category: 'veteriner_ilac',
    categoryLabel: 'Veteriner & Aşı Masrafları',
    amount: 5350,
    date: addDays(-22),
    description: 'Sürü karma aşıları, ultrason çekimi ve acil müdahale ilaçları',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-09',
    type: 'gider',
    category: 'iscilik',
    categoryLabel: 'Çoban ve Personel Ücreti',
    amount: 28000,
    date: addDays(-10),
    description: 'Aylık sürü yönetim ve çoban maaşı + SGK',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-10',
    type: 'gider',
    category: 'enerji_yakit',
    categoryLabel: 'Elektrik, Su ve Traktör Mazotu',
    amount: 6800,
    date: addDays(-8),
    description: 'Ağıl aydınlatma, derin kuyu pompası ve yem karma traktör yakıtı',
    paymentStatus: 'odendi'
  },
  {
    id: 'fin-11',
    type: 'gider',
    category: 'bakim_onarim',
    categoryLabel: 'Ağıl ve Ekipman Bakım-Onarımı',
    amount: 3400,
    date: addDays(-18),
    description: 'Otomatik suluk şamandıraları değişimi ve kuzu padok teli tamiratı',
    paymentStatus: 'odendi'
  }
];

export const PADOKS_LIST = [
  'Padok A-1 (Doğumhane)',
  'Padok A-2 (Doğumhane)',
  'Padok B-1 (Gebe Sürü)',
  'Padok B-2 (Gebe Sürü)',
  'Padok K-1 (Damızlık Koçlar)',
  'Padok K-2 (Sütçü Koçlar)',
  'Padok T-1 (Dişi Toklular)',
  'Padok T-2 (Aday Koçlar)',
  'Padok KZ-1 (Kuzu Bölmesi)',
  'Padok KZ-2 (Emzirenler)',
  'Padok S-1 (Süt Sağılanlar)',
  'Padok C (Mera Grubu)'
];

// Örnek Ortaklar (Mustafa Serçe %60, İkinci Ortak %40)
export const INITIAL_PARTNERS: FarmPartner[] = [
  {
    id: 'partner-1',
    name: 'Mustafa Serçe',
    phone: '0532 555 16 01',
    sharePercent: 60,
    investmentAmount: 600000,
    joinDate: '2024-01-01',
    notes: 'Kurucu Ortak & Çiftlik Yöneticisi'
  },
  {
    id: 'partner-2',
    name: 'Halil İbrahim Yılmaz',
    phone: '0544 444 16 16',
    sharePercent: 40,
    investmentAmount: 400000,
    joinDate: '2024-01-01',
    notes: 'Sermaye Ortağı / Tarımsal Destek'
  }
];

// Örnek Zayi / Fire Yem Kayıtları
export const INITIAL_FEED_WASTES: FeedWasteRecord[] = [
  {
    id: 'waste-1',
    feedId: 'feed-01',
    feedName: 'Yonca Kuru Otu (2. Biçim Balya)',
    amountKg: 150,
    reason: 'nem_rutubet',
    reasonLabel: 'Çatı akması kaynaklı nem ve küflenme',
    costTL: 1275, // 150 * 8.5
    date: addDays(-7),
    notes: 'Depo kuzey köşesindeki balyalarda fire ayrıldı.'
  },
  {
    id: 'waste-2',
    feedId: 'feed-03',
    feedName: 'Koyun Süt Yemi (%18 HP)',
    amountKg: 40,
    reason: 'kemirgen_hasari',
    reasonLabel: 'Çuval patlaması / kemirgen hasarı',
    costTL: 480, // 40 * 12.0
    date: addDays(-14),
    notes: 'Yem ambarı kapanları yenilendi.'
  }
];

// Örnek Demirbaş ve Depo Ekipmanları
export const INITIAL_EQUIPMENTS: FarmEquipment[] = [
  {
    id: 'eq-1',
    name: 'Yem Karma ve Dağıtma Römorku (4 m³)',
    category: 'makine_ekipman',
    categoryLabel: 'Makine & Ekipman',
    quantity: 1,
    purchaseDate: '2023-05-10',
    estimatedValueTL: 185000,
    condition: 'iyi',
    conditionLabel: 'İyi Durumda',
    serialOrTagNo: 'YK-2023-441',
    notes: 'Yıllık bıçak bakımı 2 ay önce yapıldı.'
  },
  {
    id: 'eq-2',
    name: 'Otomatik Kuzu Emzirme Makinesi (4 Emzikli)',
    category: 'makine_ekipman',
    categoryLabel: 'Makine & Ekipman',
    quantity: 2,
    purchaseDate: '2024-01-15',
    estimatedValueTL: 48000,
    condition: 'yeni',
    conditionLabel: 'Yeni / Sıfır Ayarında',
    serialOrTagNo: 'EMZ-889',
    notes: 'Doğumhane kuzu bölmesinde aktif devrede.'
  },
  {
    id: 'eq-3',
    name: 'Mobil Koyun Sağım Sistemi (4 Başlıklı Vakumlu)',
    category: 'sagim_sut',
    categoryLabel: 'Sağım & Süt Ekipmanı',
    quantity: 1,
    purchaseDate: '2023-08-20',
    estimatedValueTL: 38000,
    condition: 'iyi',
    conditionLabel: 'İyi Durumda',
    serialOrTagNo: 'SGM-04',
    notes: 'Sağım güğümleri paslanmaz çelik 40 lt.'
  },
  {
    id: 'eq-4',
    name: 'Galvaniz Portatif Padok Çit Panelleri (2.5m x 1.2m)',
    category: 'barinak_cit',
    categoryLabel: 'Barınak & Çit Sistemleri',
    quantity: 40,
    purchaseDate: '2023-03-01',
    estimatedValueTL: 64000,
    condition: 'iyi',
    conditionLabel: 'İyi Durumda',
    notes: 'Doğum bölmeleri ve koç katımı ayrımında kullanılıyor.'
  },
  {
    id: 'eq-5',
    name: 'Şamandıralı Donmaz Otomatik Suluklar (Emaye/Döküm)',
    category: 'suluk_yemlik',
    categoryLabel: 'Suluk & Yemlik',
    quantity: 12,
    purchaseDate: '2023-04-12',
    estimatedValueTL: 21600,
    condition: 'iyi',
    conditionLabel: 'İyi Durumda',
    notes: 'Tüm padoklarda sabit tesisat bağlı.'
  },
  {
    id: 'eq-6',
    name: 'Dijital Canlı Hayvan Baskülü (500 kg - RFID Destekli)',
    category: 'makine_ekipman',
    categoryLabel: 'Makine & Ekipman',
    quantity: 1,
    purchaseDate: '2024-02-05',
    estimatedValueTL: 29500,
    condition: 'yeni',
    conditionLabel: 'Yeni / Sıfır Ayarında',
    serialOrTagNo: 'BSK-500R',
    notes: 'Tartım yolu ve kantar kafesi entegre.'
  }
];

