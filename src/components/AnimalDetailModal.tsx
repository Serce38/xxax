import React, { useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  Calendar, 
  Check, 
  ChevronRight, 
  Clock, 
  Dna, 
  Edit3, 
  Heart, 
  History, 
  Lock,
  MapPin, 
  Plus, 
  Scale, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  X 
} from 'lucide-react';
import { Animal, AnimalStatus } from '../types/farm';
import { EditAnimalModal } from './modals/EditAnimalModal';
import { 
  calculateADG, 
  calculateAge, 
  checkWithdrawalActive, 
  formatCurrency, 
  getCategoryMeta, 
  getStatusMeta 
} from '../utils/calculations';

interface AnimalDetailModalProps {
  animal: Animal;
  allAnimals: Animal[];
  canEdit?: boolean;
  onClose: () => void;
  onUpdateAnimal: (updated: Animal) => void;
  onSelectAnotherAnimal: (animal: Animal) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  allAnimals,
  canEdit = true,
  onClose,
  onUpdateAnimal,
  onSelectAnotherAnimal
}) => {
  const [activeTab, setActiveTab] = useState<'genel' | 'tartim' | 'soyagaci' | 'saglik' | 'durum'>('genel');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Tartım ekleme formu
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightNote, setWeightNote] = useState('');

  // Durum değişikliği formu (satıldı, kesildi, öldü)
  const [newStatus, setNewStatus] = useState<AnimalStatus>(animal.status);
  const [statusReason, setStatusReason] = useState(animal.statusReason || '');
  const [salePrice, setSalePrice] = useState(animal.salePrice?.toString() || '');

  const catMeta = getCategoryMeta(animal.category);
  const statusMeta = getStatusMeta(animal.status);

  // Soy ağacı için anne ve baba bulma
  const mother = animal.motherTag ? allAnimals.find(a => a.earTag === animal.motherTag) : undefined;
  const father = animal.fatherTag ? allAnimals.find(a => a.earTag === animal.fatherTag) : undefined;
  // Çocukları / Kuzuları bulma
  const offspring = allAnimals.filter(a => a.motherTag === animal.earTag || a.fatherTag === animal.earTag);

  // Karantina kontrolü
  const meatCheck = checkWithdrawalActive(animal.quarantine?.meatUntil);
  const milkCheck = checkWithdrawalActive(animal.quarantine?.milkUntil);

  // Tartım ekleme
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) return;

    const newHistory = [
      ...(animal.weightHistory || []),
      { date: newWeightDate, weight: w, note: weightNote.trim() || undefined }
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const updated: Animal = {
      ...animal,
      currentWeight: w,
      weightHistory: newHistory
    };

    onUpdateAnimal(updated);
    setNewWeight('');
    setWeightNote('');
  };

  // Yaşam Durumu Değiştirme
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Animal = {
      ...animal,
      status: newStatus,
      statusReason: statusReason.trim() || undefined,
      statusChangeDate: new Date().toISOString().split('T')[0],
      salePrice: salePrice ? parseFloat(salePrice) : undefined
    };
    onUpdateAnimal(updated);
    alert('Hayvan yaşam durumu güncellendi.');
  };

  // Son iki tartım arası GCAA (Günlük Canlı Ağırlık Artışı)
  let adgInfo = null;
  if (animal.weightHistory && animal.weightHistory.length >= 2) {
    const len = animal.weightHistory.length;
    const prev = animal.weightHistory[len - 2];
    const curr = animal.weightHistory[len - 1];
    adgInfo = calculateADG(prev.weight, prev.date, curr.weight, curr.date);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 to-stone-800 border-b border-stone-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-xl">
              {animal.category === 'koc' ? '🐏' : '🐑'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{animal.earTag}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${catMeta.badgeClass}`}>
                  {catMeta.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusMeta.colorClass}`}>
                  {statusMeta.label}
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-1 flex items-center gap-3">
                {animal.name && <span className="text-emerald-400 font-semibold">{animal.name}</span>}
                <span>{animal.breed}</span>
                <span>•</span>
                <span>{animal.gender === 'disi' ? 'Dişi' : 'Erkek'}</span>
                <span>•</span>
                <span>{calculateAge(animal.birthDate)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-500" />
                  {animal.padok}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Tüm Hayvan Bilgilerini Düzenle"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>
            ) : (
              <button
                onClick={() => alert('Bu çiftlikte düzenleme yetkiniz yok (Salt Okunur). Yalnızca oda sahibi yetki verebilir.')}
                className="px-3 py-1.5 rounded-xl bg-stone-800/50 text-stone-500 border border-stone-800 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed opacity-60"
                title="Düzenleme yetkiniz yok"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quarantine Alert Banner if active */}
        {(meatCheck.isActive || milkCheck.isActive) && (
          <div className="bg-rose-950/60 border-b border-rose-800 px-6 py-2.5 flex items-center gap-2.5 text-xs text-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <div className="flex-1">
              <strong>İLAÇ KALINTISI / ARINMA KİLİDİ: </strong>
              {meatCheck.isActive && `Et kesim yasağı (${meatCheck.remainingDays} gün kaldı). `}
              {milkCheck.isActive && `Süt insan tüketimine sunulamaz (${milkCheck.remainingDays} gün kaldı). `}
              ({animal.quarantine?.medicineName})
            </div>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-stone-800 bg-stone-900/60 px-6 text-xs sm:text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('genel')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'genel' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('tartim')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tartim' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Canlı Ağırlık ({animal.currentWeight} kg)</span>
          </button>
          <button
            onClick={() => setActiveTab('soyagaci')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'soyagaci' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Dna className="w-4 h-4" />
            <span>Soy Kütüğü & Yavrular ({offspring.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('durum')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'durum' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Yaşam Döngüsü & Satış</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-200">
          {/* TAB 1: GENEL BİLGİLER */}
          {activeTab === 'genel' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-xs text-stone-400 block mb-1">Küpe Numarası</span>
                  <span className="font-extrabold text-base text-white">{animal.earTag}</span>
                  {animal.electronicTag && (
                    <span className="text-[11px] text-stone-400 block mt-0.5">RFID: {animal.electronicTag}</span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-xs text-stone-400 block mb-1">Doğum Tarihi & Yaş</span>
                  <span className="font-bold text-white">{animal.birthDate}</span>
                  <span className="text-xs text-emerald-400 block mt-0.5">{calculateAge(animal.birthDate)}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-xs text-stone-400 block mb-1">Canlı Ağırlık</span>
                  <span className="font-extrabold text-lg text-emerald-400">{animal.currentWeight} kg</span>
                  <span className="text-[11px] text-stone-400 block mt-0.5">
                    {animal.weightHistory?.length || 0} tartım kaydı
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-xs text-stone-400 block mb-1">Padok / Bölme</span>
                  <span className="font-bold text-white">{animal.padok}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-xs text-stone-400 block mb-1">Menşei</span>
                  <span className="font-bold text-white">
                    {animal.origin === 'dogum' ? 'İşletmede Doğdu' : 'Satın Alındı'}
                  </span>
                  {animal.originFarm && (
                    <span className="text-[11px] text-stone-400 block mt-0.5">{animal.originFarm}</span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-800">
                  <span className="text-xs text-stone-400 block mb-1">Gebelik Durumu</span>
                  {animal.isPregnant ? (
                    <div>
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-current" /> Gebe
                      </span>
                      <span className="text-[11px] text-stone-300 block mt-0.5">
                        Doğum: {animal.pregnancyDueDate}
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium text-stone-400">Gebe Değil / Boş</span>
                  )}
                </div>
              </div>

              {/* Notlar */}
              {animal.notes && (
                <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-800">
                  <h4 className="text-xs font-bold text-stone-400 mb-1.5 uppercase">Özel Notlar & Gözlemler</h4>
                  <p className="text-stone-300 text-sm whitespace-pre-wrap">{animal.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CANLI AĞIRLIK & TARTIM GEÇMİŞİ */}
          {activeTab === 'tartim' && (
            <div className="space-y-6">
              {/* GCAA Özet Kutusu */}
              {adgInfo && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Günlük Canlı Ağırlık Artışı (GCAA)</h4>
                      <p className="text-xs text-stone-400">
                        Son {adgInfo.days} günde hesaplanan gelişim hızı
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${adgInfo.adgGrams >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {adgInfo.adgGrams > 0 ? `+${adgInfo.adgGrams}` : adgInfo.adgGrams} gr/gün
                    </span>
                    <span className="text-[11px] text-stone-400 block">Ortalama Günlük Artış</span>
                  </div>
                </div>
              )}

              {/* Yeni Tartım Ekle Formu */}
              {canEdit ? (
                <form onSubmit={handleAddWeight} className="p-4 rounded-xl bg-stone-800/40 border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Yeni Canlı Ağırlık / Tartım Kaydı Ekle</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Ağırlık (kg)*</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={newWeight}
                        onChange={e => setNewWeight(e.target.value)}
                        placeholder="Örn: 28.5"
                        className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Tartım Tarihi*</label>
                      <input
                        type="date"
                        required
                        value={newWeightDate}
                        onChange={e => setNewWeightDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Not / Açıklama</label>
                      <input
                        type="text"
                        value={weightNote}
                        onChange={e => setWeightNote(e.target.value)}
                        placeholder="Örn: Sütten kesim tartımı"
                        className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Tartımı Kaydet
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800 text-xs text-stone-400 flex items-center gap-2">
                  <span>👁️ Bu odada <strong>gözlemci (salt okunur)</strong> yetkisindesiniz. Tartım eklemek için oda sahibinden yetki isteyiniz.</span>
                </div>
              )}

              {/* Geçmiş Tartım Tablosu */}
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Tartım Geçmişi</h4>
                <div className="border border-stone-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-semibold">
                      <tr>
                        <th className="p-3">Tarih</th>
                        <th className="p-3">Ağırlık</th>
                        <th className="p-3">Fark / Gelişim</th>
                        <th className="p-3">Not</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-300">
                      {animal.weightHistory && animal.weightHistory.length > 0 ? (
                        animal.weightHistory.map((item, idx) => {
                          const prev = idx > 0 ? animal.weightHistory[idx - 1] : null;
                          const diff = prev ? (item.weight - prev.weight).toFixed(1) : null;
                          return (
                            <tr key={idx} className="hover:bg-stone-800/40">
                              <td className="p-3 font-medium text-white">{item.date}</td>
                              <td className="p-3 font-bold text-emerald-400">{item.weight} kg</td>
                              <td className="p-3">
                                {diff !== null ? (
                                  <span className={parseFloat(diff) >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                    {parseFloat(diff) >= 0 ? `+${diff}` : diff} kg
                                  </span>
                                ) : (
                                  <span className="text-stone-500">-</span>
                                )}
                              </td>
                              <td className="p-3 text-stone-400">{item.note || '-'}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-stone-500">
                            Henüz tartım kaydı bulunmuyor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOY KÜTÜĞÜ (PEDIGREE) */}
          {activeTab === 'soyagaci' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Ebeveyn Kayıtları (Soy Kütüğü)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ANNE */}
                  <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-800">
                    <span className="text-xs text-stone-400 block mb-1">Anne (Damızlık Koyun)</span>
                    {animal.motherTag ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-base text-white">{animal.motherTag}</span>
                          {mother && (
                            <span className="text-xs text-stone-400 block mt-0.5">
                              {mother.breed} • {mother.name || 'İsimsiz'}
                            </span>
                          )}
                        </div>
                        {mother && (
                          <button
                            onClick={() => onSelectAnotherAnimal(mother)}
                            className="px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-semibold flex items-center gap-1"
                          >
                            <span>Kartı Aç</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-500 text-xs italic">Anne küpe bilgisi kayıtlı değil.</span>
                    )}
                  </div>

                  {/* BABA */}
                  <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-800">
                    <span className="text-xs text-stone-400 block mb-1">Baba (Damızlık Koç)</span>
                    {animal.fatherTag ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-base text-white">{animal.fatherTag}</span>
                          {father && (
                            <span className="text-xs text-stone-400 block mt-0.5">
                              {father.breed} • {father.name || 'İsimsiz'}
                            </span>
                          )}
                        </div>
                        {father && (
                          <button
                            onClick={() => onSelectAnotherAnimal(father)}
                            className="px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-semibold flex items-center gap-1"
                          >
                            <span>Kartı Aç</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-stone-500 text-xs italic">Baba koç küpe bilgisi kayıtlı değil.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* YAVRULARI */}
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                  Bu Hayvandan Doğan Kuzular / Yavrular ({offspring.length})
                </h4>
                {offspring.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {offspring.map(child => (
                      <div
                        key={child.id}
                        onClick={() => onSelectAnotherAnimal(child)}
                        className="p-3 rounded-xl bg-stone-800/40 hover:bg-stone-800 border border-stone-800 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">{child.earTag}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-700 text-stone-300">
                              {child.gender === 'disi' ? 'Dişi' : 'Erkek'}
                            </span>
                          </div>
                          <div className="text-xs text-stone-400 mt-0.5">
                            Doğum: {child.birthDate} ({child.currentWeight} kg)
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-stone-800/30 text-stone-500 text-xs text-center">
                    Henüz kayıtlı yavru bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: YAŞAM DÖNGÜSÜ & SATIŞ */}
          {activeTab === 'durum' && (
            <form onSubmit={handleSaveStatus} className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-semibold text-stone-400 block mb-1.5">
                  Hayvanın Yaşam Döngüsü Durumu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'aktif', label: 'Aktif Sürüde', desc: 'Ağılda veya merada' },
                    { val: 'satildi', label: 'Satıldı', desc: 'Damızlık veya kasaplık satış' },
                    { val: 'kesildi', label: 'Kesildi', desc: 'Çiftlik içi veya kombina kesim' },
                    { val: 'oldu', label: 'Öldü / Telef', desc: 'Hastalık, zayiat veya kaza' }
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setNewStatus(item.val as AnimalStatus)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        newStatus === item.val
                          ? 'bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-stone-800/40 border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <div className="font-bold text-sm">{item.label}</div>
                      <div className="text-[11px] text-stone-400">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {newStatus === 'satildi' && (
                <div>
                  <label className="text-xs font-semibold text-stone-400 block mb-1">Satış Bedeli (TL)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={e => setSalePrice(e.target.value)}
                    placeholder="Örn: 8500"
                    className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-stone-400 block mb-1">
                  Açıklama / Sebep (Örn: Ölüm nedeni, kesim yeri, alıcı kişi)
                </label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={e => setStatusReason(e.target.value)}
                  placeholder="Detaylı bilgi giriniz..."
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
                >
                  Durumu Güncelle
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditAnimalModal
          isOpen={true}
          animal={animal}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updated) => {
            onUpdateAnimal(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
