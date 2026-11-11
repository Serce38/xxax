import React, { useState } from 'react';
import { 
  AlertCircle, 
  ArrowUpDown, 
  Check, 
  Dna, 
  Download, 
  Edit3,
  Eye, 
  Filter, 
  Heart, 
  Layers, 
  Lock,
  MapPin, 
  Plus, 
  Scale, 
  Search, 
  ShieldAlert, 
  Trash2, 
  UserCheck, 
  Users 
} from 'lucide-react';
import { Animal, AnimalBreed, AnimalCategory, AnimalGender, AnimalStatus } from '../types/farm';
import { PADOKS_LIST } from '../data/mockData';
import { calculateAge, checkWithdrawalActive, getCategoryMeta, getStatusMeta } from '../utils/calculations';
import { EditAnimalModal } from './modals/EditAnimalModal';

interface AnimalsListProps {
  animals: Animal[];
  canEdit?: boolean;
  onSelectAnimal: (animal: Animal) => void;
  onAddAnimal: (newAnimal: Animal) => void;
  onUpdateAnimal: (updated: Animal) => void;
  onDeleteAnimal: (id: string) => void;
}

export const AnimalsList: React.FC<AnimalsListProps> = ({
  animals,
  canEdit = true,
  onSelectAnimal,
  onAddAnimal,
  onUpdateAnimal,
  onDeleteAnimal
}) => {
  // Filtreler
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<AnimalStatus | 'all'>('aktif');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [selectedPadok, setSelectedPadok] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'earTag' | 'weight' | 'birthDate'>('earTag');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Yeni Hayvan Ekleme Modalı
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formTag, setFormTag] = useState('');
  const [formRfid, setFormRfid] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AnimalCategory>('anac_koyun');
  const [formGender, setFormGender] = useState<AnimalGender>('disi');
  const [formBreed, setFormBreed] = useState<AnimalBreed>('Merinos');
  const [formBirthDate, setFormBirthDate] = useState(new Date().toISOString().split('T')[0]);
  const [formWeight, setFormWeight] = useState('60');
  const [formPadok, setFormPadok] = useState(PADOKS_LIST[0]);
  const [formOrigin, setFormOrigin] = useState<'dogum' | 'satin_alma'>('dogum');
  const [formOriginFarm, setFormOriginFarm] = useState('');
  const [formMotherTag, setFormMotherTag] = useState('');
  const [formFatherTag, setFormFatherTag] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Toplu Seçim
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchPadok, setBatchPadok] = useState('');

  // Filtreleme
  const filtered = animals.filter(animal => {
    if (selectedCategory !== 'all' && animal.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && animal.status !== selectedStatus) return false;
    if (selectedBreed !== 'all' && animal.breed !== selectedBreed) return false;
    if (selectedPadok !== 'all' && animal.padok !== selectedPadok) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTag = animal.earTag.toLowerCase().includes(q);
      const matchName = animal.name?.toLowerCase().includes(q) || false;
      const matchRfid = animal.electronicTag?.toLowerCase().includes(q) || false;
      const matchMother = animal.motherTag?.toLowerCase().includes(q) || false;
      const matchFather = animal.fatherTag?.toLowerCase().includes(q) || false;
      if (!matchTag && !matchName && !matchRfid && !matchMother && !matchFather) return false;
    }
    return true;
  });

  // Sıralama
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'earTag') {
      cmp = a.earTag.localeCompare(b.earTag);
    } else if (sortBy === 'weight') {
      cmp = a.currentWeight - b.currentWeight;
    } else if (sortBy === 'birthDate') {
      cmp = new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  // Yeni Hayvan Kaydetme
  const handleCreateAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTag.trim()) {
      alert('Lütfen geçerli bir kulak küpe numarası giriniz.');
      return;
    }

    // Küpe no tekil olmalı
    const exists = animals.some(a => a.earTag.trim().toLowerCase() === formTag.trim().toLowerCase());
    if (exists) {
      alert(`Bu küpe numarası (${formTag}) zaten kayıtlı!`);
      return;
    }

    const w = parseFloat(formWeight) || 50;
    const newAnimal: Animal = {
      id: `animal-${Date.now()}`,
      earTag: formTag.trim(),
      electronicTag: formRfid.trim() || undefined,
      name: formName.trim() || undefined,
      category: formCategory,
      gender: formGender,
      breed: formBreed,
      birthDate: formBirthDate,
      status: 'aktif',
      origin: formOrigin,
      originFarm: formOrigin === 'satin_alma' ? formOriginFarm.trim() : undefined,
      motherTag: formMotherTag.trim() || undefined,
      fatherTag: formFatherTag.trim() || undefined,
      padok: formPadok,
      currentWeight: w,
      weightHistory: [
        { date: formBirthDate, weight: w, note: 'İlk kayıt / başlangıç tartımı' }
      ],
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onAddAnimal(newAnimal);
    setIsAddModalOpen(false);
    // Sıfırla
    setFormTag('');
    setFormName('');
    setFormNotes('');
  };

  // Toplu Padok Değiştirme
  const handleBatchMovePadok = () => {
    if (!batchPadok || selectedIds.length === 0) return;
    for (const id of selectedIds) {
      const a = animals.find(x => x.id === id);
      if (a) {
        onUpdateAnimal({ ...a, padok: batchPadok });
      }
    }
    alert(`${selectedIds.length} adet hayvan ${batchPadok} bölmesine taşındı.`);
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sorted.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sorted.map(a => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Kategori Sayaçları
  const counts = {
    all: animals.length,
    anac_koyun: animals.filter(a => a.category === 'anac_koyun').length,
    koc: animals.filter(a => a.category === 'koc').length,
    toklu: animals.filter(a => a.category === 'toklu').length,
    kuzu: animals.filter(a => a.category === 'kuzu').length
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & New Animal Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            <span>Sürü & Hayvan Yönetimi</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Kategori bazlı soy kütüğü, küpe no, canlı ağırlık ve yaşam döngüsü kontrolü
          </p>
        </div>

        {canEdit ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Hayvan Kaydet</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-stone-800 text-stone-400 border border-stone-700 text-xs flex items-center gap-1.5 font-medium">
            <span>👁️ Gözlemci Modu (Kayıt Yetkisi Yok)</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-800">
        {[
          { key: 'all', label: 'Tüm Sürü', count: counts.all },
          { key: 'anac_koyun', label: 'Anaç Koyunlar', count: counts.anac_koyun },
          { key: 'koc', label: 'Damızlık Koçlar', count: counts.koc },
          { key: 'toklu', label: 'Toklular', count: counts.toklu },
          { key: 'kuzu', label: 'Kuzular', count: counts.kuzu }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === tab.key
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              selectedCategory === tab.key ? 'bg-emerald-700 text-white' : 'bg-stone-800 text-stone-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Küpe No, Çip/RFID, İsim veya Anne/Baba..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs placeholder:text-stone-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Yaşam Durumu */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="aktif">Durum: Aktif Sürüde</option>
              <option value="satildi">Durum: Satıldı</option>
              <option value="kesildi">Durum: Kesildi</option>
              <option value="oldu">Durum: Öldü / Telef</option>
              <option value="all">Durum: Tümü (Arşiv Dahil)</option>
            </select>
          </div>

          {/* Irk Filtresi */}
          <div>
            <select
              value={selectedBreed}
              onChange={e => setSelectedBreed(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Tüm Irklar</option>
              <option value="Merinos">Merinos</option>
              <option value="Akkaraman">Akkaraman</option>
              <option value="İvesi">İvesi</option>
              <option value="Kıvırcık">Kıvırcık</option>
              <option value="Dorper">Dorper</option>
              <option value="Sakız">Sakız</option>
              <option value="Kangal">Kangal</option>
            </select>
          </div>

          {/* Padok Filtresi */}
          <div>
            <select
              value={selectedPadok}
              onChange={e => setSelectedPadok(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Tüm Padoklar</option>
              {PADOKS_LIST.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toplu İşlem Çubuğu (Seçili hayvan varsa) */}
        {selectedIds.length > 0 && (
          <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <span>{selectedIds.length} hayvan seçildi</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={batchPadok}
                onChange={e => setBatchPadok(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-xs"
              >
                <option value="">Hedef Padoğa Taşı...</option>
                {PADOKS_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                onClick={handleBatchMovePadok}
                disabled={!batchPadok}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold"
              >
                Taşı
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sürü Tablosu */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === sorted.length && sorted.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-stone-700 border-stone-600 text-emerald-600 focus:ring-0"
                  />
                </th>
                <th 
                  className="p-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'earTag') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('earTag'); setSortOrder('asc'); }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Küpe No & İsim</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Kategori & Irk</th>
                <th className="p-3">Cinsiyet & Yaş</th>
                <th 
                  className="p-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    if (sortBy === 'weight') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('weight'); setSortOrder('desc'); }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Ağırlık</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-3">Padok / Bölme</th>
                <th className="p-3">Soy Kütüğü</th>
                <th className="p-3">Durum & Uyarı</th>
                <th className="p-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {sorted.length > 0 ? (
                sorted.map(animal => {
                  const catMeta = getCategoryMeta(animal.category);
                  const statusMeta = getStatusMeta(animal.status);
                  const isSelected = selectedIds.includes(animal.id);

                  // Karantina kontrolü
                  const meatCheck = checkWithdrawalActive(animal.quarantine?.meatUntil);
                  const milkCheck = checkWithdrawalActive(animal.quarantine?.milkUntil);

                  return (
                    <tr 
                      key={animal.id}
                      className={`hover:bg-stone-800/40 transition-colors ${isSelected ? 'bg-emerald-950/20' : ''}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(animal.id)}
                          className="rounded bg-stone-700 border-stone-600 text-emerald-600 focus:ring-0"
                        />
                      </td>

                      {/* Küpe No & İsim */}
                      <td className="p-3">
                        <div 
                          onClick={() => onSelectAnimal(animal)}
                          className="cursor-pointer group"
                        >
                          <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors block">
                            {animal.earTag}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-stone-400">
                            {animal.name && <span className="text-emerald-400 font-medium">{animal.name}</span>}
                            {animal.electronicTag && <span>• RFID: {animal.electronicTag}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Kategori & Irk */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border inline-block mb-1 ${catMeta.badgeClass}`}>
                          {catMeta.label}
                        </span>
                        <div className="text-[11px] text-stone-400">{animal.breed}</div>
                      </td>

                      {/* Cinsiyet & Yaş */}
                      <td className="p-3">
                        <div className="font-medium text-white">{animal.gender === 'disi' ? 'Dişi' : 'Erkek'}</div>
                        <div className="text-[11px] text-stone-400">{calculateAge(animal.birthDate)}</div>
                      </td>

                      {/* Ağırlık */}
                      <td className="p-3">
                        <span className="font-black text-sm text-emerald-400">{animal.currentWeight} kg</span>
                      </td>

                      {/* Padok */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-stone-200">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{animal.padok}</span>
                        </div>
                      </td>

                      {/* Soy Kütüğü */}
                      <td className="p-3">
                        <div className="text-[11px] text-stone-400 space-y-0.5">
                          {animal.motherTag && <div>A: <span className="text-stone-300 font-mono">{animal.motherTag}</span></div>}
                          {animal.fatherTag && <div>B: <span className="text-stone-300 font-mono">{animal.fatherTag}</span></div>}
                          {!animal.motherTag && !animal.fatherTag && <span className="text-stone-500">-</span>}
                        </div>
                      </td>

                      {/* Durum & İlaç Uyarısı */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusMeta.colorClass}`}>
                            {statusMeta.label}
                          </span>

                          {/* İlaç arınma rozeti */}
                          {(meatCheck.isActive || milkCheck.isActive) && (
                            <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800">
                              <ShieldAlert className="w-3 h-3 shrink-0" />
                              <span>{meatCheck.isActive ? `Et: ${meatCheck.remainingDays}g` : `Süt: ${milkCheck.remainingDays}g`}</span>
                            </div>
                          )}

                          {/* Gebelik rozeti */}
                          {animal.isPregnant && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-300 font-medium">
                              <Heart className="w-3 h-3 fill-current text-amber-400" />
                              <span>Gebe</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Aksiyon Butonları */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectAnimal(animal)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-semibold flex items-center gap-1 transition-colors"
                            title="Hayvan Detay Kartı"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline">Detay</span>
                          </button>

                          {canEdit ? (
                            <button
                              onClick={() => setEditingAnimal(animal)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 border border-emerald-700/60 font-semibold flex items-center gap-1 transition-all"
                              title="Hayvan Kaydını Düzenle"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Düzenle</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => alert('Bu çiftlikte düzenleme yetkiniz yok (Salt Okunur Gözlemci Modu). Yalnızca oda sahibi düzenleme yetkisi tanımlayabilir.')}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-800/40 text-stone-500 border border-stone-800 font-medium flex items-center gap-1 cursor-not-allowed opacity-60 hover:border-stone-700"
                              title="Düzenleme yetkiniz bulunmuyor (Salt Okunur)"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Düzenle</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-500">
                    Arama kriterlerine uygun hayvan kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* YENİ HAYVAN EKLEME MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-6 bg-stone-800/80 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  🐑
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Yeni Hayvan Kaydı</h3>
                  <p className="text-xs text-stone-400">Sürüye yeni kulak küpesi ve soy kütüğü tanımla</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnimal} className="p-6 overflow-y-auto space-y-4 text-xs text-stone-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Küpe No */}
                <div>
                  <label className="font-semibold text-white block mb-1">Kulak Küpe No*</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: TR 16 00850"
                    value={formTag}
                    onChange={e => setFormTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* RFID / Elektronik Çip */}
                <div>
                  <label className="font-semibold text-white block mb-1">Elektronik Küpe / RFID (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: 982 000412389102"
                    value={formRfid}
                    onChange={e => setFormRfid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* İsim / Lakap */}
                <div>
                  <label className="font-semibold text-white block mb-1">İsim / Lakap (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Örn: Pamuk, Kral"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="font-semibold text-white block mb-1">Kategori*</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as AnimalCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="anac_koyun">Anaç Koyun</option>
                    <option value="koc">Damızlık Koç</option>
                    <option value="toklu">Toklu</option>
                    <option value="kuzu">Kuzu</option>
                  </select>
                </div>

                {/* Cinsiyet */}
                <div>
                  <label className="font-semibold text-white block mb-1">Cinsiyet*</label>
                  <select
                    value={formGender}
                    onChange={e => setFormGender(e.target.value as AnimalGender)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="disi">Dişi</option>
                    <option value="erkek">Erkek</option>
                  </select>
                </div>

                {/* Irk */}
                <div>
                  <label className="font-semibold text-white block mb-1">Irk*</label>
                  <select
                    value={formBreed}
                    onChange={e => setFormBreed(e.target.value as AnimalBreed)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Merinos">Merinos (Anadolu / Karacabey)</option>
                    <option value="Akkaraman">Akkaraman</option>
                    <option value="İvesi">İvesi</option>
                    <option value="Kıvırcık">Kıvırcık</option>
                    <option value="Dorper">Dorper</option>
                    <option value="Sakız">Sakız</option>
                    <option value="Kangal">Kangal</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                {/* Doğum Tarihi */}
                <div>
                  <label className="font-semibold text-white block mb-1">Doğum Tarihi*</label>
                  <input
                    type="date"
                    required
                    value={formBirthDate}
                    onChange={e => setFormBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Canlı Ağırlık */}
                <div>
                  <label className="font-semibold text-white block mb-1">Başlangıç Ağırlığı (kg)*</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formWeight}
                    onChange={e => setFormWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Padok */}
                <div>
                  <label className="font-semibold text-white block mb-1">Padok / Bölme*</label>
                  <select
                    value={formPadok}
                    onChange={e => setFormPadok(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {PADOKS_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Menşei */}
                <div>
                  <label className="font-semibold text-white block mb-1">Menşei</label>
                  <select
                    value={formOrigin}
                    onChange={e => setFormOrigin(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="dogum">İşletmede Doğdu</option>
                    <option value="satin_alma">Satın Alındı / Dışarıdan Geldi</option>
                  </select>
                </div>

                {formOrigin === 'satin_alma' && (
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-white block mb-1">Geldiği İşletme / Menşei Bilgisi</label>
                    <input
                      type="text"
                      placeholder="Örn: Balıkesir Damızlık Koyun Yetiştiricileri Birliği"
                      value={formOriginFarm}
                      onChange={e => setFormOriginFarm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Soy Kütüğü: Anne ve Baba Küpesi */}
                <div>
                  <label className="font-semibold text-white block mb-1">Anne Küpe No (Soy Kütüğü)</label>
                  <input
                    type="text"
                    placeholder="TR 16 00..."
                    value={formMotherTag}
                    onChange={e => setFormMotherTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Baba Küpe No (Soy Kütüğü)</label>
                  <input
                    type="text"
                    placeholder="TR 16 00..."
                    value={formFatherTag}
                    onChange={e => setFormFatherTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Notlar / Özel Belirteçler</label>
                <textarea
                  rows={2}
                  placeholder="Karakteristik özellikler, aşı durumu vb."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Kaydı Tamamla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HAYVAN DÜZENLEME MODALI */}
      {editingAnimal && (
        <EditAnimalModal
          isOpen={true}
          animal={editingAnimal}
          onClose={() => setEditingAnimal(null)}
          onSave={(updated) => {
            onUpdateAnimal(updated);
            setEditingAnimal(null);
          }}
        />
      )}
    </div>
  );
};
