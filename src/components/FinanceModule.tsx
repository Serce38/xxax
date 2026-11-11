import React, { useMemo, useState } from 'react';
import { 
  AlertTriangle,
  ArrowDownRight, 
  ArrowUpRight, 
  Box,
  CheckCircle2, 
  CircleDollarSign, 
  CreditCard, 
  DollarSign, 
  Edit3,
  Handshake,
  Layers,
  Lock,
  Percent,
  PieChart, 
  Plus, 
  Trash2,
  TrendingDown,
  TrendingUp, 
  Users, 
  Wallet,
  Wrench,
  Wheat
} from 'lucide-react';
import { 
  Animal, 
  ExpenseCategory, 
  FarmEquipment, 
  FarmPartner, 
  FeedItem, 
  FinanceRecord, 
  FinanceType, 
  IncomeCategory 
} from '../types/farm';
import { calculateFinancialSummary, formatCurrency } from '../utils/calculations';
import { EditFinanceModal } from './modals/EditFinanceModal';
import { PartnerModal } from './modals/PartnerModal';
import { EquipmentModal } from './modals/EquipmentModal';

interface FinanceModuleProps {
  finances: FinanceRecord[];
  animals: Animal[];
  partners: FarmPartner[];
  equipments: FarmEquipment[];
  feeds: FeedItem[];
  canEdit?: boolean;
  onAddFinanceRecord: (record: FinanceRecord) => void;
  onUpdateFinanceRecord?: (record: FinanceRecord) => void;
  onAddPartner: (partner: FarmPartner) => void;
  onUpdatePartner: (partner: FarmPartner) => void;
  onDeletePartner: (id: string) => void;
  onAddEquipment: (eq: FarmEquipment) => void;
  onUpdateEquipment: (eq: FarmEquipment) => void;
  onDeleteEquipment: (id: string) => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  finances,
  animals,
  partners,
  equipments,
  feeds,
  canEdit = true,
  onAddFinanceRecord,
  onUpdateFinanceRecord,
  onAddPartner,
  onUpdatePartner,
  onDeletePartner,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ozet' | 'hareketler' | 'ortaklar' | 'demirbaslar' | 'varlik'>('ozet');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'year' | 'month'>('all');
  
  // Modallar
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<FarmPartner | null>(null);

  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<FarmEquipment | null>(null);

  // Yeni Finans Kaydı Form State
  const [recordType, setRecordType] = useState<FinanceType>('gider');
  const [category, setCategory] = useState<string>('yem');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'odendi' | 'bekliyor'>('odendi');
  
  // Yem Alımı Entegrasyonu Alanları (Finans -> Yem)
  const [autoAddToFeedStock, setAutoAddToFeedStock] = useState(true);
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feeds[0]?.id || '');
  const [feedQuantityKg, setFeedQuantityKg] = useState<string>('500');
  const [feedUnitPrice, setFeedUnitPrice] = useState<string>('10.5');

  // Canlı Sürü Varlığı Hesabı
  const activeAnimals = animals.filter(a => a.status === 'aktif');
  const lambsCount = activeAnimals.filter(a => a.category === 'kuzu').length;
  
  const ewesValue = activeAnimals.filter(a => a.category === 'anac_koyun').length * 11000;
  const ramsValue = activeAnimals.filter(a => a.category === 'koc').length * 25000;
  const yearlingsValue = activeAnimals.filter(a => a.category === 'toklu').length * 9000;
  const lambsValue = activeAnimals.filter(a => a.category === 'kuzu').length * 5500;
  const totalFlockAssetValue = ewesValue + ramsValue + yearlingsValue + lambsValue;

  // Demirbaş Varlık Toplamı
  const totalEquipmentValue = useMemo(() => {
    return equipments.reduce((sum, eq) => sum + (eq.estimatedValueTL * (eq.quantity || 1)), 0);
  }, [equipments]);

  // Toplam Çiftlik Sermaye/Özkaynak Değeri
  const grandTotalFarmAsset = totalFlockAssetValue + totalEquipmentValue;

  // Filtrelenmiş Finansal Veriler (Dönemsel Kâr/Zarar ve Ortaklık Hesabı İçin)
  const filteredFinances = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    return finances.filter(f => {
      if (periodFilter === 'year') {
        return f.date.startsWith(currentYear);
      }
      if (periodFilter === 'month') {
        return f.date.startsWith(currentMonth);
      }
      return true;
    });
  }, [finances, periodFilter]);

  const summary = useMemo(() => {
    return calculateFinancialSummary(filteredFinances, activeAnimals.length, lambsCount || 10);
  }, [filteredFinances, activeAnimals.length, lambsCount]);

  const netProfitOrLoss = summary.netProfit; // Pozitif ise Kâr, Negatif ise Zarar
  const isProfit = netProfitOrLoss >= 0;

  // Toplam Ortaklık Payı
  const totalExistingShare = useMemo(() => {
    return partners.reduce((sum, p) => sum + p.sharePercent, 0);
  }, [partners]);

  // Yem miktarı veya birim fiyat değiştiğinde tutarı otomatik hesapla
  const handleFeedQtyChange = (qtyStr: string) => {
    setFeedQuantityKg(qtyStr);
    const q = parseFloat(qtyStr);
    const p = parseFloat(feedUnitPrice);
    if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
      setAmount((q * p).toString());
    }
  };

  const handleFeedPriceChange = (priceStr: string) => {
    setFeedUnitPrice(priceStr);
    const q = parseFloat(feedQuantityKg);
    const p = parseFloat(priceStr);
    if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
      setAmount((q * p).toString());
    }
  };

  // Yeni Finans Kaydet
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Tutar sıfırdan büyük bir sayı olmalıdır.');
      return;
    }

    let catLabel = category;
    if (category === 'yem') catLabel = 'Yem Alımı';
    else if (category === 'veteriner_ilac') catLabel = 'Veteriner & İlaç';
    else if (category === 'iscilik') catLabel = 'Çoban / İşçilik';
    else if (category === 'enerji_yakit') catLabel = 'Enerji & Yakıt';
    else if (category === 'bakim_onarim') catLabel = 'Bakım & Onarım';
    else if (category === 'kuzu_satisi') catLabel = 'Kuzu Satışı';
    else if (category === 'damizlik_satisi') catLabel = 'Damızlık Satışı';
    else if (category === 'sut_satisi') catLabel = 'Koyun Sütü Satışı';
    else if (category === 'yapagi_yun') catLabel = 'Yapağı / Yün';
    else if (category === 'destekleme_tesvik') catLabel = 'Devlet Desteği';

    const isFeedPurchase = recordType === 'gider' && category === 'yem' && autoAddToFeedStock;

    const newRecord: FinanceRecord = {
      id: `fin-${Date.now()}`,
      type: recordType,
      category: category as any,
      categoryLabel: catLabel,
      amount: parsedAmount,
      date,
      description: description.trim() || catLabel,
      paymentStatus,
      feedId: isFeedPurchase ? selectedFeedId : undefined,
      feedQuantityKg: isFeedPurchase ? parseFloat(feedQuantityKg) || undefined : undefined,
      feedUnitPrice: isFeedPurchase ? parseFloat(feedUnitPrice) || undefined : undefined
    };

    onAddFinanceRecord(newRecord);
    setIsAddModalOpen(false);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-emerald-500" />
            <span>Çiftlik Finansı, Ortaklık & Demirbaşlar</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Gelir/gider takibi, ortaklık kâr-zarar dağılımı, depo demirbaşları ve entegre yem muhasebesi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>+ Gelir / Gider Ekle</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-stone-800 text-stone-400 border border-stone-700 text-xs flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Gözlemci Modu (Kayıt Yetkisi Yok)</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ozet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'ozet'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Kârlılık & Finansal Özet</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hareketler')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'hareketler'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Kasa Defteri ({finances.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ortaklar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'ortaklar'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>Ortaklık & Kâr/Zarar ({partners.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('demirbaslar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'demirbaslar'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Depo & Demirbaşlar ({equipments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('varlik')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'varlik'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Toplam Varlık Değerleme</span>
        </button>
      </div>

      {/* SUB TAB 1: KÂRLILIK VE BAŞA BAŞ RAPORU */}
      {activeSubTab === 'ozet' && (
        <div className="space-y-6">
          {/* 3 Ana KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-stone-400 uppercase font-semibold">Toplam Çiftlik Geliri</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 flex items-center gap-2">
                <ArrowUpRight className="w-6 h-6" />
                <span>{formatCurrency(summary.totalIncome)}</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Kuzu, damızlık ve teşvik gelirleri</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-stone-400 uppercase font-semibold">Toplam İşletme Gideri</span>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2 flex items-center gap-2">
                <ArrowDownRight className="w-6 h-6" />
                <span>{formatCurrency(summary.totalExpense)}</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">Yem, aşı, işçilik ve elektrik</span>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
              <span className="text-xs text-stone-400 uppercase font-semibold">Net Dönemsel Kâr / Zarar</span>
              <div className={`text-2xl sm:text-3xl font-black mt-2 flex items-center gap-2 ${
                isProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                <span>{formatCurrency(summary.netProfit)}</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                {isProfit ? 'Net nakit pozitif operasyon' : 'İlave sermaye gereksinimi'}
              </span>
            </div>
          </div>

          {/* İleri Analiz Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-stone-400 text-xs font-bold">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <span>KUZU BAŞINA NET ÜRETİM MALİYETİ</span>
              </div>
              <div className="text-2xl font-black text-white">
                {formatCurrency(summary.costPerLamb)}
              </div>
              <p className="text-[11px] text-stone-500">
                Sürüdeki kuzuların büyüme ve sütten kesim sürecindeki ortalama maliyeti
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-stone-400 text-xs font-bold">
                <Users className="w-4 h-4 text-sky-400" />
                <span>ANAÇ KOYUN BAŞINA YILLIK GİDER</span>
              </div>
              <div className="text-2xl font-black text-white">
                {formatCurrency(summary.costPerEwe)}
              </div>
              <p className="text-[11px] text-stone-500">
                Anaç başına düşen kaba/kesif yem, aşı ve barınak bakım gideri
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-stone-400 text-xs font-bold">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>BAŞA BAŞ NOKTASI (BEP)</span>
              </div>
              <div className="text-2xl font-black text-amber-400">
                {summary.breakEvenLambCount} Adet Kuzu
              </div>
              <p className="text-[11px] text-stone-500">
                İşletme masraflarını sıfırlamak için satılması gereken asgari kuzu adedi
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: KASA VE HAREKET DEFTERİ */}
      {activeSubTab === 'hareketler' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-bold uppercase">
              <tr>
                <th className="p-3">Tarih</th>
                <th className="p-3">Tür</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Açıklama</th>
                <th className="p-3">Tutar</th>
                <th className="p-3">Durum</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {finances.map(record => (
                <tr key={record.id} className="hover:bg-stone-800/40">
                  <td className="p-3 font-medium text-white">{record.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      record.type === 'gelir' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {record.type === 'gelir' ? 'Gelir' : 'Gider'}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">
                    <div>{record.categoryLabel}</div>
                    {record.feedQuantityKg && (
                      <div className="text-[10px] text-amber-400 font-normal">
                        🌾 {record.feedQuantityKg} kg yem stoka eklendi
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-stone-300">{record.description}</td>
                  <td className={`p-3 font-extrabold text-sm ${
                    record.type === 'gelir' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {record.type === 'gelir' ? '+' : '-'}{formatCurrency(record.amount)}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                      {record.paymentStatus === 'odendi' ? 'Ödendi' : 'Bekliyor'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {canEdit ? (
                      <button
                        onClick={() => setEditingRecord(record)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                        title="Kaydı Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Düzenle</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('Bu çiftlikte düzenleme yetkiniz yok (Salt Okunur). Yalnızca oda sahibi yetki tanımlayabilir.')}
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

      {/* SUB TAB 3: ORTAKLIK VE KÂR/ZARAR DAĞILIMI (REQUIREMENT 1) */}
      {activeSubTab === 'ortaklar' && (
        <div className="space-y-6">
          {/* Ortaklık ve Dönem Filtre Başlığı */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-indigo-950/30 to-stone-900 border border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                  Hissedar Paylaşım Modülü
                </span>
                <span className={`text-xs font-bold ${
                  totalExistingShare === 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  • Toplam Dağıtılan Hisse: %{totalExistingShare}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Ortaklık & Kâr/Zarar Dağılım Paneli
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Belirlenen dönemin net kâr veya zarar tutarı ortakların hisse oranlarına göre otomatik paylaştırılır.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Dönem Filtresi */}
              <select
                value={periodFilter}
                onChange={e => setPeriodFilter(e.target.value as any)}
                className="px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">Tüm Zamanlar Kârı/Zararı</option>
                <option value="year">Bu Yılın Kârı/Zararı ({new Date().getFullYear()})</option>
                <option value="month">Bu Ayın Kârı/Zararı</option>
              </select>

              {canEdit && (
                <button
                  onClick={() => {
                    setEditingPartner(null);
                    setIsPartnerModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ortak Ekle</span>
                </button>
              )}
            </div>
          </div>

          {/* Dönemsel Net Kâr / Zarar Özeti Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <span className="text-xs text-stone-400">Dönem Toplam Gelir</span>
              <div className="text-xl font-black text-emerald-400 mt-1">
                {formatCurrency(summary.totalIncome)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <span className="text-xs text-stone-400">Dönem Toplam Gider</span>
              <div className="text-xl font-black text-rose-400 mt-1">
                {formatCurrency(summary.totalExpense)}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isProfit ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-rose-950/20 border-rose-800/60'
            }`}>
              <span className="text-xs text-stone-400 font-semibold">
                {isProfit ? 'Dağıtılacak Net Kâr Tutarı' : 'Karşılanacak Net Zarar Tutarı'}
              </span>
              <div className={`text-2xl font-black mt-1 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isProfit ? '+' : ''}{formatCurrency(netProfitOrLoss)}
              </div>
            </div>
          </div>

          {/* Ortaklar ve Pay Dağıtım Tablosu */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Kayıtlı Ortaklar ve Hisse Dağılım Tablosu</span>
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                {partners.length} Ortak Kayıtlı
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-bold uppercase">
                <tr>
                  <th className="p-3">Ortak Bilgisi</th>
                  <th className="p-3">Hisse Payı (%)</th>
                  <th className="p-3">Başlangıç Sermayesi</th>
                  <th className="p-3">Katılım Tarihi</th>
                  <th className="p-3">
                    {isProfit ? 'Alacağı Kâr Payı (+)' : 'Ödemesi Gereken Zarar Payı (-)'}
                  </th>
                  <th className="p-3">Durum</th>
                  <th className="p-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {partners.length > 0 ? (
                  partners.map(p => {
                    const partnerShareTL = (netProfitOrLoss * p.sharePercent) / 100;
                    return (
                      <tr key={p.id} className="hover:bg-stone-800/40">
                        <td className="p-3">
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-stone-400 font-mono">{p.phone || 'Telefon yok'}</div>
                          {p.notes && <div className="text-[10px] text-stone-500 italic mt-0.5">{p.notes}</div>}
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-mono font-bold text-xs border border-indigo-800/60">
                            %{p.sharePercent}
                          </span>
                        </td>
                        <td className="p-3 text-stone-300 font-mono">
                          {p.investmentAmount ? formatCurrency(p.investmentAmount) : '-'}
                        </td>
                        <td className="p-3 text-stone-400">{p.joinDate}</td>
                        <td className="p-3">
                          <span className={`text-base font-black font-mono ${
                            partnerShareTL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {partnerShareTL >= 0 ? '+' : ''}{formatCurrency(partnerShareTL)}
                          </span>
                        </td>
                        <td className="p-3">
                          {isProfit ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                              Kâr Hakedişi
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                              Zarar Karşılama
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEdit ? (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingPartner(p);
                                    setIsPartnerModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium flex items-center gap-1"
                                  title="Ortak Bilgilerini Düzenle"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Düzenle</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`${p.name} isimli ortağı silmek istediğinize emin misiniz?`)) {
                                      onDeletePartner(p.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/60 text-stone-400 hover:text-rose-400"
                                  title="Ortağı Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-stone-500 italic">Yetki yok</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-500">
                      Henüz kayıtlı bir ortak bulunmamaktadır. "Ortak Ekle" butonuna basarak ilk ortağı kaydedebilirsiniz.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 4: DEPO & DEMİRBAŞ LİSTESİ (REQUIREMENT 4) */}
      {activeSubTab === 'demirbaslar' && (
        <div className="space-y-6">
          {/* Demirbaş Özet Başlığı */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                Depo & Duran Varlık Takibi
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                İşletme Demirbaş ve Ekipman Listesi
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Makineler, traktör ve römorklar, yemlik/suluklar, çitler ve süt sağım sistemleri envanteri
              </p>
            </div>

            {canEdit && (
              <button
                onClick={() => {
                  setEditingEquipment(null);
                  setIsEquipmentModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Yeni Demirbaş Ekle</span>
              </button>
            )}
          </div>

          {/* Demirbaş KPI Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <span className="text-xs text-stone-400">Toplam Demirbaş Rayiç Değeri</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {formatCurrency(totalEquipmentValue)}
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">Finansal bilançoya yansıyan amortismana tabi varlıklar</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <span className="text-xs text-stone-400">Toplam Ekipman Kalemi / Adet</span>
              <div className="text-2xl font-black text-white mt-1">
                {equipments.length} Kalem ({equipments.reduce((sum, e) => sum + (e.quantity || 1), 0)} Adet)
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">Ağıl ve depolardaki aktif demirbaşlar</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <span className="text-xs text-stone-400">Bakım / Onarım İhtiyacı</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {equipments.filter(e => e.condition === 'bakim_gerekli' || e.condition === 'arizali').length} Ekipman
              </div>
              <span className="text-[10px] text-stone-500 mt-0.5 block">Servis veya onarım bekleyen kalemler</span>
            </div>
          </div>

          {/* Demirbaş Tablosu */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-bold uppercase">
                <tr>
                  <th className="p-3">Ekipman / Demirbaş</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Adet</th>
                  <th className="p-3">Alış / Envanter Tarihi</th>
                  <th className="p-3">Kullanım Durumu</th>
                  <th className="p-3">Tahmini Değer (TL)</th>
                  <th className="p-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {equipments.length > 0 ? (
                  equipments.map(eq => (
                    <tr key={eq.id} className="hover:bg-stone-800/40">
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{eq.name}</div>
                        {eq.serialOrTagNo && (
                          <div className="text-[10px] text-stone-400 font-mono">
                            Seri/Plaka: {eq.serialOrTagNo}
                          </div>
                        )}
                        {eq.notes && <div className="text-[10px] text-stone-500 italic mt-0.5">{eq.notes}</div>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[11px] font-medium border border-stone-700">
                          {eq.categoryLabel}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white text-sm">
                        {eq.quantity} Adet
                      </td>
                      <td className="p-3 text-stone-400 font-mono">{eq.purchaseDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eq.condition === 'yeni'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : eq.condition === 'iyi'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800/50'
                            : eq.condition === 'bakim_gerekli'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                            : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                        }`}>
                          {eq.conditionLabel}
                        </span>
                      </td>
                      <td className="p-3 font-black text-sm text-emerald-400 font-mono">
                        {formatCurrency(eq.estimatedValueTL)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingEquipment(eq);
                                  setIsEquipmentModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium flex items-center gap-1"
                                title="Demirbaşı Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Düzenle</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`${eq.name} demirbaş kaydını silmek istediğinize emin misiniz?`)) {
                                    onDeleteEquipment(eq.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950/60 text-stone-400 hover:text-rose-400"
                                title="Demirbaşı Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-stone-500 italic">Yetki yok</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-500">
                      Kayıtlı demirbaş bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 5: TOPLAM ÇİFTLİK VE SÜRÜ VARLIK DEĞERLEMESİ */}
      {activeSubTab === 'varlik' && (
        <div className="space-y-6">
          {/* Büyük Özkaynak Kartı */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-purple-950/40 to-stone-900 border border-purple-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
                Küçükbaş Çiftliği Toplam Özkaynak Varlık Değeri
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                {formatCurrency(grandTotalFarmAsset)}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Aktif {activeAnimals.length} baş safkan hayvan + {equipments.length} kalem demirbaş ve tesis ekipmanı rayiç bedeli toplamı
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black text-2xl">
              💰
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Canlı Sürü Varlığı */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-bold uppercase">1. Canlı Sürü Envanteri</span>
                <span className="text-xs text-emerald-400 font-black">{formatCurrency(totalFlockAssetValue)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-stone-300">
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span>Anaç Koyun ({activeAnimals.filter(a => a.category === 'anac_koyun').length} Baş)</span>
                  <span className="font-mono text-white">{formatCurrency(ewesValue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span>Damızlık Koç ({activeAnimals.filter(a => a.category === 'koc').length} Baş)</span>
                  <span className="font-mono text-white">{formatCurrency(ramsValue)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-800">
                  <span>Toklu ({activeAnimals.filter(a => a.category === 'toklu').length} Baş)</span>
                  <span className="font-mono text-white">{formatCurrency(yearlingsValue)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Kuzu ({activeAnimals.filter(a => a.category === 'kuzu').length} Baş)</span>
                  <span className="font-mono text-white">{formatCurrency(lambsValue)}</span>
                </div>
              </div>
            </div>

            {/* Demirbaş Ekipman Varlığı */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-bold uppercase">2. Depo & Demirbaş Ekipmanları</span>
                <span className="text-xs text-amber-400 font-black">{formatCurrency(totalEquipmentValue)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-stone-300">
                {equipments.slice(0, 4).map(eq => (
                  <div key={eq.id} className="flex justify-between py-1 border-b border-stone-800 truncate">
                    <span className="truncate pr-2">{eq.name}</span>
                    <span className="font-mono text-white shrink-0">{formatCurrency(eq.estimatedValueTL)}</span>
                  </div>
                ))}
                {equipments.length > 4 && (
                  <div className="text-[11px] text-stone-500 italic text-right pt-1">
                    ve diğer {equipments.length - 4} kalem ekipman...
                  </div>
                )}
              </div>
            </div>

            {/* Hissedar Başına Net Özkaynak Dağılımı */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs text-stone-400 font-bold uppercase">3. Hissedar Başına Varlık Değeri</span>
              <div className="space-y-2 text-xs">
                {partners.map(p => {
                  const partnerAsset = (grandTotalFarmAsset * p.sharePercent) / 100;
                  return (
                    <div key={p.id} className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-indigo-400">%{p.sharePercent} Hisse</div>
                      </div>
                      <div className="font-mono font-black text-purple-300 text-sm">
                        {formatCurrency(partnerAsset)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YENİ GELİR / GİDER MODALI (YEM ENTEGRASYONLU - REQUIREMENT 2) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Yeni Finans Kaydı</h3>

            <form onSubmit={handleSaveRecord} className="space-y-4 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecordType('gider');
                    setCategory('yem');
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-all ${
                    recordType === 'gider' ? 'bg-rose-600 text-white border-rose-500 shadow-md' : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  - İşletme Gideri
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecordType('gelir');
                    setCategory('kuzu_satisi');
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold border transition-all ${
                    recordType === 'gelir' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  + Çiftlik Geliri
                </button>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Kategori*</label>
                {recordType === 'gider' ? (
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  >
                    <option value="yem">🌾 Yem Alımı (Yonca, Saman, Silaj, Konsantre)</option>
                    <option value="veteriner_ilac">💊 Veteriner & İlaç & Aşı</option>
                    <option value="iscilik">👷 Çoban & Personel Maaşları</option>
                    <option value="enerji_yakit">⚡ Elektrik, Su, Mazot</option>
                    <option value="bakim_onarim">🔧 Ağıl ve Suluk Bakım-Onarım</option>
                    <option value="diger_gider">📦 Diğer Genel Giderler</option>
                  </select>
                ) : (
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                  >
                    <option value="kuzu_satisi">🐑 Kuzu Satışı (Kasaplık / Besi)</option>
                    <option value="damizlik_satisi">🐏 Damızlık Satışı (Koç / Anaç)</option>
                    <option value="sut_satisi">🥛 Koyun Sütü Satışı</option>
                    <option value="yapagi_yun">🧶 Yapağı / Yün Satışı</option>
                    <option value="gubre_satisi">🌱 Koyun Gübresi Satışı</option>
                    <option value="destekleme_tesvik">🏛️ Tarım Bakanlığı Destekleme / Teşvik</option>
                    <option value="diger_gelir">💰 Diğer Gelirler</option>
                  </select>
                )}
              </div>

              {/* YEM ALIMI MODÜLLER ARASI ENTEGRASYON PANELİ (REQUIREMENT 2) */}
              {recordType === 'gider' && category === 'yem' && (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Wheat className="w-4 h-4 text-amber-400" />
                      <span>Yem Ambarı & Stok Entegrasyonu</span>
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-300">
                      <input
                        type="checkbox"
                        checked={autoAddToFeedStock}
                        onChange={e => setAutoAddToFeedStock(e.target.checked)}
                        className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-0"
                      />
                      <span>Ambara Otomatik Ekle</span>
                    </label>
                  </div>

                  {autoAddToFeedStock && (
                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <label className="text-stone-300 font-semibold block mb-1">Ambardaki Yem Kalemi:</label>
                        <select
                          value={selectedFeedId}
                          onChange={e => setSelectedFeedId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
                        >
                          {feeds.map(f => (
                            <option key={f.id} value={f.id}>
                              {f.name} (Mevcut: {f.stockKg} kg - Fiyat: {f.unitCost} TL/kg)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-stone-300 font-semibold block mb-1">Alınan Miktar (kg):</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={feedQuantityKg}
                            onChange={e => handleFeedQtyChange(e.target.value)}
                            placeholder="500"
                            className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-stone-300 font-semibold block mb-1">Birim Fiyat (TL/kg):</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.05"
                            value={feedUnitPrice}
                            onChange={e => handleFeedPriceChange(e.target.value)}
                            placeholder="10.5"
                            className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-amber-400/90 italic">
                        💡 Bu işlem onaylandığında ambardaki {feedQuantityKg} kg yem stoku artırılacak ve birim maliyeti güncellenecektir.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-white block mb-1">Toplam Tutar (TL)*</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="Örn: 15000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white text-sm font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-white block mb-1">Tarih*</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-white block mb-1">Açıklama / Fatura Detayı*</label>
                <input
                  type="text"
                  required
                  placeholder="Detay veya fatura no..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FİNANSAL KAYIT DÜZENLEME MODALI */}
      {editingRecord && (
        <EditFinanceModal
          isOpen={true}
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(updated) => {
            if (onUpdateFinanceRecord) {
              onUpdateFinanceRecord(updated);
            }
            setEditingRecord(null);
          }}
        />
      )}

      {/* ORTAK EKLEME / DÜZENLEME MODALI (REQUIREMENT 1) */}
      {isPartnerModalOpen && (
        <PartnerModal
          isOpen={true}
          partner={editingPartner}
          totalExistingShare={totalExistingShare}
          onClose={() => {
            setIsPartnerModalOpen(false);
            setEditingPartner(null);
          }}
          onSave={(p) => {
            if (editingPartner) {
              onUpdatePartner(p);
            } else {
              onAddPartner(p);
            }
            setIsPartnerModalOpen(false);
            setEditingPartner(null);
          }}
        />
      )}

      {/* DEMİRBAŞ EKLEME / DÜZENLEME MODALI (REQUIREMENT 4) */}
      {isEquipmentModalOpen && (
        <EquipmentModal
          isOpen={true}
          equipment={editingEquipment}
          onClose={() => {
            setIsEquipmentModalOpen(false);
            setEditingEquipment(null);
          }}
          onSave={(eq) => {
            if (editingEquipment) {
              onUpdateEquipment(eq);
            } else {
              onAddEquipment(eq);
            }
            setIsEquipmentModalOpen(false);
            setEditingEquipment(null);
          }}
        />
      )}
    </div>
  );
};
