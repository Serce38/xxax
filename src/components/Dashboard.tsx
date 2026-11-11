import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Heart, 
  Scale, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Wheat, 
  Zap 
} from 'lucide-react';
import { Animal, FarmAlert, FeedItem, FinanceRecord, HealthRecord, PregnancyRecord } from '../types/farm';
import { calculateFinancialSummary, formatCurrency, getCategoryMeta, getPregnancyProgress } from '../utils/calculations';
import { ActiveTab } from './Navbar';

interface DashboardProps {
  animals: Animal[];
  pregnancies: PregnancyRecord[];
  healthRecords: HealthRecord[];
  feeds: FeedItem[];
  finances: FinanceRecord[];
  alerts: FarmAlert[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  animals,
  pregnancies,
  healthRecords,
  feeds,
  finances,
  alerts,
  setActiveTab,
  onOpenQuickAdd,
  onSelectAnimal
}) => {
  // Sürü İstatistikleri
  const activeAnimals = animals.filter(a => a.status === 'aktif');
  const ewesCount = activeAnimals.filter(a => a.category === 'anac_koyun').length;
  const ramsCount = activeAnimals.filter(a => a.category === 'koc').length;
  const yearlingsCount = activeAnimals.filter(a => a.category === 'toklu').length;
  const lambsCount = activeAnimals.filter(a => a.category === 'kuzu').length;

  // Gebelik İstatistikleri
  const activePregnancies = pregnancies.filter(p => p.status === 'beklemede');
  const birthsNext7Days = activePregnancies.filter(p => {
    const { daysRemaining } = getPregnancyProgress(p.matingDate, p.expectedDueDate);
    return daysRemaining <= 7 && daysRemaining >= 0;
  });

  // Karantina / Arınma Süresindeki Hayvanlar
  const quarantinedAnimals = activeAnimals.filter(a => a.quarantine?.active);

  // Kritik Yemler
  const lowFeeds = feeds.filter(f => f.stockKg <= f.minThresholdKg);

  // Finans Özeti
  const finSummary = calculateFinancialSummary(finances, activeAnimals.length, lambsCount);

  // Irk Dağılımı
  const breedCounts: Record<string, number> = {};
  for (const a of activeAnimals) {
    breedCounts[a.breed] = (breedCounts[a.breed] || 0) + 1;
  }

  // Acil Uyarılar
  const urgentAlerts = alerts.filter(a => a.level === 'acil' || a.level === 'uyari').slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-stone-800 to-stone-900 rounded-2xl p-6 text-white shadow-xl border border-stone-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Sürü Operasyon Paneli
            </span>
            <span className="text-xs text-stone-300">
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Küçükbaş Sürü & Çiftlik Durumu
          </h1>
          <p className="text-sm text-stone-300 mt-1 max-w-xl">
            Aktif {activeAnimals.length} baş hayvan, {activePregnancies.length} gebe anaç ve 150 günlük reprodüksiyon döngüsü anlık izleniyor.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenQuickAdd}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <span>+ Hızlı Kayıt</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Toplam Sürü */}
        <div 
          onClick={() => setActiveTab('animals')}
          className="bg-stone-900 border border-stone-800 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Aktif Sürü Varlığı</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{activeAnimals.length}</span>
            <span className="text-xs text-stone-400">Baş</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <span>{ewesCount} Anaç • {ramsCount} Koç</span>
            <span>{yearlingsCount} Toklu • {lambsCount} Kuzu</span>
          </div>
        </div>

        {/* Card 2: Gebelik & Yaklaşan Doğumlar */}
        <div 
          onClick={() => setActiveTab('reproduction')}
          className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Gebe Anaçlar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{activePregnancies.length}</span>
            <span className="text-xs text-amber-400 font-semibold">
              ({birthsNext7Days.length} bu hafta)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <span>150 Günlük Döngü</span>
            <span className="text-amber-400 font-medium">Doğum Takvimi →</span>
          </div>
        </div>

        {/* Card 3: Sağlık & Karantina / Arınma Süresi */}
        <div 
          onClick={() => setActiveTab('health')}
          className="bg-stone-900 border border-stone-800 hover:border-rose-500/50 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Arınma (Karantina)</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform ${
              quarantinedAnimals.length > 0 
                ? 'bg-rose-500/20 text-rose-400 group-hover:scale-110 animate-pulse' 
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{quarantinedAnimals.length}</span>
            <span className="text-xs text-stone-400">Hayvanda İlaç Kilidi</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            {quarantinedAnimals.length > 0 ? (
              <span className="text-rose-400 font-semibold">Et/Süt Kesim Yasağı!</span>
            ) : (
              <span className="text-emerald-400">Tüm sürü arınmış</span>
            )}
            <span className="text-stone-500">Aşılar →</span>
          </div>
        </div>

        {/* Card 4: Finans / Kâr-Zarar */}
        <div 
          onClick={() => setActiveTab('finance')}
          className="bg-stone-900 border border-stone-800 hover:border-sky-500/50 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Dönemsel Net Kâr</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl sm:text-2xl font-black ${finSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(finSummary.netProfit)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Başa baş: {finSummary.breakEvenLambsNeeded} Kuzu</span>
            <span className="text-sky-400 font-medium">Finans →</span>
          </div>
        </div>
      </div>

      {/* Urgent Alarms & Quick Barn Notice */}
      {urgentAlerts.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-white">Öncelikli Akıllı Çiftlik Bildirimleri</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                {alerts.length} Bildirim
              </span>
            </div>
            <button
              onClick={() => setActiveTab('reproduction')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  alert.level === 'acil'
                    ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                    : 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                  alert.level === 'acil' ? 'bg-rose-900/50 text-rose-400' : 'bg-amber-900/50 text-amber-400'
                }`}>
                  {alert.type === 'dogum' ? (
                    <Heart className="w-4 h-4" />
                  ) : alert.type === 'karantina' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : alert.type === 'yem' ? (
                    <Wheat className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{alert.title}</h4>
                    {alert.remainingDays !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        alert.remainingDays <= 0 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {alert.remainingDays === 0 ? 'Bugün!' : alert.remainingDays < 0 ? `${Math.abs(alert.remainingDays)} Gün Gecikme` : `${alert.remainingDays} Gün`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 mt-1 line-clamp-2">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Births Radar & Flock Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 150-Day Gestation Radar / Upcoming Births */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">Doğum Yaklaşan Gebe Koyunlar</h3>
                <p className="text-xs text-stone-400">150 Günlük Gebelik Hesaplayıcısı ve Doğumhane Hazırlığı</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('reproduction')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Üreme Modülü</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activePregnancies.slice(0, 4).map(preg => {
              const { dayOfPregnancy, daysRemaining, progressPercent, isOverdue } = getPregnancyProgress(
                preg.matingDate, 
                preg.expectedDueDate
              );
              const ewe = animals.find(a => a.earTag === preg.eweTag);

              return (
                <div 
                  key={preg.id}
                  onClick={() => ewe && onSelectAnimal(ewe)}
                  className="p-3.5 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{preg.eweTag}</span>
                      {ewe?.name && <span className="text-stone-400 font-medium">({ewe.name})</span>}
                      <span className="px-2 py-0.5 rounded-md bg-stone-700 text-stone-300 text-[10px]">
                        {ewe?.breed || 'Merinos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400">
                        {preg.expectedLambCount ? `${preg.expectedLambCount} Kuzu Bekleniyor` : 'Ultrason Pozitif'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isOverdue 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : daysRemaining <= 3 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {daysRemaining <= 0 ? 'Bugün / Gecikti' : `${daysRemaining} Gün Kaldı`}
                      </span>
                    </div>
                  </div>

                  {/* Pregnancy Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>{dayOfPregnancy}. Gebelik Günü</span>
                      <span>Tahmini Doğum: {preg.expectedDueDate}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-700 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          progressPercent >= 98 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-stone-800/40 rounded-xl text-xs text-stone-400 flex items-center justify-between">
            <span>💡 <strong>Doğum İpucu:</strong> Gebeliğin 145. gününden itibaren koyunları dezenfekte edilmiş temiz altlıklı bireysel doğum bölmelerine ayırın.</span>
            <button
              onClick={onOpenQuickAdd}
              className="text-emerald-400 font-semibold hover:underline shrink-0 ml-2"
            >
              + Doğum Kaydet
            </button>
          </div>
        </div>

        {/* Right 1 Col: Sürü Dağılımı & Padok Durumu */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Sürü Kompozisyonu</h3>
            <span className="text-xs text-stone-400">Irk ve Kategori</span>
          </div>

          {/* Kategori Dağılımı Çubukları */}
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Anaç Koyun</span>
                </span>
                <span className="font-bold text-white">{ewesCount} Baş ({activeAnimals.length ? Math.round((ewesCount / activeAnimals.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeAnimals.length ? (ewesCount / activeAnimals.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Damızlık Koç</span>
                </span>
                <span className="font-bold text-white">{ramsCount} Baş ({activeAnimals.length ? Math.round((ramsCount / activeAnimals.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeAnimals.length ? (ramsCount / activeAnimals.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Toklu (Genç Damızlık)</span>
                </span>
                <span className="font-bold text-white">{yearlingsCount} Baş ({activeAnimals.length ? Math.round((yearlingsCount / activeAnimals.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${activeAnimals.length ? (yearlingsCount / activeAnimals.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Kuzular</span>
                </span>
                <span className="font-bold text-white">{lambsCount} Baş ({activeAnimals.length ? Math.round((lambsCount / activeAnimals.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${activeAnimals.length ? (lambsCount / activeAnimals.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Irk Dağılımı Listesi */}
          <div className="pt-3 border-t border-stone-800">
            <h4 className="text-xs font-semibold text-stone-400 mb-2">Çiftlikteki Irklar</h4>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(breedCounts).map(([breed, count]) => (
                <span 
                  key={breed} 
                  className="px-2.5 py-1 rounded-lg bg-stone-800 text-xs font-medium text-stone-200 border border-stone-700 flex items-center gap-1.5"
                >
                  <span>{breed}</span>
                  <span className="text-emerald-400 font-bold">{count}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Yem Stoku Mini Alarmı */}
          <div className="pt-3 border-t border-stone-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-400 font-medium">Yem Ambarı Durumu</span>
              <button 
                onClick={() => setActiveTab('feeds')}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Yemler →
              </button>
            </div>
            {lowFeeds.length > 0 ? (
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{lowFeeds.length} çeşit yem kritik eşiğin altında! (Örn: {lowFeeds[0].name})</span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tüm yem stokları yeterli seviyede.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
