import React, { useState } from 'react';
import { FinanceRecord, FinanceType, ExpenseCategory, IncomeCategory } from '../../types/farm';
import { Edit3, Save, X, DollarSign } from 'lucide-react';

interface EditFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FinanceRecord;
  onSave: (updatedRecord: FinanceRecord) => void;
}

const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string }[] = [
  { key: 'yem', label: 'Yem & Besleme Gideri' },
  { key: 'veteriner_ilac', label: 'Veteriner, İlaç & Aşı' },
  { key: 'iscilik', label: 'İşçilik & Personel' },
  { key: 'enerji_yakit', label: 'Elektrik, Su & Mazot' },
  { key: 'bakim_onarim', label: 'Ağıl Bakım & Onarım' },
  { key: 'amortisman', label: 'Amortisman / Ekipman' },
  { key: 'diger_gider', label: 'Diğer Genel Giderler' }
];

const INCOME_CATEGORIES: { key: IncomeCategory; label: string }[] = [
  { key: 'kuzu_satisi', label: 'Kuzu Satışı (Kasaplık/Besi)' },
  { key: 'damizlik_satisi', label: 'Damızlık Satışı (Koç/Koyun)' },
  { key: 'yapagi_yun', label: 'Yapağı / Kıl Satışı' },
  { key: 'sut_satisi', label: 'Süt & Süt Ürünleri' },
  { key: 'gubre_satisi', label: 'Çiftlik Gübresi Satışı' },
  { key: 'destekleme_tesvik', label: 'Tarımsal Destek / Teşvik' },
  { key: 'diger_gelir', label: 'Diğer Gelirler' }
];

export const EditFinanceModal: React.FC<EditFinanceModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave
}) => {
  const [type, setType] = useState<FinanceType>(record.type);
  const [category, setCategory] = useState<string>(record.category);
  const [amount, setAmount] = useState<string>(record.amount.toString());
  const [date, setDate] = useState<string>(record.date);
  const [description, setDescription] = useState<string>(record.description);
  const [relatedAnimalTag, setRelatedAnimalTag] = useState<string>(record.relatedAnimalTag || '');
  const [paymentStatus, setPaymentStatus] = useState<'odendi' | 'bekliyor'>(record.paymentStatus);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Tutar sıfırdan büyük bir sayı olmalıdır.');
      return;
    }

    if (!description.trim()) {
      alert('Açıklama alanı boş bırakılamaz.');
      return;
    }

    // Determine category label
    let categoryLabel = '';
    if (type === 'gider') {
      const match = EXPENSE_CATEGORIES.find(c => c.key === category);
      categoryLabel = match ? match.label : 'Gider';
    } else {
      const match = INCOME_CATEGORIES.find(c => c.key === category);
      categoryLabel = match ? match.label : 'Gelir';
    }

    const updated: FinanceRecord = {
      ...record,
      type,
      category: category as any,
      categoryLabel,
      amount: parsedAmount,
      date,
      description: description.trim(),
      relatedAnimalTag: relatedAnimalTag.trim() || undefined,
      paymentStatus
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
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              type === 'gelir' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Finansal Kayıt Düzenle</h3>
              <p className="text-xs text-stone-400">İşlem kalemini, tutarını ve ödeme durumunu güncelle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-stone-300">
          <div className="grid grid-cols-2 gap-3 p-1 bg-stone-950 rounded-2xl border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setType('gider');
                setCategory('yem');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-colors ${
                type === 'gider'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Gider Kaydı
            </button>
            <button
              type="button"
              onClick={() => {
                setType('gelir');
                setCategory('kuzu_satisi');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-colors ${
                type === 'gelir'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Gelir Kaydı
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-white block mb-1">Kategori*</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                {type === 'gider'
                  ? EXPENSE_CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))
                  : INCOME_CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-emerald-400 block mb-1">Tutar (TL)*</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono text-base font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Tarih*</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">İlişkili Hayvan Küpe No</label>
              <input
                type="text"
                value={relatedAnimalTag}
                onChange={e => setRelatedAnimalTag(e.target.value)}
                placeholder="Örn: TR 16 0001 (Opsiyonel)"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Ödeme Durumu*</label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as 'odendi' | 'bekliyor')}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                <option value="odendi">Ödendi / Tahsil Edildi</option>
                <option value="bekliyor">Bekliyor / Vadeli / Borç</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-white block mb-1">Açıklama*</label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Örn: 20 çuval besi yemi faturası"
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
              className={`px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md text-white ${
                type === 'gelir' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
