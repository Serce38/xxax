import React, { useState } from 'react';
import { Animal, AnimalBreed, AnimalCategory, AnimalGender, AnimalStatus } from '../../types/farm';
import { PADOKS_LIST } from '../../data/mockData';
import { Edit3, Save, X } from 'lucide-react';

interface EditAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal;
  onSave: (updatedAnimal: Animal) => void;
}

export const EditAnimalModal: React.FC<EditAnimalModalProps> = ({
  isOpen,
  onClose,
  animal,
  onSave
}) => {
  const [earTag, setEarTag] = useState(animal.earTag);
  const [rfid, setRfid] = useState(animal.electronicTag || '');
  const [name, setName] = useState(animal.name || '');
  const [category, setCategory] = useState<AnimalCategory>(animal.category);
  const [gender, setGender] = useState<AnimalGender>(animal.gender);
  const [breed, setBreed] = useState<AnimalBreed>(animal.breed);
  const [birthDate, setBirthDate] = useState(animal.birthDate);
  const [weight, setWeight] = useState(animal.currentWeight.toString());
  const [padok, setPadok] = useState(animal.padok);
  const [status, setStatus] = useState<AnimalStatus>(animal.status);
  const [statusReason, setStatusReason] = useState(animal.statusReason || '');
  const [motherTag, setMotherTag] = useState(animal.motherTag || '');
  const [fatherTag, setFatherTag] = useState(animal.fatherTag || '');
  const [notes, setNotes] = useState(animal.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!earTag.trim()) {
      alert('Küpe numarası boş bırakılamaz.');
      return;
    }

    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      alert('Canlı ağırlık sıfırdan büyük bir sayı olmalıdır.');
      return;
    }

    // Ağırlık değiştiyse geçmişe ekle
    let weightHistory = [...(animal.weightHistory || [])];
    if (parsedWeight !== animal.currentWeight) {
      weightHistory.push({
        date: new Date().toISOString().split('T')[0],
        weight: parsedWeight,
        note: 'Düzenleme güncellemesi'
      });
    }

    const updated: Animal = {
      ...animal,
      earTag: earTag.trim(),
      electronicTag: rfid.trim() || undefined,
      name: name.trim() || undefined,
      category,
      gender,
      breed,
      birthDate,
      currentWeight: parsedWeight,
      weightHistory,
      padok,
      status,
      statusReason: statusReason.trim() || undefined,
      motherTag: motherTag.trim() || undefined,
      fatherTag: fatherTag.trim() || undefined,
      notes: notes.trim() || undefined
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-stone-850 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Hayvan Kaydı Düzenle</h3>
              <p className="text-xs text-stone-400">{animal.earTag} küpeli hayvan bilgilerini güncelle</p>
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
              <label className="font-semibold text-white block mb-1">Kulak Küpe No*</label>
              <input
                type="text"
                required
                value={earTag}
                onChange={e => setEarTag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Elektronik Çip / RFID</label>
              <input
                type="text"
                value={rfid}
                onChange={e => setRfid(e.target.value)}
                placeholder="Örn: 982 000..."
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">İsim / Lakap</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Örn: Kınalı, Kral"
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Kategori*</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as AnimalCategory)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                <option value="anac_koyun">Anaç Koyun</option>
                <option value="koc">Damızlık Koç</option>
                <option value="toklu">Toklu</option>
                <option value="kuzu">Kuzu</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Cinsiyet*</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as AnimalGender)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                <option value="disi">Dişi</option>
                <option value="erkek">Erkek</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Irk*</label>
              <select
                value={breed}
                onChange={e => setBreed(e.target.value as AnimalBreed)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                <option value="Merinos">Merinos</option>
                <option value="Akkaraman">Akkaraman</option>
                <option value="İvesi">İvesi</option>
                <option value="Kıvırcık">Kıvırcık</option>
                <option value="Dorper">Dorper</option>
                <option value="Sakız">Sakız</option>
                <option value="Kangal">Kangal</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Doğum Tarihi*</label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Güncel Ağırlık (kg)*</label>
              <input
                type="number"
                step="0.1"
                required
                min="0.5"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Padok / Bölme*</label>
              <select
                value={padok}
                onChange={e => setPadok(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                {PADOKS_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Yaşam Döngüsü Durumu*</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as AnimalStatus)}
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white"
              >
                <option value="aktif">Aktif Sürüde</option>
                <option value="satildi">Satıldı</option>
                <option value="kesildi">Kesildi</option>
                <option value="oldu">Öldü / Telef</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Anne Küpe No (Soy Kütüğü)</label>
              <input
                type="text"
                value={motherTag}
                onChange={e => setMotherTag(e.target.value)}
                placeholder="TR 16 00..."
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Baba Küpe No (Soy Kütüğü)</label>
              <input
                type="text"
                value={fatherTag}
                onChange={e => setFatherTag(e.target.value)}
                placeholder="TR 16 00..."
                className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-white block mb-1">Notlar / Açıklama</label>
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md"
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
