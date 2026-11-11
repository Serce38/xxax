import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Dna, 
  Flame, 
  Heart, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Animal, BirthDifficulty, BirthRecord, MatingGroup, NewbornLambItem, PregnancyRecord } from '../types/farm';
import { PADOKS_LIST } from '../data/mockData';
import { calculateAge, calculateDueDate, getPregnancyProgress } from '../utils/calculations';

interface ReproductionModuleProps {
  animals: Animal[];
  matingGroups: MatingGroup[];
  pregnancies: PregnancyRecord[];
  births: BirthRecord[];
  onAddMatingGroup: (group: MatingGroup) => void;
  onAddPregnancy: (preg: PregnancyRecord) => void;
  onUpdatePregnancy: (preg: PregnancyRecord) => void;
  onAddBirth: (birth: BirthRecord, newLambAnimals: Animal[]) => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const ReproductionModule: React.FC<ReproductionModuleProps> = ({
  animals,
  matingGroups,
  pregnancies,
  births,
  onAddMatingGroup,
  onAddPregnancy,
  onUpdatePregnancy,
  onAddBirth,
  onSelectAnimal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'gebelik' | 'dogumlar' | 'koc_katimi' | 'weaning'>('gebelik');

  // Modal Durumları
  const [isBirthModalOpen, setIsBirthModalOpen] = useState(false);
  const [isPregModalOpen, setIsPregModalOpen] = useState(false);
  const [isMatingModalOpen, setIsMatingModalOpen] = useState(false);

  // Doğum Formu
  const [birthEweTag, setBirthEweTag] = useState('');
  const [birthRamTag, setBirthRamTag] = useState('');
  const [birthDate, setBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [birthDifficulty, setBirthDifficulty] = useState<BirthDifficulty>('kolay');
  const [birthPadok, setBirthPadok] = useState('Padok A-1 (Doğumhane)');
  const [lambCount, setLambCount] = useState(1);
  const [birthNotes, setBirthNotes] = useState('');
  const [lambItems, setLambItems] = useState<Array<{
    earTag: string;
    gender: 'disi' | 'erkek';
    birthWeight: number;
    status: 'canli' | 'olu';
  }>>([
    { earTag: '', gender: 'disi', birthWeight: 4.2, status: 'canli' }
  ]);

  // Yeni Gebelik Formu
  const [pregEweTag, setPregEweTag] = useState('');
  const [pregRamTag, setPregRamTag] = useState('');
  const [pregMatingDate, setPregMatingDate] = useState(new Date().toISOString().split('T')[0]);
  const [pregUltrasound, setPregUltrasound] = useState<'pozitif' | 'negatif' | 'supheli'>('pozitif');
  const [pregExpectedCount, setPregExpectedCount] = useState(2);
  const [pregNotes, setPregNotes] = useState('');

  // Yeni Koç Katımı Grubu Formu
  const [matingGroupName, setMatingGroupName] = useState('');
  const [matingRamTag, setMatingRamTag] = useState('');
  const [matingStartDate, setMatingStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [matingPadok, setMatingPadok] = useState(PADOKS_LIST[2]);
  const [selectedEwes, setSelectedEwes] = useState<string[]>([]);
  const [matingNotes, setMatingNotes] = useState('');

  // Yardımcı filtreler
  const rams = animals.filter(a => a.category === 'koc' && a.status === 'aktif');
  const ewes = animals.filter(a => a.category === 'anac_koyun' && a.status === 'aktif');
  const activePregnancies = pregnancies.filter(p => p.status === 'beklemede');

  // Kuzu Sayısı Değişince LambItems dizisini güncelle
  const handleLambCountChange = (count: number) => {
    setLambCount(count);
    const newItems = [...lambItems];
    while (newItems.length < count) {
      newItems.push({
        earTag: '',
        gender: newItems.length % 2 === 0 ? 'disi' : 'erkek',
        birthWeight: 4.0,
        status: 'canli'
      });
    }
    setLambItems(newItems.slice(0, count));
  };

  // Doğum Kaydetme
  const handleSaveBirth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthEweTag.trim()) {
      alert('Lütfen anac koyun küpe numarasını seçiniz.');
      return;
    }

    const aliveCount = lambItems.filter(l => l.status === 'canli').length;
    const stillbornCount = lambItems.filter(l => l.status === 'olu').length;

    // Otomatik kuzu hayvan kayıtları oluştur
    const newLambAnimals: Animal[] = [];
    const finalLambRecords: NewbornLambItem[] = [];

    const mother = animals.find(a => a.earTag === birthEweTag);
    const breed = mother?.breed || 'Merinos';

    lambItems.forEach((l, idx) => {
      const tag = l.earTag.trim() || `KUZU-${Date.now().toString().slice(-4)}-${idx + 1}`;
      finalLambRecords.push({
        id: `nl-${Date.now()}-${idx}`,
        earTag: tag,
        gender: l.gender,
        birthWeight: l.birthWeight,
        status: l.status,
        isWeaned: false
      });

      if (l.status === 'canli') {
        newLambAnimals.push({
          id: `animal-${Date.now()}-${idx}`,
          earTag: tag,
          category: 'kuzu',
          gender: l.gender,
          breed,
          birthDate,
          status: 'aktif',
          origin: 'dogum',
          motherTag: birthEweTag,
          fatherTag: birthRamTag.trim() || undefined,
          padok: birthPadok,
          currentWeight: l.birthWeight,
          weightHistory: [
            { date: birthDate, weight: l.birthWeight, note: `Doğum ağırlığı (${birthDifficulty} doğum)` }
          ],
          notes: `Annesi: ${birthEweTag}, Babası: ${birthRamTag || 'Bilinmiyor'}`,
          createdAt: new Date().toISOString()
        });
      }
    });

    const birthRecord: BirthRecord = {
      id: `birth-${Date.now()}`,
      eweTag: birthEweTag,
      ramTag: birthRamTag || undefined,
      birthDate,
      difficulty: birthDifficulty,
      totalLambs: lambItems.length,
      aliveLambs: aliveCount,
      stillbornLambs: stillbornCount,
      lambs: finalLambRecords,
      padok: birthPadok,
      notes: birthNotes.trim() || undefined
    };

    onAddBirth(birthRecord, newLambAnimals);

    // Varsa ilgili gebelik kaydını tamamlandı yap
    const existingPreg = pregnancies.find(p => p.eweTag === birthEweTag && p.status === 'beklemede');
    if (existingPreg) {
      onUpdatePregnancy({
        ...existingPreg,
        status: 'dogurdu',
        actualBirthDate: birthDate
      });
    }

    // Kutlama konfeti patlat
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsBirthModalOpen(false);
    // Sıfırla
    setBirthEweTag('');
    setBirthRamTag('');
    setBirthNotes('');
  };

  // Yeni Gebelik Kaydı
  const handleSavePregnancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregEweTag.trim()) return;

    const dueDate = calculateDueDate(pregMatingDate);

    const newPreg: PregnancyRecord = {
      id: `preg-${Date.now()}`,
      eweTag: pregEweTag,
      ramTag: pregRamTag || undefined,
      matingDate: pregMatingDate,
      ultrasoundResult: pregUltrasound,
      ultrasoundDate: new Date().toISOString().split('T')[0],
      expectedDueDate: dueDate,
      expectedLambCount: pregExpectedCount,
      status: 'beklemede',
      notes: pregNotes.trim() || undefined
    };

    onAddPregnancy(newPreg);
    setIsPregModalOpen(false);
  };

  // Yeni Koç Katımı Grubu Kaydı
  const handleSaveMatingGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matingGroupName || !matingRamTag) return;

    const ram = rams.find(r => r.earTag === matingRamTag);
    const newGroup: MatingGroup = {
      id: `mating-${Date.now()}`,
      groupName: matingGroupName,
      ramTag: matingRamTag,
      ramBreed: ram?.breed,
      startDate: matingStartDate,
      padok: matingPadok,
      assignedEweTags: selectedEwes,
      status: 'aktif',
      notes: matingNotes.trim() || undefined
    };

    onAddMatingGroup(newGroup);
    setIsMatingModalOpen(false);
  };

  // Sütten kesim adayı kuzular (50+ günlük)
  const weaningCandidates = animals.filter(a => {
    if (a.category !== 'kuzu' || a.status !== 'aktif') return false;
    const diffDays = Math.floor((new Date().getTime() - new Date(a.birthDate).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 50;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-current" />
              <span>Üreme, Aşım & 150 Günlük Gebelik Modülü</span>
            </h1>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Koç katımı grupları, ultrason ve otomatik 150 günlük doğum geri sayımı, doğumhane kayıtları
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPregModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>+ Gebe Ekle</span>
          </button>
          <button
            onClick={() => setIsBirthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Doğum Kaydet</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-1">
        <button
          onClick={() => setActiveSubTab('gebelik')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'gebelik'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Aktif Gebelikler ({activePregnancies.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dogumlar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'dogumlar'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Doğum Kayıtları ({births.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('koc_katimi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'koc_katimi'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Koç Katımı Grupları ({matingGroups.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('weaning')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'weaning'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sütten Kesim & Büyüme ({weaningCandidates.length})</span>
        </button>
      </div>

      {/* SUB TAB 1: 150 GÜNLÜK GEBELİK VE RADAR */}
      {activeSubTab === 'gebelik' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong>150 Günlük Standart Gebelik Takvimi: </strong>
                Koyunlarda gebelik ortalama 148-152 gün sürer. Aşım tarihinden itibaren sistem otomatik 150. güne göre doğum uyarısı üretir.
              </div>
            </div>
            <button
              onClick={() => setIsPregModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shrink-0 ml-3"
            >
              + Gebe Koyun Ekle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePregnancies.map(preg => {
              const { dayOfPregnancy, daysRemaining, progressPercent, isOverdue } = getPregnancyProgress(
                preg.matingDate, 
                preg.expectedDueDate
              );
              const ewe = animals.find(a => a.earTag === preg.eweTag);
              const ram = preg.ramTag ? animals.find(a => a.earTag === preg.ramTag) : null;

              return (
                <div
                  key={preg.id}
                  className={`bg-stone-900 border rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden transition-all ${
                    isOverdue 
                      ? 'border-rose-700 ring-1 ring-rose-600' 
                      : daysRemaining <= 3 
                      ? 'border-amber-500' 
                      : 'border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg text-white">{preg.eweTag}</span>
                        {ewe?.name && <span className="text-xs text-stone-400">({ewe.name})</span>}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {ewe?.breed || 'Merinos'} • {ewe?.padok || 'Padok A-1'}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                      isOverdue 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : daysRemaining <= 3 
                        ? 'bg-amber-500 text-stone-950 font-bold' 
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {daysRemaining === 0 ? 'Bugün Doğum!' : isOverdue ? `${Math.abs(daysRemaining)} Gün Gecikti` : `${daysRemaining} Gün Kaldı`}
                    </span>
                  </div>

                  {/* Progress Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-stone-300 font-medium">
                      <span>{dayOfPregnancy}. Gebelik Günü</span>
                      <span>%{progressPercent} Tamamlandı</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPercent >= 98 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Detay Bilgileri */}
                  <div className="text-xs text-stone-400 space-y-1 pt-2 border-t border-stone-800">
                    <div className="flex items-center justify-between">
                      <span>Aşım / Koç Tarihi:</span>
                      <span className="text-white font-medium">{preg.matingDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tahmini Doğum (150. Gün):</span>
                      <span className="text-amber-400 font-bold">{preg.expectedDueDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Baba Koç:</span>
                      <span className="text-white font-medium">{preg.ramTag || 'Grup Koçu'}</span>
                    </div>
                    {preg.expectedLambCount && (
                      <div className="flex items-center justify-between">
                        <span>Ultrason Teşhisi:</span>
                        <span className="text-emerald-400 font-medium">
                          {preg.expectedLambCount === 1 ? 'Tekiz' : preg.expectedLambCount === 2 ? 'İkiz' : 'Üçüz'} Bekleniyor
                        </span>
                      </div>
                    )}
                  </div>

                  {preg.notes && (
                    <div className="text-[11px] text-stone-400 italic bg-stone-800/50 p-2 rounded-lg">
                      "{preg.notes}"
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => ewe && onSelectAnimal(ewe)}
                      className="text-xs text-stone-400 hover:text-white"
                    >
                      Koyun Kartı
                    </button>
                    <button
                      onClick={() => {
                        setBirthEweTag(preg.eweTag);
                        setBirthRamTag(preg.ramTag || '');
                        setIsBirthModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Doğumu Başlat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 2: DOĞUM KAYITLARI & İSTATİSTİKLERİ */}
      {activeSubTab === 'dogumlar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Toplam Doğum</span>
              <div className="text-2xl font-black text-white mt-1">{births.length} Doğum</div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Doğan Canlı Kuzu</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {births.reduce((acc, b) => acc + b.aliveLambs, 0)} Kuzu
              </div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">İkizlik Oranı</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {births.length ? `${Math.round((births.filter(b => b.totalLambs >= 2).length / births.length) * 100)}%` : '0%'}
              </div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Ortalama Canlı Doğum Ağırlığı</span>
              <div className="text-2xl font-black text-sky-400 mt-1">4.1 kg</div>
            </div>
          </div>

          {/* Doğumlar Listesi */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Gerçekleşen Doğum Kütüğü</h3>
              <button
                onClick={() => setIsBirthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                + Yeni Doğum Girişi
              </button>
            </div>

            <div className="divide-y divide-stone-800 text-xs">
              {births.map(birth => (
                <div key={birth.id} className="p-4 hover:bg-stone-800/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                        🐑
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">{birth.eweTag}</span>
                          <span className="text-stone-400">×</span>
                          <span className="font-semibold text-stone-300">
                            {birth.ramTag || 'Damızlık Koç'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[10px]">
                            {birth.difficulty === 'kolay' ? 'Kolay Doğum' : birth.difficulty === 'yardimli' ? 'Yardımlı' : 'Sezaryen'}
                          </span>
                        </div>
                        <div className="text-stone-400 mt-0.5">
                          Tarih: {birth.birthDate} • Doğumhane: {birth.padok}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        {birth.aliveLambs} Canlı Kuzu ({birth.totalLambs >= 2 ? 'İkiz' : 'Tekiz'})
                      </span>
                    </div>
                  </div>

                  {/* Doğan Kuzuların Detayları */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pl-12">
                    {birth.lambs.map(lamb => (
                      <div
                        key={lamb.id}
                        className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span>{lamb.earTag}</span>
                            <span className="text-[10px] text-stone-400">
                              ({lamb.gender === 'disi' ? 'Dişi' : 'Erkek'})
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                            Doğum: {lamb.birthWeight} kg
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lamb.status === 'canli' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}>
                          {lamb.status === 'canli' ? 'Canlı' : 'Ölü Doğum'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {birth.notes && (
                    <div className="mt-2 text-stone-400 text-xs pl-12">
                      Not: {birth.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: KOÇ KATIMI GRUPLARI */}
      {activeSubTab === 'koc_katimi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">
              Aşım planlaması, damızlık koçların anaç sürülerle padok bazlı eşleştirilmesi
            </p>
            <button
              onClick={() => setIsMatingModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Aşım Grubu Planla</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matingGroups.map(group => {
              const ram = animals.find(a => a.earTag === group.ramTag);

              return (
                <div key={group.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-white text-base">{group.groupName}</h3>
                      <div className="text-xs text-stone-400 mt-0.5">
                        Başlangıç: {group.startDate} • {group.padok}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                      {group.status === 'aktif' ? 'Aşım Devam Ediyor' : 'Tamamlandı'}
                    </span>
                  </div>

                  {/* Koç Kartı */}
                  <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Damızlık Koç</span>
                      <span className="font-black text-white text-sm">{group.ramTag}</span>
                      {ram?.name && <span className="text-stone-300 ml-1">({ram.name})</span>}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-stone-700 text-stone-200 font-medium">
                      {group.ramBreed || 'Safkan'}
                    </span>
                  </div>

                  {/* Eşleşen Koyun Küpeleri */}
                  <div>
                    <span className="text-xs font-bold text-stone-400 block mb-1.5">
                      Gruptaki Anaç Koyunlar ({group.assignedEweTags.length} Baş)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.assignedEweTags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-xs font-mono border border-stone-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {group.notes && (
                    <div className="text-xs text-stone-400 italic pt-2 border-t border-stone-800">
                      "{group.notes}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 4: SÜTTEN KESİM & BÜYÜME (WEANING) */}
      {activeSubTab === 'weaning' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-800/40 text-sky-200 text-xs">
            <strong>Sütten Kesim (Weaning) Standartları: </strong>
            Kuzular genellikle 60-75. günlerde sütten kesilir. Bu dönemde kuzu başlangıç/büyütme rasyonuna tam geçiş yapılır, bireysel tartım kaydedilir ve GCAA (günlük canlı ağırlık artışı) analiz edilir.
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-bold uppercase">
                <tr>
                  <th className="p-3">Kuzu Küpe No</th>
                  <th className="p-3">Yaş</th>
                  <th className="p-3">Mevcut Ağırlık</th>
                  <th className="p-3">Anne / Padok</th>
                  <th className="p-3">Öneri & Aksiyon</th>
                  <th className="p-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {weaningCandidates.map(lamb => (
                  <tr key={lamb.id} className="hover:bg-stone-800/40">
                    <td className="p-3 font-extrabold text-white text-sm">
                      {lamb.earTag}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {calculateAge(lamb.birthDate)}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {lamb.currentWeight} kg
                    </td>
                    <td className="p-3 text-stone-400">
                      Anne: {lamb.motherTag || '-'} • {lamb.padok}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium">
                        Sütten Kesim & Büyütme Yemi Vakti
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectAnimal(lamb)}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold"
                      >
                        Tartım Gir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* YENİ DOĞUM KAYDI MODALI */}
      {isBirthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-6 bg-emerald-950/40 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  ✨
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Yeni Doğum Kaydı & Kuzu Küpeleme</h3>
                  <p className="text-xs text-stone-400">Doğan kuzular otomatik olarak sürü veritabanına eklenir</p>
                </div>
              </div>
              <button
                onClick={() => setIsBirthModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBirth} className="p-6 overflow-y-auto space-y-4 text-xs text-stone-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Anne Koyun */}
                <div>
                  <label className="font-semibold text-white block mb-1">Doğuran Anaç Koyun*</label>
                  <select
                    required
                    value={birthEweTag}
                    onChange={e => setBirthEweTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Koyun Küpesi Seçin...</option>
                    {ewes.map(e => (
                      <option key={e.id} value={e.earTag}>
                        {e.earTag} ({e.breed} - {e.name || 'İsimsiz'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Baba Koç */}
                <div>
                  <label className="font-semibold text-white block mb-1">Baba Damızlık Koç</label>
                  <select
                    value={birthRamTag}
                    onChange={e => setBirthRamTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Koç Seçin (Opsiyonel)...</option>
                    {rams.map(r => (
                      <option key={r.id} value={r.earTag}>
                        {r.earTag} ({r.name || r.breed})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doğum Tarihi */}
                <div>
                  <label className="font-semibold text-white block mb-1">Doğum Tarihi*</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Doğum Güçlüğü Derecesi */}
                <div>
                  <label className="font-semibold text-white block mb-1">Doğum Güçlüğü Derecesi*</label>
                  <select
                    value={birthDifficulty}
                    onChange={e => setBirthDifficulty(e.target.value as BirthDifficulty)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="kolay">Kolay (Müdahalesiz Doğal Doğum)</option>
                    <option value="yardimli">Yardımlı (Hafif Pozisyon Düzeltme)</option>
                    <option value="guc">Güç Doğum (Yoğun Müdahale)</option>
                    <option value="sezaryen">Sezaryen (Veteriner Operasyonu)</option>
                  </select>
                </div>

                {/* Doğumhane / Padok */}
                <div>
                  <label className="font-semibold text-white block mb-1">Doğumhane Padok*</label>
                  <select
                    value={birthPadok}
                    onChange={e => setBirthPadok(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {PADOKS_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Yavru Sayısı Seçimi */}
                <div>
                  <label className="font-semibold text-white block mb-1">Doğan Kuzu Sayısı*</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleLambCountChange(num)}
                        className={`flex-1 py-2 rounded-xl font-bold border transition-all ${
                          lambCount === num
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-stone-800 text-stone-300 border-stone-700'
                        }`}
                      >
                        {num === 1 ? '1 (Tekiz)' : num === 2 ? '2 (İkiz)' : num === 3 ? '3 (Üçüz)' : '4+'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Doğan Kuzuların Bireysel Girişleri */}
              <div className="pt-3 border-t border-stone-800 space-y-3">
                <h4 className="font-bold text-white flex items-center justify-between">
                  <span>Doğan Kuzu Bilgileri</span>
                  <span className="text-[11px] text-stone-400">Canlı doğanlar otomatik sürüye kaydedilir</span>
                </h4>

                {lambItems.map((lamb, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">{idx + 1}. Kuzu Küpe No</label>
                      <input
                        type="text"
                        placeholder={`TR 16 00...`}
                        value={lamb.earTag}
                        onChange={e => {
                          const updated = [...lambItems];
                          updated[idx].earTag = e.target.value;
                          setLambItems(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Cinsiyet</label>
                      <select
                        value={lamb.gender}
                        onChange={e => {
                          const updated = [...lambItems];
                          updated[idx].gender = e.target.value as any;
                          setLambItems(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-white text-xs"
                      >
                        <option value="disi">Dişi (Koyun Adayı)</option>
                        <option value="erkek">Erkek (Koç Adayı / Besi)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Canlı Doğum Ağırlığı (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={lamb.birthWeight}
                        onChange={e => {
                          const updated = [...lambItems];
                          updated[idx].birthWeight = parseFloat(e.target.value) || 4.0;
                          setLambItems(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Sağlık / Yaşama</label>
                      <select
                        value={lamb.status}
                        onChange={e => {
                          const updated = [...lambItems];
                          updated[idx].status = e.target.value as any;
                          setLambItems(updated);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                          lamb.status === 'canli' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        <option value="canli">Canlı & Sağlıklı</option>
                        <option value="olu">Ölü Doğum / Telef</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Doğum Notları & Gözlemler</label>
                <textarea
                  rows={2}
                  placeholder="Ağız sütü emzirildi, göbek kordonu bağlandı ve dezenfekte edildi..."
                  value={birthNotes}
                  onChange={e => setBirthNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBirthModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Doğumu ve Kuzuları Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ GEBELİK KAYDI MODALI */}
      {isPregModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-amber-400" />
              <span>Yeni Gebe Koyun Tanımla</span>
            </h3>

            <form onSubmit={handleSavePregnancy} className="space-y-4 text-xs text-stone-300">
              <div>
                <label className="font-semibold text-white block mb-1">Gebe Koyun Küpe No*</label>
                <select
                  required
                  value={pregEweTag}
                  onChange={e => setPregEweTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
                >
                  <option value="">Koyun Seçin...</option>
                  {ewes.map(e => (
                    <option key={e.id} value={e.earTag}>{e.earTag} ({e.name || e.breed})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Aşım Yapan Damızlık Koç</label>
                <select
                  value={pregRamTag}
                  onChange={e => setPregRamTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
                >
                  <option value="">Bilinmiyor / Serbest Aşım</option>
                  {rams.map(r => (
                    <option key={r.id} value={r.earTag}>{r.earTag} ({r.name || r.breed})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Aşım Tarihi*</label>
                <input
                  type="date"
                  required
                  value={pregMatingDate}
                  onChange={e => setPregMatingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                />
                <span className="text-[11px] text-amber-400 block mt-1">
                  Otomatik 150 gün doğum hesabı: {calculateDueDate(pregMatingDate)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-white block mb-1">Ultrason Teşhisi</label>
                  <select
                    value={pregUltrasound}
                    onChange={e => setPregUltrasound(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  >
                    <option value="pozitif">Pozitif (Gebe)</option>
                    <option value="supheli">Şüpheli (Tekrar Bakılacak)</option>
                    <option value="negatif">Negatif (Boş)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-white block mb-1">Tahmini Kuzu</label>
                  <select
                    value={pregExpectedCount}
                    onChange={e => setPregExpectedCount(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  >
                    <option value="1">Tekiz Kuzu</option>
                    <option value="2">İkiz Kuzu</option>
                    <option value="3">Üçüz Kuzu</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPregModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Gebeliği Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
