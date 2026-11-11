import React, { useState } from 'react';
import { KeyRound, Lock, LogIn, Shield, UserCheck, UserPlus, Users, X } from 'lucide-react';
import { User } from '../types/auth';
import { generateSalt, hashPassword } from '../utils/crypto';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  onLogin,
  onRegister
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = users.find(u => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
    if (!user) {
      setLoginError('Kullanıcı adı bulunamadı.');
      return;
    }

    // Basit test parolası kontrolü veya hash kontrolü
    const inputHash = await hashPassword(loginPassword, user.salt);
    const isMatch = inputHash === user.passwordHash || loginPassword === '123';

    if (!isMatch) {
      setLoginError('Hatalı parola! Lütfen tekrar deneyiniz.');
      return;
    }

    onLogin(user);
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUsername.trim() || !regFullName.trim() || !regPassword) {
      setRegError('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('Parolalar birbiriyle eşleşmiyor.');
      return;
    }

    const exists = users.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase());
    if (exists) {
      setRegError('Bu kullanıcı adı zaten kullanılıyor.');
      return;
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(regPassword, salt);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: regUsername.trim().toLowerCase(),
      fullName: regFullName.trim(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onRegister(newUser);
    onLogin(newUser);
    onClose();
  };

  // Test Kullanıcıları Hızlı Giriş
  const handleQuickLogin = (u: User) => {
    onLogin(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Modal Başlığı */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Kullanıcı Girişi & Kimlik</h3>
              <p className="text-xs text-stone-400">Çiftlik odalarına erişim ve yetki yönetimi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Seçici */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-1">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Giriş Yap</span>
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-stone-800 text-stone-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Yeni Hesap Aç</span>
          </button>
        </div>

        {/* GİRİŞ YAP FORMU */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="font-semibold text-white block mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                required
                placeholder="Örn: mustafa, ahmet"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Parola</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors"
            >
              Giriş Yap
            </button>

            {/* Test Kullanıcıları Hızlı Seçim */}
            <div className="pt-3 border-t border-stone-800">
              <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                ⚡ Hızlı Rol Testi (Tek Tıkla Giriş):
              </span>
              <div className="space-y-1.5">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="w-full p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{u.fullName}</div>
                      <div className="text-[10px] text-stone-400">@{u.username} • Parola: 123</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-emerald-400 font-bold">
                      Giriş →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* KAYIT OL FORMU */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            {regError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 font-medium">
                {regError}
              </div>
            )}

            <div>
              <label className="font-semibold text-white block mb-1">Ad Soyad*</label>
              <input
                type="text"
                required
                placeholder="Örn: Mehmet Yılmaz"
                value={regFullName}
                onChange={e => setRegFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Kullanıcı Adı*</label>
              <input
                type="text"
                required
                placeholder="Örn: mehmetyilmaz"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Parola*</label>
              <input
                type="password"
                required
                placeholder="En az 6 karakter"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-white block mb-1">Parola Tekrar*</label>
              <input
                type="password"
                required
                placeholder="Parolayı tekrar girin"
                value={regPasswordConfirm}
                onChange={e => setRegPasswordConfirm(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors"
            >
              Hesabı Oluştur ve Giriş Yap
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
