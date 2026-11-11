import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Crown, 
  Eye, 
  KeyRound, 
  Lock, 
  PenTool, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  UserCheck, 
  Users, 
  X 
} from 'lucide-react';
import { FarmRoom, User, UserFarmPermission } from '../types/auth';

interface RoomManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: FarmRoom;
  currentUser: User | null;
  permissions: UserFarmPermission[];
  onToggleCanEdit: (permId: string, canEdit: boolean) => void;
  onRemoveMember: (permId: string) => void;
  onUpdateRoomPassword: (newPassword: string) => void;
}

export const RoomManagementModal: React.FC<RoomManagementModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  currentUser,
  permissions,
  onToggleCanEdit,
  onRemoveMember,
  onUpdateRoomPassword
}) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  if (!isOpen) return null;

  const isOwner = currentUser?.id === currentRoom.ownerId;
  const roomMembers = permissions.filter(p => p.farmId === currentRoom.id);

  const handleCopyCredentials = () => {
    const text = `🐑 Çiftlik Pro Oda Bilgileri\nÇiftlik: ${currentRoom.name}\nOda Numarası: ${currentRoom.roomNumber}\nOda Şifresi: ${currentRoom.roomPasswordHint}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    onUpdateRoomPassword(newPassword.trim());
    setIsEditingPassword(false);
    setNewPassword('');
    alert('Oda giriş şifresi başarıyla güncellendi.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Başlık */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Çiftlik Odası & Yetki Yönetim Paneli</h3>
              <p className="text-xs text-stone-400">
                {currentRoom.name} • Rol Tabanlı Erişim Denetimi (RBAC)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Oda Kimlik ve Paylaşım Kartı */}
        <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Odaya Katılım Bilgileri
            </span>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-xs text-stone-400 block">Oda Numarası:</span>
                <span className="text-xl font-black font-mono text-white">{currentRoom.roomNumber}</span>
              </div>
              <div className="border-l border-stone-700 pl-3">
                <span className="text-xs text-stone-400 block">Oda Şifresi:</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {showPassword ? currentRoom.roomPasswordHint : '••••••••'}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-stone-400 hover:text-white ml-2 underline"
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyCredentials}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı!' : 'Bilgileri Kopyala'}</span>
            </button>
            {isOwner && (
              <button
                onClick={() => setIsEditingPassword(!isEditingPassword)}
                className="px-3 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-semibold"
              >
                Şifre Değiştir
              </button>
            )}
          </div>
        </div>

        {/* Şifre Değiştirme Formu (Owner için) */}
        {isEditingPassword && isOwner && (
          <form onSubmit={handleSavePassword} className="p-4 rounded-xl bg-stone-800/40 border border-stone-700 space-y-2 text-xs">
            <label className="font-semibold text-white block">Yeni Oda Şifresi</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="Yeni şifreyi girin"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-600 text-white text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shrink-0"
              >
                Kaydet
              </button>
            </div>
          </form>
        )}

        {/* Odaya Katılan Kullanıcılar ve Yetki Yönetimi Tablosu */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Odaya Katılan Üyeler ({roomMembers.length})</span>
            </h4>
            <span className="text-[11px] text-stone-400">
              {isOwner ? '👑 Düzenleme haklarını yönetebilirsiniz' : 'Görüntüleme Modu'}
            </span>
          </div>

          <div className="border border-stone-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/80 text-stone-400 border-b border-stone-800 font-semibold">
                <tr>
                  <th className="p-3">Kullanıcı</th>
                  <th className="p-3">Katılma Tarihi</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Düzenleme Yetkisi (can_edit)</th>
                  {isOwner && <th className="p-3 text-right">İşlem</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {roomMembers.map(member => {
                  const isMemberOwner = member.role === 'owner';

                  return (
                    <tr key={member.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{member.fullName}</span>
                          {isMemberOwner && <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                        </div>
                        <div className="text-[10px] text-stone-400">@{member.username}</div>
                      </td>

                      <td className="p-3 text-stone-400">{member.joinedAt}</td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          member.role === 'owner'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : member.canEdit
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'
                        }`}>
                          {member.role === 'owner' ? '👑 Sahip (Owner)' : member.canEdit ? '✏️ Düzenleyici' : '👁️ Gözlemci (Salt Okunur)'}
                        </span>
                      </td>

                      {/* Düzenleme Yetkisi Toggle */}
                      <td className="p-3">
                        {isMemberOwner ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Tam Yetkili (Kurucu)
                          </span>
                        ) : isOwner ? (
                          <button
                            onClick={() => onToggleCanEdit(member.id, !member.canEdit)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                              member.canEdit
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                : 'bg-stone-800 hover:bg-stone-700 text-stone-400 border border-stone-700'
                            }`}
                          >
                            {member.canEdit ? (
                              <>
                                <PenTool className="w-3.5 h-3.5" />
                                <span>Düzenleme Açık ✓</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Salt Okunur (Kapalı)</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className={member.canEdit ? 'text-emerald-400 font-semibold' : 'text-stone-400'}>
                            {member.canEdit ? 'Düzenleme Yetkisi Var' : 'Sadece Görüntüleme'}
                          </span>
                        )}
                      </td>

                      {/* Çıkar Butonu (Sadece Owner yapabilir) */}
                      {isOwner && (
                        <td className="p-3 text-right">
                          {!isMemberOwner && (
                            <button
                              onClick={() => {
                                if (confirm(`${member.fullName} adlı kullanıcıyı bu çiftlik odasından çıkarmak istiyor musunuz?`)) {
                                  onRemoveMember(member.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="Odadan Çıkar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bilgi Kutusu */}
        <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800 text-[11px] text-stone-400 space-y-1">
          <div><strong>🔐 RBAC Yetki Özeti:</strong></div>
          <div>• <strong>Sahip (Owner):</strong> Çiftliği kuran kişidir. Tüm verilere erişebilir, yeni üyelere yetki dağıtabilir veya yetkiyi geri alabilir.</div>
          <div>• <strong>Düzenleyici (can_edit = true):</strong> Yeni hayvan, tartım, doğum, aşı, yem ve finans kaydı ekleyebilir ve güncelleyebilir.</div>
          <div>• <strong>Gözlemci (can_edit = false):</strong> Çiftliğin tüm canlı verilerini anlık izleyebilir fakat kayıt ekleyemez veya silemez (Salt Okunur).</div>
        </div>
      </div>
    </div>
  );
};
