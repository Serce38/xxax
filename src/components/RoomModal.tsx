import React, { useState } from 'react';
import { Home, KeyRound, Lock, Plus, Share2, Users, X } from 'lucide-react';
import { FarmRoom, User, UserFarmPermission } from '../types/auth';
import { generateRoomNumber } from '../utils/crypto';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  farmRooms: FarmRoom[];
  permissions: UserFarmPermission[];
  onJoinRoom: (room: FarmRoom, perm: UserFarmPermission) => void;
  onCreateRoom: (newRoom: FarmRoom, ownerPerm: UserFarmPermission) => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  farmRooms,
  permissions,
  onJoinRoom,
  onCreateRoom
}) => {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');

  // Odaya Katıl
  const [joinNumber, setJoinNumber] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');

  // Yeni Oda Kur
  const [createName, setCreateName] = useState('');
  const [createNumber, setCreateNumber] = useState(() => generateRoomNumber());
  const [createPassword, setCreatePassword] = useState('');
  const [createError, setCreateError] = useState('');

  if (!isOpen) return null;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    if (!currentUser) {
      setJoinError('Lütfen önce sisteme kullanıcı girişi yapınız.');
      return;
    }

    const room = farmRooms.find(r => r.roomNumber.trim().toUpperCase() === joinNumber.trim().toUpperCase());
    if (!room) {
      setJoinError('Bu oda numarasına sahip bir çiftlik bulunamadı.');
      return;
    }

    // Şifre kontrolü
    if (room.roomPasswordHash !== joinPassword.trim() && room.roomPasswordHint !== joinPassword.trim()) {
      setJoinError('Oda şifresi hatalı! Çiftlik sahibinden doğru şifreyi isteyiniz.');
      return;
    }

    // Zaten katılmış mı?
    const existingPerm = permissions.find(p => p.farmId === room.id && p.userId === currentUser.id);
    if (existingPerm) {
      onJoinRoom(room, existingPerm);
      onClose();
      return;
    }

    // Yeni Katılımcı -> Varsayılan SALT OKUNUR (viewer, canEdit: false)
    const newPerm: UserFarmPermission = {
      id: `perm-${Date.now()}`,
      farmId: room.id,
      userId: currentUser.id,
      username: currentUser.username,
      fullName: currentUser.fullName,
      role: 'viewer',
      canEdit: false, // Çiftlik sahibi yetki verene kadar salt okunur!
      joinedAt: new Date().toISOString().split('T')[0]
    };

    onJoinRoom(room, newPerm);
    onClose();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!currentUser) {
      setCreateError('Lütfen önce kullanıcı girişi yapınız.');
      return;
    }

    if (!createName.trim() || !createPassword.trim()) {
      setCreateError('Lütfen çiftlik adı ve oda şifresini belirleyiniz.');
      return;
    }

    const exists = farmRooms.some(r => r.roomNumber.toUpperCase() === createNumber.trim().toUpperCase());
    if (exists) {
      setCreateError('Bu oda numarası zaten kullanımda. Farklı bir numara belirleyin.');
      return;
    }

    const newRoomId = `farm-${Date.now()}`;
    const newRoom: FarmRoom = {
      id: newRoomId,
      roomNumber: createNumber.trim().toUpperCase(),
      roomPasswordHash: createPassword.trim(),
      roomPasswordHint: createPassword.trim(),
      name: createName.trim(),
      ownerId: currentUser.id,
      ownerUsername: currentUser.username,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Sahip yetkisi
    const ownerPerm: UserFarmPermission = {
      id: `perm-${Date.now()}`,
      farmId: newRoomId,
      userId: currentUser.id,
      username: currentUser.username,
      fullName: currentUser.fullName,
      role: 'owner',
      canEdit: true,
      joinedAt: new Date().toISOString().split('T')[0]
    };

    onCreateRoom(newRoom, ownerPerm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Çiftlik / Oda İşlemleri</h3>
              <p className="text-xs text-stone-400">Oda No ve Şifre ile katılım veya yeni oda kurma</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Seçici */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-1">
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'join'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Odaya Katıl (Join)</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Çiftlik / Oda Kur</span>
          </button>
        </div>

        {/* ODAYA KATIL (JOIN) */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-3.5 text-xs">
            {joinError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 font-medium">
                {joinError}
              </div>
            )}

            <div>
              <label className="font-semibold text-white block mb-1">Oda Numarası (Room No)*</label>
              <input
                type="text"
                required
                placeholder="Örn: CF-1084"
                value={joinNumber}
                onChange={e => setJoinNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono uppercase text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Oda Şifresi*</label>
              <input
                type="password"
                required
                placeholder="Çiftlik sahibinin belirlediği parola"
                value={joinPassword}
                onChange={e => setJoinPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-stone-800/60 text-[11px] text-stone-400 border border-stone-800">
              💡 <strong>Yetki Kuralı:</strong> Odaya katıldığınızda verileri başlangıçta <strong>Salt Okunur (Görüntüleme)</strong> olarak görürsünüz. Düzenleme hakkı için oda sahibinin Yönetim Panelinden size yetki vermesi gerekir.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-colors"
            >
              Çiftlik Odasına Katıl
            </button>

            {/* Hazır Oda Kısayolu */}
            <div className="pt-2 border-t border-stone-800">
              <span className="text-[11px] text-stone-400 block mb-1">Test Çiftliği:</span>
              <div 
                onClick={() => {
                  setJoinNumber('CF-1084');
                  setJoinPassword('koyun123');
                }}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 cursor-pointer text-stone-300 text-xs flex items-center justify-between"
              >
                <span>Bereket Çiftliği (CF-1084)</span>
                <span className="text-amber-400 font-mono font-bold">Doldur →</span>
              </div>
            </div>
          </form>
        )}

        {/* YENİ ODA OLUŞTUR (CREATE) */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
            {createError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 font-medium">
                {createError}
              </div>
            )}

            <div>
              <label className="font-semibold text-white block mb-1">Çiftlik / İşletme Adı*</label>
              <input
                type="text"
                required
                placeholder="Örn: Anadolu Damızlık Çiftliği"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Benzersiz Oda Numarası*</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={createNumber}
                  onChange={e => setCreateNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white font-mono uppercase text-sm focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCreateNumber(generateRoomNumber())}
                  className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold shrink-0"
                >
                  Yenile
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Oda Giriş Şifresi*</label>
              <input
                type="text"
                required
                placeholder="Örn: ciftlik2026"
                value={createPassword}
                onChange={e => setCreatePassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-stone-400 block mt-1">
                Çoban, veteriner veya ortaklarınız bu şifreyle odaya bağlanacaktır.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800 text-emerald-300 text-[11px]">
              👑 Bu odayı kurduğunuzda <strong>Asıl Sahip (Owner)</strong> olursunuz ve odaya katılan diğer kullanıcıların düzenleme yetkilerini (is_editor / can_edit) siz yönetirsiniz.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors"
            >
              Çiftlik Odasını Oluştur
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
