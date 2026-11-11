import React, { useState } from 'react';
import { EquipmentCategory, EquipmentCondition, FarmEquipment } from '../../types/farm';
import { Box, Save, Wrench, X } from 'lucide-react';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment?: FarmEquipment | null;
  onSave: (eq: FarmEquipment) => void;
}

const CATEGORY_OPTIONS: { key: EquipmentCategory; label: string }[] = [
  { key: 'makine_ekipman', label: 'Makine & Ağır Ekipman (Römork, Traktör, Kantar)' },
  { key: 'barinak_cit', label: 'Barınak & Çit Sistemleri (Padok teli, Kapılar, Gölgelik)' },
  { key: 'suluk_yemlik', label: 'Suluk & Yemlik Sistemleri' },
  { key: 'sagim_sut', label: 'Sağım & Süt İşleme Ekipmanları' },
  { key: 'guvenlik_enerji', label: 'Jeneratör, Güneş Paneli & Güvenlik' },
  { key: 'diger', label: 'Diğer Demirbaş & El Aletleri' }
];

const CONDITION_OPTIONS: { key: EquipmentCondition; label: string }[] = [
  { key: 'yeni', label: 'Sıfır / Yeni Ayarında' },
  { key: 'iyi', label: 'İyi Durumda (Faal)' },
  { key: 'bakim_gerekli', label: 'Periyodik Bakım / Onarım Gerekli' },
  { key: 'arizali', label: 'Arızalı / Gayri Faal' }
];

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onSave
}) => {
  const [name, setName] = useState(equipment?.name || '');
  const [category, setCategory] = useState<EquipmentCategory>(equipment?.category || 'makine_ekipman');
  const [quantity, setQuantity] = useState(equipment?.quantity?.toString() || '1');
  const [purchaseDate, setPurchaseDate] = useState(equipment?.purchaseDate || new Date().toISOString().split('T')[0]);
  const [estimatedValueTL, setEstimatedValueTL] = useState(equipment?.estimatedValueTL?.toString() || '');
  const [condition, setCondition] = useState<EquipmentCondition>(equipment?.condition || 'iyi');
  const [serialOrTagNo, setSerialOrTagNo] = useState(equipment?.serialOrTagNo || '');
  const [notes, setNotes] = useState(equipment?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Demirbaş ekipman adı boş bırakılamaz.');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Adet 1 veya daha büyük bir tam sayı olmalıdır.');
      return;
    }

    const val = parseFloat(estimatedValueTL);
    if (isNaN(val) || val < 0) {
      alert('Tahmini rayiç değeri sıfır veya daha büyük bir sayı olmalıdır.');
      return;
    }

    const catObj = CATEGORY_OPTIONS.find(c => c.key === category);
    const condObj = CONDITION_OPTIONS.find(c => c.key === condition);

    const updated: FarmEquipment = {
      id: equipment?.id || `eq-${Date.now()}`,
      name: name.trim(),
      category,
      categoryLabel: catObj ? catObj.label.split(' (')[0] : 'Ekipman',
      quantity: qty,
      purchaseDate,
      estimatedValueTL: val,
      condition,
      conditionLabel: condObj ? condObj.label : 'İyi',
      serialOrTagNo: serialOrTagNo.trim() || undefined,
      notes: notes.trim() || undefined
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {equipment ? 'Demirbaş Kaydını Düzenle' : 'Yeni Demirbaş & Ekipman Ekle'}
              </h3>
              <p className="text-xs text-stone-400">Çiftlik makine, depo malzemesi ve varlık kaydı</p>
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
              <label className="font-semibold text-white block mb-1">Demirbaş / Ekipman Adı*</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Örn: Otomatik Kuzu Emzirme Makinesi"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-white block mb-1">Kategori*</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as EquipmentCategory)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-amber-500 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Adet / Miktar*</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-emerald-400 block mb-1">Toplam Rayiç Değer (TL)*</label>
              <input
                type="number"
                step="500"
                min="0"
                required
                value={estimatedValueTL}
                onChange={e => setEstimatedValueTL(e.target.value)}
                placeholder="Örn: 48000"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Alış / Envanter Tarihi*</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Kullanım Durumu*</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as EquipmentCondition)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-amber-500 focus:outline-none"
              >
                {CONDITION_OPTIONS.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-white block mb-1">Seri No / Plaka / Demirbaş Kodu</label>
              <input
                type="text"
                value={serialOrTagNo}
                onChange={e => setSerialOrTagNo(e.target.value)}
                placeholder="Örn: DMB-2024-009 (Opsiyonel)"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-white block mb-1">Bakım & Garanti Notları</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Örn: Yıllık yetkili servis bakımı Ağustos ayında yapılacak"
              className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-amber-500 focus:outline-none"
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
              <span>{equipment ? 'Değişiklikleri Kaydet' : 'Demirbaşı Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
