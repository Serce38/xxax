import React, { useState } from 'react';
import { HealthRecord, HealthRecordType } from '../../types/farm';
import { Edit3, Save, X } from 'lucide-react';

interface EditHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HealthRecord;
  onSave: (updatedRecord: HealthRecord) => void;
}

export const EditHealthModal: React.FC<EditHealthModalProps> = ({
  isOpen,
  onClose,
  record,
  onSave
}) => {
  const [title, setTitle] = useState(record.title);
  const [medicineName, setMedicineName] = useState(record.medicineName);
  const [type, setType] = useState<HealthRecordType>(record.type);
  const [dosage, setDosage] = useState(record.dosage);
  const [applicationDate, setApplicationDate] = useState(record.applicationDate);
  const [nextScheduledDate, setNextScheduledDate] = useState(record.nextScheduledDate || '');
  const [meatWithdrawalDays, setMeatWithdrawalDays] = useState(record.meatWithdrawalDays.toString());
  const [milkWithdrawalDays, setMilkWithdrawalDays] = useState(record.milkWithdrawalDays.toString());
  const [vetName, setVetName] = useState(record.vetName || '');
  const [cost, setCost] = useState(record.cost.toString());
  const [notes, setNotes] = useState(record.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !medicineName.trim()) {
      alert('Uygulama başlığı ve ilaç adı boş bırakılamaz.');
      return;
    }

    const meatDays = Math.max(0, parseInt(meatWithdrawalDays) || 0);
    const milkDays = Math.max(0, parseInt(milkWithdrawalDays) || 0);
    const parsedCost = Math.max(0, parseFloat(cost) || 0);

    const appTime = new Date(applicationDate).getTime();
    const meatEndDate = meatDays > 0 ? new Date(appTime + meatDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined;
    const milkEndDate = milkDays > 0 ? new Date(appTime + milkDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined;

    const updated: HealthRecord = {
      ...record,
      title: title.trim(),
      medicineName: medicineName.trim(),
      type,
      dosage: dosage.trim(),
      applicationDate,
      nextScheduledDate: nextScheduledDate || undefined,
      meatWithdrawalDays: meatDays,
      milkWithdrawalDays: milkDays,
      meatWithdrawalEndDate: meatEndDate,
      milkWithdrawalEndDate: milkEndDate,
      vetName: vetName.trim() || undefined,
      cost: parsedCost,
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
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sağlık / Aşı Kaydı Düzenle</h3>
              <p className="text-xs text-stone-400">{record.title} bilgilerini ve arınma sürelerini güncelle</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-stone-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-white block mb-1">Uygulama / Aşı Başlığı*</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Kullanılan İlaç / Aşı Adı*</label>
              <input
                type="text"
                required
                value={medicineName}
                onChange={e => setMedicineName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Kayıt Türü*</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as HealthRecordType)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                <option value="asi">Karma Aşı</option>
                <option value="ic_parazit">İç Parazit</option>
                <option value="dis_parazit">Dış Parazit</option>
                <option value="tirnak">Tırnak Bakımı</option>
                <option value="tedavi">Bireysel Tedavi / Antibiyotik</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Uygulama Dozajı</label>
              <input
                type="text"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Uygulama Tarihi*</label>
              <input
                type="date"
                required
                value={applicationDate}
                onChange={e => setApplicationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Sonraki Planlanan Tarih</label>
              <input
                type="date"
                value={nextScheduledDate}
                onChange={e => setNextScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-rose-300 block mb-1">Et Arınma Süresi (Gün)</label>
              <input
                type="number"
                min="0"
                value={meatWithdrawalDays}
                onChange={e => setMeatWithdrawalDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-amber-300 block mb-1">Süt Arınma Süresi (Gün)</label>
              <input
                type="number"
                min="0"
                value={milkWithdrawalDays}
                onChange={e => setMilkWithdrawalDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Uygulayan Veteriner / Görevli</label>
              <input
                type="text"
                value={vetName}
                onChange={e => setVetName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Maliyet (TL)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={cost}
                onChange={e => setCost(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-white block mb-1">Notlar / Klinik Gözlem</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Kaydı Güncelle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
