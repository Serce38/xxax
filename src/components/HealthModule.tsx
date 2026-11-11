import React, { useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  HeartCrack, 
  Edit3,
  Lock, 
  Plus, 
  Scissors, 
  ShieldAlert, 
  Syringe, 
  TrendingDown, 
  UserCheck 
} from 'lucide-react';
import { Animal, HealthRecord, HealthRecordType } from '../types/farm';
import { checkWithdrawalActive, formatCurrency } from '../utils/calculations';
import { EditHealthModal } from './modals/EditHealthModal';

interface HealthModuleProps {
  healthRecords: HealthRecord[];
  animals: Animal[];
  canEdit?: boolean;
  onAddHealthRecord: (record: HealthRecord) => void;
  onUpdateHealthRecord?: (record: HealthRecord) => void;
  onUpdateAnimal: (animal: Animal) => void;
}

export const HealthModule: React.FC<HealthModuleProps> = ({
  healthRecords,
  animals,
  canEdit = true,
  onAddHealthRecord,
  onUpdateHealthRecord,
  onUpdateAnimal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'takvim' | 'karantina' | 'kayitlar' | 'olum_analizi'>('takvim');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  // Form State
  const [targetType, setTargetType] = useState<'suru' | 'bireysel'>('suru');
  const [selectedTag, setSelectedTag] = useState('');
  const [recordType, setRecordType] = useState<HealthRecordType>('asi');
  const [title, setTitle] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDate, setNextDate] = useState('');
  const [meatWithdrawalDays, setMeatWithdrawalDays] = useState('14');
  const [milkWithdrawalDays, setMilkWithdrawalDays] = useState('0');
  const [vetName, setVetName] = useState('Vet. Hekim Kemal Dağdelen');
  const [cost, setCost] = useState('1200');
  const [notes, setNotes] = useState('');

  // Aktif Karantina / Arınma Süresinde Olan Hayvanlar
  const quarantinedAnimals = animals.filter(a => {
    if (a.status !== 'aktif') return false;
    const meat = checkWithdrawalActive(a.quarantine?.meatUntil);
    const milk = checkWithdrawalActive(a.quarantine?.milkUntil);
    return meat.isActive || milk.isActive;
  });

  // Telef / Ölen Hayvanlar
  const deceasedAnimals = animals.filter(a => a.status === 'oldu');

  // Hızlı Hazır Aşı Şablonları
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'enterotoksemi':
        setTitle('Enterotoksemi (Çelerme) Karma Aşısı');
        setMedicineName('Clostrivax 8 / Enterotoksemi Karma');
        setDosage('2 ml / Hayvan başı cilt altı');
        setMeatWithdrawalDays('21');
        setMilkWithdrawalDays('0');
        setRecordType('asi');
        break;
      case 'cicek':
        setTitle('Koyun Keçi Çiçek Aşısı');
        setMedicineName('Poxvac Çiçek Aşısı');
        setDosage('0.5 ml kuyruk altı dikiş');
        setMeatWithdrawalDays('14');
        setMilkWithdrawalDays('0');
        setRecordType('asi');
        break;
      case 'parazit':
        setTitle('İç Parazit (Kelebek & Bağırsak Şeridi) Mücadelesi');
        setMedicineName('Albendazol Oral Süspansiyon');
        setDosage('10 ml / Ağızdan');
        setMeatWithdrawalDays('14');
        setMilkWithdrawalDays('4');
        setRecordType('ic_parazit');
        break;
      case 'tirnak':
        setTitle('Genel Sürü Tırnak Bakımı ve Ayak Banyosu');
        setMedicineName('Çinko Sülfat %10 Banyosu');
        setDosage('Mekanik kesim + 5 dk banyo');
        setMeatWithdrawalDays('0');
        setMilkWithdrawalDays('0');
        setRecordType('tirnak');
        break;
    }
  };

  const handleSaveHealth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !medicineName.trim()) return;

    const meatDays = parseInt(meatWithdrawalDays) || 0;
    const milkDays = parseInt(milkWithdrawalDays) || 0;

    const appTime = new Date(appDate).getTime();
    const meatEndDate = meatDays > 0 ? new Date(appTime + meatDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined;
    const milkEndDate = milkDays > 0 ? new Date(appTime + milkDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined;

    const newRecord: HealthRecord = {
      id: `hlth-${Date.now()}`,
      targetType,
      targetTags: targetType === 'bireysel' && selectedTag ? [selectedTag] : ['Tüm Sürü'],
      type: recordType,
      title: title.trim(),
      medicineName: medicineName.trim(),
      dosage: dosage.trim() || 'Veteriner önerisi',
      applicationDate: appDate,
      nextScheduledDate: nextDate || undefined,
      meatWithdrawalDays: meatDays,
      milkWithdrawalDays: milkDays,
      meatWithdrawalEndDate: meatEndDate,
      milkWithdrawalEndDate: milkEndDate,
      vetName: vetName.trim() || undefined,
      cost: parseFloat(cost) || 0,
      notes: notes.trim() || undefined
    };

    onAddHealthRecord(newRecord);

    // Eğer bireysel hayvana ilaç verildiyse ve arınma süresi varsa hayvan kartına karantina kilidi koy
    if (targetType === 'bireysel' && selectedTag && (meatDays > 0 || milkDays > 0)) {
      const animal = animals.find(a => a.earTag === selectedTag);
      if (animal) {
        onUpdateAnimal({
          ...animal,
          quarantine: {
            active: true,
            meatUntil: meatEndDate,
            milkUntil: milkEndDate,
            medicineName: medicineName.trim()
          }
        });
      }
    }

    setIsAddModalOpen(false);
    // Temizle
    setTitle('');
    setMedicineName('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-500" />
            <span>Sağlık, Aşı, İlaçlama & Karantina Takibi</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Sürü karma aşıları, iç/dış parazit, et/süt arınma süreleri uyarısı ve ölüm vakası analizleri
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>+ Sağlık / Aşı Kaydı Gir</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-1">
        <button
          onClick={() => setActiveSubTab('takvim')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'takvim'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Aşı & Sağlık Takvimi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('karantina')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'karantina'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Et & Süt Arınma Karantinası ({quarantinedAnimals.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kayitlar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'kayitlar'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Syringe className="w-4 h-4" />
          <span>Tüm Uygulama Geçmişi ({healthRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('olum_analizi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'olum_analizi'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <HeartCrack className="w-4 h-4" />
          <span>Ölüm & Hastalık Analizi ({deceasedAnimals.length})</span>
        </button>
      </div>

      {/* SUB TAB 1: AŞI & SAĞLIK TAKVİMİ */}
      {activeSubTab === 'takvim' && (
        <div className="space-y-6">
          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-200 text-xs flex items-center justify-between">
            <div>
              <strong>Kritik Aşı Hatırlatması: </strong>
              Enterotoksemi (Çelerme) ve Çiçek aşıları 6 ayda bir; İç parazit yılda en az 2 kez bahar ve sonbaharda yenilenmelidir.
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 ml-3"
            >
              Uygulama Gir
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthRecords.map(hr => {
              const hasUpcoming = !!hr.nextScheduledDate;
              const nextTime = hr.nextScheduledDate ? new Date(hr.nextScheduledDate).getTime() : 0;
              const diffDays = hr.nextScheduledDate ? Math.ceil((nextTime - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <div key={hr.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                        {hr.type === 'asi' ? 'Aşı' : hr.type === 'ic_parazit' ? 'İç Parazit' : hr.type === 'dis_parazit' ? 'Dış Parazit' : hr.type === 'tirnak' ? 'Tırnak' : 'Tedavi'}
                      </span>
                      <h3 className="font-bold text-white text-base mt-1.5">{hr.title}</h3>
                    </div>

                    {hasUpcoming && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        diffDays <= 5 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {diffDays <= 0 ? 'Vadesi Geldi!' : `${diffDays} Gün Kaldı`}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-stone-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Kullanılan İlaç:</span>
                      <span className="font-semibold text-white">{hr.medicineName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Dozaj:</span>
                      <span>{hr.dosage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Son Uygulama:</span>
                      <span className="text-emerald-400 font-medium">{hr.applicationDate}</span>
                    </div>
                    {hr.nextScheduledDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Sonraki Planlanan:</span>
                        <span className="text-amber-400 font-bold">{hr.nextScheduledDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Arınma Bilgisi */}
                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Et Arınma: <strong className="text-stone-200">{hr.meatWithdrawalDays} Gün</strong></span>
                    <span>Süt Arınma: <strong className="text-stone-200">{hr.milkWithdrawalDays} Gün</strong></span>
                    <span>{formatCurrency(hr.cost)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 2: ARINMA (KARANTİNA) KİLİTLERİ */}
      {activeSubTab === 'karantina' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs">
            <div className="flex items-center gap-2 font-black text-sm text-rose-300 mb-1">
              <ShieldAlert className="w-5 h-5" />
              <span>GIDA GÜVENLİĞİ & ARINMA SÜRESİ KİLİDİ</span>
            </div>
            Veteriner ilaçları ve antibiyotik uygulamaları sonrasında hayvanların et ve sütlerinde kalıntı kalır. Bu listedeki hayvanlar yasal arınma süresi dolana kadar <strong>kesime sevk edilemez</strong> ve sütleri <strong>insan tüketimine sunulamaz</strong>.
          </div>

          {quarantinedAnimals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quarantinedAnimals.map(animal => {
                const meat = checkWithdrawalActive(animal.quarantine?.meatUntil);
                const milk = checkWithdrawalActive(animal.quarantine?.milkUntil);

                return (
                  <div key={animal.id} className="bg-stone-900 border-2 border-rose-700/80 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xl text-white">{animal.earTag}</span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-900/60 text-rose-300 text-xs font-bold uppercase">
                            Kesim Yasağı
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {animal.breed} • {animal.padok}
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center font-bold">
                        <Lock className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-800 text-xs space-y-1">
                      <div className="text-stone-400">Uygulanan İlaç / Tedavi:</div>
                      <div className="font-bold text-white text-sm">{animal.quarantine?.medicineName || 'Veteriner İlacı'}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/60">
                        <span className="text-stone-400 block text-[11px]">Et Arınma Süresi</span>
                        <span className="text-base font-black text-rose-400">
                          {meat.isActive ? `${meat.remainingDays} Gün Kaldı` : 'Arındı (Güvenli)'}
                        </span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">Bitiş: {animal.quarantine?.meatUntil}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/60">
                        <span className="text-stone-400 block text-[11px]">Süt Arınma Süresi</span>
                        <span className="text-base font-black text-amber-400">
                          {milk.isActive ? `${milk.remainingDays} Gün Kaldı` : 'Arındı (Güvenli)'}
                        </span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">Bitiş: {animal.quarantine?.milkUntil}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-stone-900 border border-stone-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-white font-bold text-base">Arınma Süresinde Hayvan Yok</h3>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Tüm sürünün et ve süt arınma süreleri tamamlanmıştır. Kesim veya süt satışı için herhangi bir ilaç kalıntısı engeli bulunmamaktadır.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 3: TÜM UYGULAMA GEÇMİŞİ */}
      {activeSubTab === 'kayitlar' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-bold uppercase">
              <tr>
                <th className="p-3">Uygulama & İlaç</th>
                <th className="p-3">Hedef Grup / Küpe</th>
                <th className="p-3">Uygulama Tarihi</th>
                <th className="p-3">Dozaj</th>
                <th className="p-3">Et/Süt Arınma</th>
                <th className="p-3">Veteriner / Maliyet</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {healthRecords.map(hr => (
                <tr key={hr.id} className="hover:bg-stone-800/40">
                  <td className="p-3">
                    <div className="font-bold text-white text-sm">{hr.title}</div>
                    <div className="text-[11px] text-stone-400">{hr.medicineName}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                      {hr.targetTags?.join(', ') || 'Tüm Sürü'}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-emerald-400">{hr.applicationDate}</td>
                  <td className="p-3 text-stone-300">{hr.dosage}</td>
                  <td className="p-3">
                    <div className="text-stone-300">Et: {hr.meatWithdrawalDays}g • Süt: {hr.milkWithdrawalDays}g</div>
                  </td>
                  <td className="p-3">
                    <div className="text-white font-medium">{hr.vetName || 'Çiftlik Personeli'}</div>
                    <div className="text-stone-400">{formatCurrency(hr.cost)}</div>
                  </td>
                  <td className="p-3 text-right">
                    {canEdit ? (
                      <button
                        onClick={() => setEditingRecord(hr)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                        title="Kaydı Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Düzenle</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('Bu çiftlikte düzenleme yetkiniz yok (Salt Okunur). Yalnızca oda yöneticisi yetki verebilir.')}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-800/40 text-stone-500 border border-stone-800 text-xs font-medium inline-flex items-center gap-1 cursor-not-allowed opacity-60"
                        title="Düzenleme yetkiniz yok"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Düzenle</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB TAB 4: ÖLÜM & HASTALIK VAKALARI ANALİZİ */}
      {activeSubTab === 'olum_analizi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Toplam Telef / Zayiat</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{deceasedAnimals.length} Baş</div>
              <span className="text-[11px] text-stone-400">Kayıtlı sürü zayiatı</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Sürü Yaşama Oranı</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {animals.length ? `${Math.round(((animals.length - deceasedAnimals.length) / animals.length) * 100)}%` : '100%'}
              </div>
              <span className="text-[11px] text-stone-400">Mükemmel sürü sağlığı</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Başlıca Zayiat Nedeni</span>
              <div className="text-base font-bold text-amber-400 mt-2">
                Akut Timpani (Gazlı Şişme)
              </div>
            </div>
          </div>

          {/* Telef Olan Hayvanların Dökümü */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-800">
              <h3 className="font-bold text-white text-sm">Vefat / Telef Vaka Kayıtları</h3>
            </div>
            <div className="divide-y divide-stone-800 text-xs">
              {deceasedAnimals.map(a => (
                <div key={a.id} className="p-4 hover:bg-stone-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center font-bold">
                        <HeartCrack className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-white">{a.earTag} ({a.breed})</div>
                        <div className="text-stone-400 mt-0.5">Tarih: {a.statusChangeDate || 'Kayıtlı Değil'}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 font-bold">
                      Ölüm / Telef
                    </span>
                  </div>
                  <div className="mt-2 text-stone-300 pl-13">
                    <strong>Neden & Teşhis: </strong>
                    {a.statusReason || a.notes || 'Detaylı otopsi raporu girilmemiş'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* YENİ SAĞLIK / AŞI MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-6 bg-stone-800/80 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Yeni Aşı / İlaçlama Kaydı</h3>
                <p className="text-xs text-stone-400">Aşı takvimi, parazit mücadelesi ve arınma süreleri</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHealth} className="p-6 overflow-y-auto space-y-4 text-xs text-stone-300">
              {/* Hızlı Şablon Butonları */}
              <div>
                <label className="text-[11px] text-stone-400 block mb-1 font-semibold">Hızlı Aşı Şablonları</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('enterotoksemi')}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                  >
                    Enterotoksemi (Çelerme)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cicek')}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                  >
                    Çiçek Aşısı
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('parazit')}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                  >
                    İç Parazit
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('tirnak')}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                  >
                    Tırnak Bakımı
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-white block mb-1">Uygulama Başlığı*</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Enterotoksemi Aşısı"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Kullanılan İlaç / Aşı Adı*</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Clostrivax 8"
                    value={medicineName}
                    onChange={e => setMedicineName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Hedef Kitle*</label>
                  <select
                    value={targetType}
                    onChange={e => setTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  >
                    <option value="suru">Tüm Sürü / Padok</option>
                    <option value="bireysel">Bireysel Hayvan</option>
                  </select>
                </div>

                {targetType === 'bireysel' && (
                  <div>
                    <label className="font-semibold text-white block mb-1">Küpe Numarası*</label>
                    <select
                      value={selectedTag}
                      onChange={e => setSelectedTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
                    >
                      <option value="">Seçiniz...</option>
                      {animals.map(a => (
                        <option key={a.id} value={a.earTag}>{a.earTag} ({a.breed})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-white block mb-1">Uygulama Tarihi*</label>
                  <input
                    type="date"
                    required
                    value={appDate}
                    onChange={e => setAppDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Sonraki Planlanan Tarih</label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={e => setNextDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-rose-300 block mb-1">Et Arınma Süresi (Gün)</label>
                  <input
                    type="number"
                    value={meatWithdrawalDays}
                    onChange={e => setMeatWithdrawalDays(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-amber-300 block mb-1">Süt Arınma Süresi (Gün)</label>
                  <input
                    type="number"
                    value={milkWithdrawalDays}
                    onChange={e => setMilkWithdrawalDays(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Dozaj & Yöntem</label>
                <input
                  type="text"
                  placeholder="2 ml boyun altı cilt altı enjeksiyon"
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAĞLIK VE AŞI DÜZENLEME MODALI */}
      {editingRecord && (
        <EditHealthModal
          isOpen={true}
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(updated) => {
            if (onUpdateHealthRecord) {
              onUpdateHealthRecord(updated);
            }
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
};
