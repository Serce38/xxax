import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle, 
  Calculator, 
  CheckCircle2, 
  Edit3,
  Flame,
  Layers, 
  Lock,
  Package, 
  Plus, 
  Sparkles, 
  Trash2,
  TrendingDown,
  TrendingUp, 
  Wheat 
} from 'lucide-react';
import { FeedItem, FeedWasteRecord, RationPlan } from '../types/farm';
import { analyzeRation, formatCurrency } from '../utils/calculations';
import { EditFeedModal } from './modals/EditFeedModal';
import { FeedWasteModal } from './modals/FeedWasteModal';

interface FeedModuleProps {
  feeds: FeedItem[];
  feedWastes: FeedWasteRecord[];
  rations: RationPlan[];
  canEdit?: boolean;
  onAddFeed: (feed: FeedItem) => void;
  onUpdateFeedStock: (id: string, newStockKg: number) => void;
  onUpdateFeed?: (feed: FeedItem) => void;
  onAddRation: (ration: RationPlan) => void;
  onUpdateRation: (ration: RationPlan) => void;
  onAddFeedWaste: (waste: FeedWasteRecord) => void;
  onDeleteFeedWaste: (id: string) => void;
}

export const FeedModule: React.FC<FeedModuleProps> = ({
  feeds,
  feedWastes = [],
  rations,
  canEdit = true,
  onAddFeed,
  onUpdateFeedStock,
  onUpdateFeed,
  onAddRation,
  onUpdateRation,
  onAddFeedWaste,
  onDeleteFeedWaste
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'stoklar' | 'rasyon' | 'zayi'>('stoklar');
  const [isAddFeedModalOpen, setIsAddFeedModalOpen] = useState(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedItem | null>(null);

  // Yeni Yem Formu
  const [feedName, setFeedName] = useState('');
  const [feedType, setFeedType] = useState<FeedItem['type']>('kaba');
  const [stockKg, setStockKg] = useState('1000');
  const [minThresholdKg, setMinThresholdKg] = useState('500');
  const [unitCost, setUnitCost] = useState('6.5');
  const [dryMatterPct, setDryMatterPct] = useState('88');
  const [crudeProteinPct, setCrudeProteinPct] = useState('16');
  const [metabolicEnergy, setMetabolicEnergy] = useState('2.3');

  // Rasyon Simülatörü State
  const [selectedRationId, setSelectedRationId] = useState<string>(rations[0]?.id || '');
  const activeRation = rations.find(r => r.id === selectedRationId) || rations[0];

  // Aktif Rasyonun Besin Değeri & Maliyet Analizi
  const analysis = activeRation ? analyzeRation(activeRation, feeds) : null;

  // Zayi / Fire Toplamları
  const totalWasteKg = useMemo(() => {
    return feedWastes.reduce((sum, w) => sum + w.amountKg, 0);
  }, [feedWastes]);

  const totalWasteCostTL = useMemo(() => {
    return feedWastes.reduce((sum, w) => sum + w.costTL, 0);
  }, [feedWastes]);

  // Yeni Yem Kaydet
  const handleSaveFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName.trim()) return;

    const newFeed: FeedItem = {
      id: `feed-${Date.now()}`,
      name: feedName.trim(),
      type: feedType,
      stockKg: parseFloat(stockKg) || 0,
      minThresholdKg: parseFloat(minThresholdKg) || 0,
      unitCost: parseFloat(unitCost) || 0,
      dryMatterPct: parseFloat(dryMatterPct) || 88,
      crudeProteinPct: parseFloat(crudeProteinPct) || 12,
      metabolicEnergy: parseFloat(metabolicEnergy) || 2.2,
      unit: 'kg'
    };

    onAddFeed(newFeed);
    setIsAddFeedModalOpen(false);
    setFeedName('');
  };

  // Stok Hızlı Artırma / Azaltma
  const handleQuickAdjust = (feedId: string, currentStock: number, delta: number) => {
    if (!canEdit) {
      alert('Bu çiftlikte düzenleme yetkiniz yok (Salt Okunur).');
      return;
    }
    const updated = Math.max(0, currentStock + delta);
    onUpdateFeedStock(feedId, updated);
  };

  // Rasyonda yem miktarını değiştirme
  const handleUpdateIngredient = (feedId: string, amount: number) => {
    if (!activeRation || !canEdit) return;
    const updatedIngredients = activeRation.ingredients.map(item => {
      if (item.feedId === feedId) {
        return { ...item, amountKgPerAnimal: Math.max(0, amount) };
      }
      return item;
    });

    onUpdateRation({
      ...activeRation,
      ingredients: updatedIngredients
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wheat className="w-6 h-6 text-amber-500" />
            <span>Besleme, Yem Ambarı & Zayi Takibi</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Kaba ve konsantre yem stokları, zayi/fire takibi ve dönemsel rasyon besin dengesi (KM, HP, ME)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button
                onClick={() => setIsWasteModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Zayi, dökülen veya bozulan yem kaydet"
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span>+ Zayi / Fire Girişi</span>
              </button>

              <button
                onClick={() => setIsAddFeedModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/40 active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Yem Tanımla</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('stoklar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'stoklar'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Yem Ambarı Stokları ({feeds.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rasyon')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'rasyon'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Rasyon & Besin Hesaplayıcı</span>
        </button>

        <button
          onClick={() => setActiveSubTab('zayi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'zayi'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Zayi & Fire Takibi ({feedWastes.length})</span>
        </button>
      </div>

      {/* SUB TAB 1: YEM STOKLARI */}
      {activeSubTab === 'stoklar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeds.map(feed => {
              const isLow = feed.stockKg <= feed.minThresholdKg;
              const percent = Math.min(100, Math.round((feed.stockKg / (feed.minThresholdKg * 2)) * 100));

              return (
                <div
                  key={feed.id}
                  className={`bg-stone-900 border rounded-2xl p-5 shadow-sm space-y-3 transition-all ${
                    isLow ? 'border-amber-600/80 ring-1 ring-amber-500' : 'border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        feed.type === 'kaba' ? 'bg-emerald-950 text-emerald-300' : feed.type === 'konsantre' ? 'bg-amber-950 text-amber-300' : 'bg-purple-950 text-purple-300'
                      }`}>
                        {feed.type === 'kaba' ? 'Kaba Yem' : feed.type === 'konsantre' ? 'Konsantre Yem' : 'Mineral'}
                      </span>
                      <h3 className="font-extrabold text-white text-base mt-1.5">{feed.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isLow && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Kritik
                        </span>
                      )}
                      {canEdit ? (
                        <button
                          onClick={() => setEditingFeed(feed)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 border border-stone-700 transition-colors"
                          title="Yem Stok Bilgilerini Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => alert('Bu çiftlikte düzenleme yetkiniz yok (Salt Okunur). Yalnızca oda sahibi yetki verebilir.')}
                          className="p-1.5 rounded-lg bg-stone-800/40 text-stone-600 border border-stone-800 cursor-not-allowed opacity-60"
                          title="Düzenleme yetkiniz yok"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stok Miktarı ve Gösterge */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-white">
                        {feed.stockKg.toLocaleString('tr-TR')} {feed.unit}
                      </span>
                      <span className="text-xs text-stone-400">
                        Eşik: {feed.minThresholdKg.toLocaleString('tr-TR')} kg
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Besin Değerleri ve Birim Fiyat */}
                  <div className="pt-2 border-t border-stone-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-stone-800/40">
                      <span className="text-[10px] text-stone-400 block">KM (Kuru M.)</span>
                      <strong className="text-stone-200">%{feed.dryMatterPct}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-800/40">
                      <span className="text-[10px] text-stone-400 block">Ham Protein</span>
                      <strong className="text-emerald-400">%{feed.crudeProteinPct}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-800/40">
                      <span className="text-[10px] text-stone-400 block">Birim Fiyat</span>
                      <strong className="text-white">{feed.unitCost} TL/kg</strong>
                    </div>
                  </div>

                  {/* Hızlı Stok Düzenleme Butonları */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-stone-400">Hızlı Stok Girişi:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickAdjust(feed.id, feed.stockKg, -100)}
                        className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold"
                        title="100 kg düş"
                      >
                        -100
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(feed.id, feed.stockKg, 250)}
                        className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 font-bold"
                        title="250 kg ekle"
                      >
                        +250
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(feed.id, feed.stockKg, 1000)}
                        className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 font-bold"
                        title="1 Ton (1000 kg) ekle"
                      >
                        +1 Ton
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 2: RASYON VE BESİN HESAPLAYICI */}
      {activeSubTab === 'rasyon' && activeRation && analysis && (
        <div className="space-y-6">
          {/* Rasyon Seçici */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {rations.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRationId(r.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  r.id === activeRation.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <span>{r.targetGroupLabel}</span>
                <span className="ml-1.5 opacity-70">({r.animalCount} Baş)</span>
              </button>
            ))}
          </div>

          {/* Rasyon Analiz Özeti */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Hayvan Başı Günlük Maliyet</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatCurrency(analysis.costPerAnimalPerDay)}
              </div>
              <span className="text-[11px] text-stone-500">Günlük rasyon bedeli</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Grup Günlük Toplam Yem Maliyeti</span>
              <div className="text-2xl font-black text-white mt-1">
                {formatCurrency(analysis.totalGroupDailyCost)}
              </div>
              <span className="text-[11px] text-stone-500">{activeRation.animalCount} baş hayvan için</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Rasyon Ham Protein (HP)</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                %{analysis.totalCrudeProteinPct}
              </div>
              <span className="text-[11px] text-stone-500">İdeal laktasyon aralığı %16-18</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <span className="text-xs text-stone-400">Metabolik Enerji (ME)</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {analysis.totalMetabolicEnergy} Mcal/kg
              </div>
              <span className="text-[11px] text-stone-500">Kuru madde başına enerji</span>
            </div>
          </div>

          {/* Rasyon İçerik Tablosu */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{activeRation.name} - Günlük Bileşenleri</h3>
                <p className="text-xs text-stone-400">Hayvan başı günlük tüketim miktarlarını doğrudan değiştirebilirsiniz</p>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                Toplam KM Tüketimi: {analysis.totalDryMatterKg} kg / Gün
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-bold uppercase">
                <tr>
                  <th className="p-3">Yem Adı</th>
                  <th className="p-3">Tür</th>
                  <th className="p-3">Hayvan Başı Miktar (kg/Gün)</th>
                  <th className="p-3">Grup Günlük Tüketim</th>
                  <th className="p-3">Birim Maliyet</th>
                  <th className="p-3 text-right">Günlük Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {activeRation.ingredients.map(item => {
                  const feed = feeds.find(f => f.id === item.feedId);
                  if (!feed) return null;
                  const groupDailyKg = item.amountKgPerAnimal * activeRation.animalCount;
                  const itemDailyCost = groupDailyKg * feed.unitCost;

                  return (
                    <tr key={item.feedId} className="hover:bg-stone-800/40">
                      <td className="p-3 font-bold text-white">{feed.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] uppercase font-bold">
                          {feed.type}
                        </span>
                      </td>
                      <td className="p-3">
                        {canEdit ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              value={item.amountKgPerAnimal}
                              onChange={e => handleUpdateIngredient(item.feedId, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 bg-stone-800 border border-stone-700 rounded text-white font-mono font-bold text-xs"
                            />
                            <span className="text-stone-400">kg</span>
                          </div>
                        ) : (
                          <span className="font-mono text-white font-bold">{item.amountKgPerAnimal} kg</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-stone-200">
                        {groupDailyKg.toLocaleString('tr-TR')} kg / Gün
                      </td>
                      <td className="p-3 font-mono text-stone-300">
                        {feed.unitCost} TL/kg
                      </td>
                      <td className="p-3 text-right font-black text-emerald-400 font-mono">
                        {formatCurrency(itemDailyCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: ZAYİ (ATIK / KAYIP / FİRE) YEM TAKİBİ (REQUIREMENT 3) */}
      {activeSubTab === 'zayi' && (
        <div className="space-y-6">
          {/* Zayi Başlık & Aksiyon */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950/30 to-stone-900 border border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
                Fire & Ambar Zayiat Takibi
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Zayi (Atık / Fire) Yem Kayıtları
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Dökülme, küflenme, rutubet ve kemirgen hasarı gibi depo firelerinin stoktan düşülmesi ve maliyet analizi
              </p>
            </div>

            {canEdit && (
              <button
                onClick={() => setIsWasteModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Zayi / Fire Kaydet</span>
              </button>
            )}
          </div>

          {/* Zayiat KPI Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <span className="text-xs text-stone-400">Toplam Kayıp Yem Miktarı</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {totalWasteKg.toLocaleString('tr-TR')} kg
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">Ambar stoklarından düşülen toplam fire</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <span className="text-xs text-stone-400">Toplam Parasal Zayiat Zararı</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {formatCurrency(totalWasteCostTL)}
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">İşletme rasyon ve bütçe maliyetine yansıyan fire bedeli</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <span className="text-xs text-stone-400">Kayıtlı Fire Olayı</span>
              <div className="text-2xl font-black text-white mt-1">
                {feedWastes.length} Olay Kaydı
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">Ambar kontrol tutanakları</span>
            </div>
          </div>

          {/* Zayi Yem Tablosu */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-bold uppercase">
                <tr>
                  <th className="p-3">Tarih</th>
                  <th className="p-3">Zayi Olan Yem</th>
                  <th className="p-3">Fire Miktarı</th>
                  <th className="p-3">Zayiat Nedeni</th>
                  <th className="p-3">Mali Kayıp (TL)</th>
                  <th className="p-3">Açıklama / Not</th>
                  <th className="p-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {feedWastes.length > 0 ? (
                  feedWastes.map(w => (
                    <tr key={w.id} className="hover:bg-stone-800/40">
                      <td className="p-3 font-medium text-white font-mono">{w.date}</td>
                      <td className="p-3 font-bold text-white text-sm">{w.feedName}</td>
                      <td className="p-3 font-mono font-black text-rose-400 text-sm">
                        {w.amountKg} kg
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold text-[10px]">
                          {w.reasonLabel}
                        </span>
                      </td>
                      <td className="p-3 font-black font-mono text-rose-300 text-sm">
                        {formatCurrency(w.costTL)}
                      </td>
                      <td className="p-3 text-stone-400 italic text-[11px]">
                        {w.notes || '-'}
                      </td>
                      <td className="p-3 text-right">
                        {canEdit ? (
                          <button
                            onClick={() => {
                              if (confirm('Bu fire kaydını silmek istediğinize emin misiniz?')) {
                                onDeleteFeedWaste(w.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/60 text-stone-400 hover:text-rose-400"
                            title="Fire Kaydını Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-500 italic">Yetki yok</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-500">
                      Ambarınızda henüz kayıtlı bir yem zayiatı / fire bulunmamaktadır.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* YENİ YEM EKLEME MODALI */}
      {isAddFeedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Yeni Yem Tanımla</h3>

            <form onSubmit={handleSaveFeed} className="space-y-4 text-xs text-stone-300">
              <div>
                <label className="font-semibold text-white block mb-1">Yem Adı*</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mısır Silajı (Çukurova)"
                  value={feedName}
                  onChange={e => setFeedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-white block mb-1">Tür*</label>
                  <select
                    value={feedType}
                    onChange={e => setFeedType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  >
                    <option value="kaba">Kaba Yem (Yonca, Saman, Silaj)</option>
                    <option value="konsantre">Konsantre Yem (Fabrika / Arpa)</option>
                    <option value="mineral">Mineral / Premiks / Tuz</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Birim Fiyat (TL/kg)*</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={unitCost}
                    onChange={e => setUnitCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Başlangıç Stoku (kg)*</label>
                  <input
                    type="number"
                    required
                    value={stockKg}
                    onChange={e => setStockKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Kritik Eşik (kg)*</label>
                  <input
                    type="number"
                    required
                    value={minThresholdKg}
                    onChange={e => setMinThresholdKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Ham Protein (% HP)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={crudeProteinPct}
                    onChange={e => setCrudeProteinPct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Kuru Madde (% KM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dryMatterPct}
                    onChange={e => setDryMatterPct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFeedModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Yemi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YEM DÜZENLEME MODALI */}
      {editingFeed && (
        <EditFeedModal
          isOpen={true}
          feed={editingFeed}
          onClose={() => setEditingFeed(null)}
          onSave={(updated) => {
            if (onUpdateFeed) {
              onUpdateFeed(updated);
            }
            setEditingFeed(null);
          }}
        />
      )}

      {/* ZAYİ / FİRE GİRİŞ MODALI (REQUIREMENT 3) */}
      {isWasteModalOpen && (
        <FeedWasteModal
          isOpen={true}
          feeds={feeds}
          onClose={() => setIsWasteModalOpen(false)}
          onSave={(waste) => {
            onAddFeedWaste(waste);
            setIsWasteModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
