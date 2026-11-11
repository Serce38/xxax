import React, { useState } from 'react';
import { FeedItem, FeedWasteReason, FeedWasteRecord } from '../../types/farm';
import { AlertTriangle, Flame, Save, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface FeedWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: FeedItem[];
  onSave: (waste: FeedWasteRecord) => void;
}

const REASON_OPTIONS: { key: FeedWasteReason; label: string }[] = [
  { key: 'bozulma_kuf', label: 'Bozulma & Küflenme (Nem, Islaklık)' },
  { key: 'dokulme_israf', label: 'Dökülme & Dağılma (Yemlik dışı zayiat)' },
  { key: 'kemirgen_hasari', label: 'Kemirgen & Kuş / Haşere Hasarı' },
  { key: 'nem_rutubet', label: 'Depo / Ambar İçi Rutubet & Çürüme' },
  { key: 'diger', label: 'Diğer Beklenmedik Fire Kaybı' }
];

export const FeedWasteModal: React.FC<FeedWasteModalProps> = ({
  isOpen,
  onClose,
  feeds,
  onSave
}) => {
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feeds[0]?.id || '');
  const [amountKg, setAmountKg] = useState<string>('50');
  const [reason, setReason] = useState<FeedWasteReason>('dokulme_israf');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const selectedFeed = feeds.find(f => f.id === selectedFeedId) || feeds[0];
  const parsedAmount = parseFloat(amountKg) || 0;
  const calculatedCost = selectedFeed ? parsedAmount * selectedFeed.unitCost : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeed) {
      alert('Lütfen zayi olan yemi seçiniz.');
      return;
    }

    if (parsedAmount <= 0) {
      alert('Zayi miktarı sıfırdan büyük bir sayı olmalıdır.');
      return;
    }

    if (parsedAmount > selectedFeed.stockKg) {
      alert(`Girilen zayi miktarı (${parsedAmount} kg), ambardaki mevcut stoktan (${selectedFeed.stockKg} kg) büyük olamaz.`);
      return;
    }

    const reasonObj = REASON_OPTIONS.find(r => r.key === reason);

    const wasteRecord: FeedWasteRecord = {
      id: `waste-${Date.now()}`,
      feedId: selectedFeed.id,
      feedName: selectedFeed.name,
      amountKg: parsedAmount,
      reason,
      reasonLabel: reasonObj ? reasonObj.label : 'Zayiat',
      costTL: calculatedCost,
      date,
      notes: notes.trim() || undefined
    };

    onSave(wasteRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Zayi / Fire Yem Girişi</h3>
              <p className="text-xs text-stone-400">Dökülen, bozulan veya telef olan yem stok düşüşü</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-stone-300">
          <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Bu işlem seçilen yemin stok miktarından otomatik olarak düşülecek ve maliyeti fire olarak kaydedilecektir.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-white block mb-1">Zayi Olan Yem Türü*</label>
              <select
                value={selectedFeedId}
                onChange={e => setSelectedFeedId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-rose-500 focus:outline-none"
              >
                {feeds.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Mevcut Stok: {f.stockKg} kg - Birim: {f.unitCost} TL/kg)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Zayi / Fire Miktarı (kg)*</label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amountKg}
                onChange={e => setAmountKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono font-bold focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Fire Tarihi*</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-white block mb-1">Zayi Nedeni / Sebebi*</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as FeedWasteReason)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-rose-500 focus:outline-none"
              >
                {REASON_OPTIONS.map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hesaplanan Maliyet Kartı */}
          <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-400 block">Hesaplanan Fire Zararı:</span>
              <span className="text-lg font-black text-rose-400">
                {formatCurrency(calculatedCost)}
              </span>
            </div>
            <div className="text-right text-[11px] text-stone-400 font-mono">
              <div>Birim Fiyat: {selectedFeed?.unitCost || 0} TL/kg</div>
              <div>Miktar: {parsedAmount} kg</div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-white block mb-1">Açıklama & Not</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Örn: Yağış sonrası ambar tavanındaki sızıntı sebebiyle 3 torba yem ıslandı."
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-rose-500 focus:outline-none"
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Fireyi Kaydet ve Stoktan Düş</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
