import React from 'react';
import { 
  Calendar, 
  CircleDollarSign, 
  Heart, 
  Plus, 
  ShieldAlert, 
  Sparkles, 
  Syringe, 
  Users, 
  Wheat, 
  X 
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  setActiveTab
}) => {
  if (!isOpen) return null;

  const handleRoute = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-lg font-black text-white">Hızlı Çiftlik İşlemi Seçin</h3>
            <p className="text-xs text-stone-400">Yapmak istediğiniz işlemi tek tıkla başlatın</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleRoute('animals')}
            className="p-4 rounded-2xl bg-stone-800/80 hover:bg-emerald-950/40 border border-stone-700 hover:border-emerald-500 flex flex-col items-start gap-2 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Yeni Hayvan Kaydı</div>
              <div className="text-[11px] text-stone-400">Yeni küpe ve soy kütüğü tanımla</div>
            </div>
          </button>

          <button
            onClick={() => handleRoute('reproduction')}
            className="p-4 rounded-2xl bg-stone-800/80 hover:bg-amber-950/40 border border-stone-700 hover:border-amber-500 flex flex-col items-start gap-2 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Yeni Doğum Kaydet</div>
              <div className="text-[11px] text-stone-400">Otomatik kuzu küpeleme ile</div>
            </div>
          </button>

          <button
            onClick={() => handleRoute('health')}
            className="p-4 rounded-2xl bg-stone-800/80 hover:bg-rose-950/40 border border-stone-700 hover:border-rose-500 flex flex-col items-start gap-2 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Syringe className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Aşı / Tedavi Gir</div>
              <div className="text-[11px] text-stone-400">Et ve süt arınma süresi takibi</div>
            </div>
          </button>

          <button
            onClick={() => handleRoute('finance')}
            className="p-4 rounded-2xl bg-stone-800/80 hover:bg-sky-950/40 border border-stone-700 hover:border-sky-500 flex flex-col items-start gap-2 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Gelir / Gider Girişi</div>
              <div className="text-[11px] text-stone-400">Kuzu satışı veya yem faturası</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
