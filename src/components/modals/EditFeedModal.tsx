import React, { useState } from 'react';
import { FeedItem, FeedType } from '../../types/farm';
import { Edit3, Save, X, Wheat } from 'lucide-react';

interface EditFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  feed: FeedItem;
  onSave: (updatedFeed: FeedItem) => void;
}

export const EditFeedModal: React.FC<EditFeedModalProps> = ({
  isOpen,
  onClose,
  feed,
  onSave
}) => {
  const [name, setName] = useState(feed.name);
  const [type, setType] = useState<FeedType>(feed.type);
  const [stockKg, setStockKg] = useState(feed.stockKg.toString());
  const [minThresholdKg, setMinThresholdKg] = useState(feed.minThresholdKg.toString());
  const [unitCost, setUnitCost] = useState(feed.unitCost.toString());
  const [dryMatterPct, setDryMatterPct] = useState(feed.dryMatterPct.toString());
  const [crudeProteinPct, setCrudeProteinPct] = useState(feed.crudeProteinPct.toString());
  const [metabolicEnergy, setMetabolicEnergy] = useState(feed.metabolicEnergy.toString());
  const [unit, setUnit] = useState<'kg' | 'balya' | 'torba'>(feed.unit || 'kg');
  const [notes, setNotes] = useState(feed.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Yem adı boş bırakılamaz.');
      return;
    }

    const parsedStock = parseFloat(stockKg);
    const parsedThreshold = parseFloat(minThresholdKg);
    const parsedCost = parseFloat(unitCost);

    if (isNaN(parsedStock) || parsedStock < 0) {
      alert('Stok miktarı 0 veya daha büyük bir sayı olmalıdır.');
      return;
    }

    const updated: FeedItem = {
      ...feed,
      name: name.trim(),
      type,
      stockKg: parsedStock,
      minThresholdKg: Math.max(0, isNaN(parsedThreshold) ? 0 : parsedThreshold),
      unitCost: Math.max(0, isNaN(parsedCost) ? 0 : parsedCost),
      dryMatterPct: Math.min(100, Math.max(0, parseFloat(dryMatterPct) || 88)),
      crudeProteinPct: Math.min(100, Math.max(0, parseFloat(crudeProteinPct) || 12)),
      metabolicEnergy: Math.max(0, parseFloat(metabolicEnergy) || 2.0),
      unit,
      notes: notes.trim() || undefined
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yem Stok Kaydı Düzenle</h3>
              <p className="text-xs text-stone-400">{feed.name} stok ve besin değeri parametrelerini güncelle</p>
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
              <label className="font-semibold text-white block mb-1">Yem Adı / Ticari İsmi*</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Yem Türü*</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as FeedType)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                <option value="kaba">Kaba Yem (Saman, Yonca, Silaj)</option>
                <option value="konsantre">Konsantre Yem (Fabrika / Arpa / Mısır)</option>
                <option value="mineral">Mineral / Premiks / Yalama Taşı</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Birim</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as 'kg' | 'balya' | 'torba')}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="balya">Balya</option>
                <option value="torba">Çuval / Torba</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Mevcut Stok Miktarı (kg)*</label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={stockKg}
                onChange={e => setStockKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-amber-300 block mb-1">Kritik Stok Uyarısı (kg)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={minThresholdKg}
                onChange={e => setMinThresholdKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-emerald-400 block mb-1">Birim Maliyet (TL / kg)*</label>
              <input
                type="number"
                step="0.05"
                min="0"
                required
                value={unitCost}
                onChange={e => setUnitCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Kuru Madde (KM %)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={dryMatterPct}
                onChange={e => setDryMatterPct(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Ham Protein (HP %)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={crudeProteinPct}
                onChange={e => setCrudeProteinPct(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Metabolik Enerji (ME Mcal/kg)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={metabolicEnergy}
                onChange={e => setMetabolicEnergy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-white block mb-1">Tedarikçi & Kalite Notları</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Örn: 2. biçim yonca, Konya Ovası temini"
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Yemi Güncelle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
