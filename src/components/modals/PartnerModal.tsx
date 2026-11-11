import React, { useState } from 'react';
import { FarmPartner } from '../../types/farm';
import { Handshake, Save, X, Percent } from 'lucide-react';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner?: FarmPartner | null;
  onSave: (partner: FarmPartner) => void;
  totalExistingShare: number; // mevcut diğer ortakların toplam yüzdesi
}

export const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  partner,
  onSave,
  totalExistingShare
}) => {
  const [name, setName] = useState(partner?.name || '');
  const [phone, setPhone] = useState(partner?.phone || '');
  const [sharePercent, setSharePercent] = useState(partner?.sharePercent?.toString() || '25');
  const [investmentAmount, setInvestmentAmount] = useState(partner?.investmentAmount?.toString() || '');
  const [joinDate, setJoinDate] = useState(partner?.joinDate || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(partner?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Ortak adı ve soyadı boş bırakılamaz.');
      return;
    }

    const share = parseFloat(sharePercent);
    if (isNaN(share) || share <= 0 || share > 100) {
      alert('Ortaklık payı 1 ile 100 arasında bir yüzde olmalıdır.');
      return;
    }

    // Yüzde aşımı kontrolü (mevcut düzenleniyorsa kendi eski payı düşülür)
    const currentShare = partner ? partner.sharePercent : 0;
    const remainingShare = 100 - (totalExistingShare - currentShare);
    if (share > remainingShare) {
      alert(`Girilen ortaklık payı (%${share}), kalan boş payı (%${remainingShare.toFixed(1)}) aşıyor. Toplam ortaklık payı %100'ü geçemez.`);
      return;
    }

    const item: FarmPartner = {
      id: partner?.id || `partner-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      sharePercent: share,
      investmentAmount: investmentAmount ? parseFloat(investmentAmount) : undefined,
      joinDate,
      notes: notes.trim() || undefined
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {partner ? 'Ortak Bilgilerini Düzenle' : 'Yeni Çiftlik Ortağı Ekle'}
              </h3>
              <p className="text-xs text-stone-400">Ortaklık hisse payı ve kâr/zarar paylaşım kaydı</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-stone-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-white block mb-1">Ortak Adı ve Soyadı*</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Örn: Halil İbrahim Yılmaz"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Telefon / İletişim</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Örn: 0544 444 16 16"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-indigo-300 block mb-1">Ortaklık Hissesi (%)*</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  required
                  value={sharePercent}
                  onChange={e => setSharePercent(e.target.value)}
                  placeholder="25"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
                />
                <Percent className="w-4 h-4 text-indigo-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Sermaye / Katkı Payı (TL)</label>
              <input
                type="number"
                step="1000"
                min="0"
                value={investmentAmount}
                onChange={e => setInvestmentAmount(e.target.value)}
                placeholder="Örn: 250000"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Ortaklık Başlangıç Tarihi*</label>
              <input
                type="date"
                required
                value={joinDate}
                onChange={e => setJoinDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-white block mb-1">Notlar & Sorumluluk Alanı</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Örn: Finansman ve pazarlama sorumlusu, aylık kâr dağıtımlı"
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{partner ? 'Güncellemeyi Kaydet' : 'Ortağı Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
