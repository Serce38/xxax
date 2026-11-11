import React from 'react';
import { 
  Activity, 
  Bell, 
  Calendar, 
  ChevronDown, 
  CircleDollarSign, 
  CloudOff, 
  Crown, 
  Database, 
  Download, 
  Eye, 
  Home, 
  Plus, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Upload, 
  User, 
  Users, 
  Wheat, 
  Wifi 
} from 'lucide-react';
import { FarmAlert } from '../types/farm';
import { FarmRoom, User as AuthUser, UserRole } from '../types/auth';

export type ActiveTab = 'dashboard' | 'animals' | 'reproduction' | 'health' | 'feeds' | 'finance';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOnline: boolean;
  alerts: FarmAlert[];
  currentUser: AuthUser | null;
  currentRoom: FarmRoom | null;
  userRole: UserRole;
  canEdit: boolean;
  onOpenNotifications: () => void;
  onOpenQuickAdd: () => void;
  onOpenAuth: () => void;
  onOpenRoomModal: () => void;
  onOpenRoomManagement: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  alerts,
  currentUser,
  currentRoom,
  userRole,
  canEdit,
  onOpenNotifications,
  onOpenQuickAdd,
  onOpenAuth,
  onOpenRoomModal,
  onOpenRoomManagement,
  onExportBackup,
  onImportBackup,
  onResetData
}) => {
  const urgentAlertsCount = alerts.filter(a => a.level === 'acil' || a.level === 'uyari').length;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [flockMenuOpen, setFlockMenuOpen] = React.useState(false);

  const isOwner = userRole === 'owner';
  const isFlockActive = ['animals', 'reproduction', 'health', 'feeds'].includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-md">
      {/* Read-Only / Viewer Mode Warning */}
      {!canEdit && (
        <div className="bg-indigo-950 border-b border-indigo-800 px-4 py-1.5 text-xs text-indigo-200 font-medium flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Gözlemci / Salt Okunur Mod:</strong> Bu çiftlik odasında sadece verileri görüntüleyebilirsiniz. Düzenleme yetkisi için çiftlik sahibinden ({currentRoom?.ownerUsername ? `@${currentRoom.ownerUsername}` : 'Sahip'}) yetki talep ediniz.
          </span>
        </div>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <div className="bg-amber-600 px-4 py-1.5 text-xs text-white font-medium flex items-center justify-center gap-2">
          <CloudOff className="w-4 h-4 animate-pulse" />
          <span>Çevrimdışı Mod: Ağ bağlantısı yok. Tüm kayıtlar cihazınıza kaydedilir, internet gelince senkron kalır.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Farm Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-bold text-lg group-hover:scale-105 transition-transform">
                🐑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    Çiftlik Pro
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Sürü v2.4
                  </span>
                </div>
                <p className="text-xs text-stone-400 hidden sm:block">Koyun & Damızlık Yönetim Sistemi</p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* 1. Özet */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Özet</span>
            </button>

            {/* 2. Sürü (Dropdown ile Alt Sekmeler: Sürü Listesi, Üreme & Gebelik, Sağlık & Aşı, Yem & Rasyon) */}
            <div className="relative">
              <button
                onClick={() => setFlockMenuOpen(!flockMenuOpen)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isFlockActive
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Sürü</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {flockMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFlockMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-stone-800 border border-stone-700 shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3.5 py-1.5 border-b border-stone-700 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Sürü Yönetim Alt Sekmeleri
                    </div>

                    {/* Alt Sekme 1: Sürü Listesi */}
                    <button
                      onClick={() => {
                        setActiveTab('animals');
                        setFlockMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-colors ${
                        activeTab === 'animals' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-stone-200 hover:bg-stone-700'
                      }`}
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white text-xs">Sürü Listesi</div>
                        <div className="text-[10px] text-stone-400">Kategori, küpe no, tartım, soy kütüğü</div>
                      </div>
                    </button>

                    {/* Alt Sekme 2: Üreme & Gebelik */}
                    <button
                      onClick={() => {
                        setActiveTab('reproduction');
                        setFlockMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-colors ${
                        activeTab === 'reproduction' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-stone-200 hover:bg-stone-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold text-white text-xs">Üreme & Gebelik</div>
                        <div className="text-[10px] text-stone-400">Koç katımı, 150 gün gebelik radarı, doğumlar</div>
                      </div>
                    </button>

                    {/* Alt Sekme 3: Sağlık & Aşı */}
                    <button
                      onClick={() => {
                        setActiveTab('health');
                        setFlockMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-colors ${
                        activeTab === 'health' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-stone-200 hover:bg-stone-700'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-bold text-white text-xs">Sağlık & Aşı</div>
                        <div className="text-[10px] text-stone-400">Aşı takvimi, parazit, et/süt karantinası</div>
                      </div>
                    </button>

                    {/* Alt Sekme 4: Yem & Rasyon */}
                    <button
                      onClick={() => {
                        setActiveTab('feeds');
                        setFlockMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-colors ${
                        activeTab === 'feeds' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-stone-200 hover:bg-stone-700'
                      }`}
                    >
                      <Wheat className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold text-white text-xs">Yem & Rasyon</div>
                        <div className="text-[10px] text-stone-400">Yem ambarı stoku, rasyon besin dengesi</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 3. Finans */}
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'finance'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <CircleDollarSign className="w-4 h-4" />
              <span>Finans</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              title="Akıllı Uyarılar ve Bildirimler"
            >
              <Bell className="w-5 h-5" />
              {urgentAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[11px] font-bold text-white shadow ring-2 ring-stone-900 animate-bounce">
                  {urgentAlertsCount}
                </span>
              )}
            </button>

            {/* Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              disabled={!canEdit}
              className={`px-3 sm:px-3.5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95 ${
                canEdit
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
              }`}
              title={canEdit ? 'Hızlı İşlem' : 'Salt Okunur Mod: Düzenleme yetkiniz yok'}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{canEdit ? 'Hızlı İşlem' : 'Salt Okunur'}</span>
            </button>

            {/* Kullanıcı Profili ve Rol Rozeti (Mustafa Sahip Sekmesi) */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isOwner ? 'bg-amber-500/20 text-amber-300' : canEdit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {isOwner ? '👑' : canEdit ? '✏️' : '👁️'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-bold text-xs text-white leading-tight">
                    {currentUser?.fullName.split(' ')[0] || 'Giriş'}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {isOwner ? 'Sahip' : canEdit ? 'Düzenleyici' : 'Gözlemci'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-stone-800 border border-stone-700 shadow-2xl py-2 z-50 text-xs">
                    {/* Kullanıcı Kimlik Kartı */}
                    <div className="px-4 py-2.5 border-b border-stone-700 bg-stone-900/40">
                      <div className="font-extrabold text-white text-sm">{currentUser?.fullName}</div>
                      <div className="text-stone-400 text-[11px]">@{currentUser?.username}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOwner ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : canEdit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {isOwner ? '👑 Çiftlik Sahibi (Owner)' : canEdit ? '✏️ Düzenleme Yetkili' : '👁️ Salt Okunur Gözlemci'}
                        </span>
                      </div>
                    </div>

                    {/* Aktif Oda Bilgisi Özeti */}
                    {currentRoom && (
                      <div className="px-4 py-2 border-b border-stone-700/80 bg-stone-850">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                          Aktif Çiftlik Odası
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[11px] border border-amber-500/30">
                            {currentRoom.roomNumber}
                          </span>
                          <span className="font-semibold text-white truncate max-w-[170px]" title={currentRoom.name}>
                            {currentRoom.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Alt Sekmeler */}
                    <div className="py-1">
                      {/* 1. Oda Değiştir veya Yeni Odaya Katıl */}
                      <button
                        onClick={() => {
                          onOpenRoomModal();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-stone-200 hover:bg-stone-700/80 flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
                            Oda Değiştir / Odaya Katıl
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Oda No ve Şifre ile bağlan veya yeni oda kur
                          </div>
                        </div>
                      </button>

                      {/* 2. Yetkililer Sekmesi */}
                      <button
                        onClick={() => {
                          onOpenRoomManagement();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-stone-200 hover:bg-stone-700/80 flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Crown className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
                            Yetkililer Sekmesi
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {isOwner ? 'Üye listesi ve düzenleme yetkilerini (can_edit) yönet' : 'Odadaki yetkili üyeleri incele'}
                          </div>
                        </div>
                      </button>

                      <div className="border-t border-stone-700/60 my-1" />

                      {/* 3. Kullanıcı Değiştir / Giriş Yap */}
                      <button
                        onClick={() => {
                          onOpenAuth();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-stone-200 hover:bg-stone-700/80 flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs group-hover:text-sky-300 transition-colors">
                            Kullanıcı Değiştir / Giriş
                          </div>
                          <div className="text-[10px] text-stone-400">
                            Farklı bir hesapla test et veya çıkış yap
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* More Menu (Backup, Restore, Reset) */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                title="Ayarlar & Yedekleme"
              >
                <Database className="w-5 h-5" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-stone-800 border border-stone-700 shadow-2xl py-2 z-50 text-sm">
                    <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 border-b border-stone-700 flex items-center justify-between">
                      <span>Veri & Yedek</span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        {isOnline ? <Wifi className="w-3 h-3" /> : <CloudOff className="w-3 h-3 text-amber-400" />}
                        {isOnline ? 'Çevrimiçi' : 'Lokal Depo'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onExportBackup();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-200 hover:bg-stone-700 flex items-center gap-2.5"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-medium">Yedek İndir (JSON)</div>
                        <div className="text-[11px] text-stone-400">Çiftlik verilerini dışa aktar</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onImportBackup();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-200 hover:bg-stone-700 flex items-center gap-2.5"
                    >
                      <Upload className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="font-medium">Yedekten Yükle</div>
                        <div className="text-[11px] text-stone-400">JSON dosyasından geri yükle</div>
                      </div>
                    </button>

                    <div className="border-t border-stone-700 my-1" />

                    <button
                      onClick={() => {
                        if (confirm('Tüm çiftlik verileri örnek fabrika ayarlarına sıfırlanacaktır. Onaylıyor musunuz?')) {
                          onResetData();
                        }
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-300 hover:bg-rose-950/40 flex items-center gap-2.5"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-medium">Örnek Verileri Yenile</div>
                        <div className="text-[11px] text-stone-400">Varsayılan Merinos sürüsü</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sürü Sekmesi Alt Menü Çubuğu (Kullanıcı Sürü alt sekmelerindeyken hızlı geçiş) */}
      {isFlockActive && (
        <div className="bg-stone-900/90 border-t border-stone-800/80 px-4 sm:px-6 lg:px-8 py-1.5 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
            <span className="text-stone-400 font-bold mr-1 flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sürü:</span>
            </span>

            <button
              onClick={() => setActiveTab('animals')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'animals'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <span>Sürü Listesi</span>
            </button>

            <button
              onClick={() => setActiveTab('reproduction')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reproduction'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Üreme & Gebelik</span>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'health'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Sağlık & Aşı</span>
            </button>

            <button
              onClick={() => setActiveTab('feeds')}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'feeds'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <Wheat className="w-3.5 h-3.5 text-amber-400" />
              <span>Yem & Rasyon</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden border-t border-stone-800 bg-stone-900/95 backdrop-blur px-4 py-1.5 flex items-center justify-around text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Özet</span>
        </button>

        <button
          onClick={() => {
            if (!isFlockActive) setActiveTab('animals');
            else setFlockMenuOpen(!flockMenuOpen);
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-lg ${
            isFlockActive ? 'text-emerald-400 font-bold' : 'text-stone-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Sürü</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg ${
            activeTab === 'finance' ? 'text-emerald-400 font-bold' : 'text-stone-400'
          }`}
        >
          <CircleDollarSign className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Finans</span>
        </button>
      </div>
    </header>
  );
};
