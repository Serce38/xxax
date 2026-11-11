import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Animal, 
  BirthRecord, 
  FarmEquipment,
  FarmPartner,
  FeedItem, 
  FeedWasteRecord,
  FinanceRecord, 
  HealthRecord, 
  MatingGroup, 
  PregnancyRecord, 
  RationPlan 
} from './types/farm';
import { FarmRoom, User, UserFarmPermission, UserRole } from './types/auth';
import { 
  exportFarmDataAsJson, 
  FarmState, 
  importFarmDataFromJson, 
  loadFarmData, 
  resetFarmData, 
  saveFarmData 
} from './services/storage';
import { generateFarmAlerts } from './utils/alerts';
import { ActiveTab, Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AnimalsList } from './components/AnimalsList';
import { AnimalDetailModal } from './components/AnimalDetailModal';
import { ReproductionModule } from './components/ReproductionModule';
import { HealthModule } from './components/HealthModule';
import { FeedModule } from './components/FeedModule';
import { FinanceModule } from './components/FinanceModule';
import { NotificationDrawer } from './components/NotificationDrawer';
import { QuickAddModal } from './components/QuickAddModal';
import { AuthModal } from './components/AuthModal';
import { RoomModal } from './components/RoomModal';
import { RoomManagementModal } from './components/RoomManagementModal';

export default function App() {
  const [data, setData] = useState<FarmState>(() => loadFarmData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  
  // Modallar
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomManagementOpen, setRoomManagementOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Online / Offline Dinleyicisi
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Veri her değiştiğinde LocalStorage'a kaydet
  const updateData = (updater: (prev: FarmState) => FarmState) => {
    setData(prev => {
      const next = updater(prev);
      saveFarmData(next);
      return next;
    });
  };

  // Aktif Kullanıcı ve Aktif Çiftlik Odası
  const currentUser: User | null = useMemo(() => {
    return data.users?.find(u => u.id === data.activeUserId) || data.users?.[0] || null;
  }, [data.users, data.activeUserId]);

  const currentRoom: FarmRoom | null = useMemo(() => {
    return data.farmRooms?.find(r => r.id === data.activeFarmId) || data.farmRooms?.[0] || null;
  }, [data.farmRooms, data.activeFarmId]);

  // Aktif İzin & Yetkilendirme (RBAC)
  const activePermission: UserFarmPermission | null = useMemo(() => {
    if (!currentUser || !currentRoom) return null;
    return data.permissions?.find(p => p.farmId === currentRoom.id && p.userId === currentUser.id) || null;
  }, [data.permissions, currentRoom, currentUser]);

  const userRole: UserRole = activePermission?.role || (currentRoom?.ownerId === currentUser?.id ? 'owner' : 'viewer');
  // Sahip ise her zaman true; değilse permission tablosundaki canEdit boolean alanına bakar
  const canEdit: boolean = currentRoom?.ownerId === currentUser?.id ? true : (activePermission?.canEdit ?? false);

  // Dinamik Akıllı Uyarı Motoru
  const alerts = useMemo(() => {
    return generateFarmAlerts(
      data.animals,
      data.pregnancies,
      data.healthRecords,
      data.feeds
    );
  }, [data.animals, data.pregnancies, data.healthRecords, data.feeds]);

  // --- KİMLİK DOĞRULAMA (AUTH) & ODA İŞLEMLERİ ---

  const handleLogin = (user: User) => {
    updateData(prev => ({
      ...prev,
      activeUserId: user.id
    }));
  };

  const handleRegister = (newUser: User) => {
    updateData(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      activeUserId: newUser.id
    }));
  };

  const handleJoinRoom = (room: FarmRoom, perm: UserFarmPermission) => {
    updateData(prev => {
      const permExists = prev.permissions.some(p => p.id === perm.id || (p.farmId === room.id && p.userId === perm.userId));
      return {
        ...prev,
        activeFarmId: room.id,
        permissions: permExists ? prev.permissions : [...prev.permissions, perm]
      };
    });
  };

  const handleCreateRoom = (newRoom: FarmRoom, ownerPerm: UserFarmPermission) => {
    updateData(prev => ({
      ...prev,
      farmRooms: [...prev.farmRooms, newRoom],
      permissions: [...prev.permissions, ownerPerm],
      activeFarmId: newRoom.id
    }));
  };

  const handleToggleCanEdit = (permId: string, canEditVal: boolean) => {
    updateData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => {
        if (p.id === permId) {
          return {
            ...p,
            canEdit: canEditVal,
            role: canEditVal ? 'editor' : 'viewer'
          };
        }
        return p;
      })
    }));
  };

  const handleRemoveMember = (permId: string) => {
    updateData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => p.id !== permId)
    }));
  };

  const handleUpdateRoomPassword = (newPassword: string) => {
    if (!currentRoom) return;
    updateData(prev => ({
      ...prev,
      farmRooms: prev.farmRooms.map(r => {
        if (r.id === currentRoom.id) {
          return {
            ...r,
            roomPasswordHash: newPassword,
            roomPasswordHint: newPassword
          };
        }
        return r;
      })
    }));
  };

  // --- CRUD İŞLEMLERİ (GÜVENLİK KONTROLÜ İLE) ---

  // Hayvan Ekle
  const handleAddAnimal = (newAnimal: Animal) => {
    if (!canEdit) {
      alert('Yetki Hatası: Bu çiftlik odasında sadece izleme (salt okunur) yetkiniz var.');
      return;
    }
    updateData(prev => ({
      ...prev,
      animals: [newAnimal, ...prev.animals]
    }));
  };

  // Hayvan Güncelle
  const handleUpdateAnimal = (updated: Animal) => {
    if (!canEdit) {
      alert('Yetki Hatası: Bu çiftlik odasında sadece izleme (salt okunur) yetkiniz var.');
      return;
    }
    updateData(prev => ({
      ...prev,
      animals: prev.animals.map(a => a.id === updated.id ? updated : a)
    }));
    if (selectedAnimal && selectedAnimal.id === updated.id) {
      setSelectedAnimal(updated);
    }
  };

  // Hayvan Sil
  const handleDeleteAnimal = (id: string) => {
    if (!canEdit) {
      alert('Yetki Hatası: Bu çiftlik odasında sadece izleme (salt okunur) yetkiniz var.');
      return;
    }
    if (!confirm('Bu hayvan kaydını silmek istediğinize emin misiniz?')) return;
    updateData(prev => ({
      ...prev,
      animals: prev.animals.filter(a => a.id !== id)
    }));
    if (selectedAnimal && selectedAnimal.id === id) {
      setSelectedAnimal(null);
    }
  };

  // Koç Katım Grubu Ekle
  const handleAddMatingGroup = (group: MatingGroup) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      matingGroups: [group, ...prev.matingGroups]
    }));
  };

  // Gebelik Ekle
  const handleAddPregnancy = (preg: PregnancyRecord) => {
    if (!canEdit) return;
    updateData(prev => {
      const updatedAnimals = prev.animals.map(a => {
        if (a.earTag === preg.eweTag) {
          return {
            ...a,
            isPregnant: true,
            pregnancyDueDate: preg.expectedDueDate,
            lastMatingDate: preg.matingDate
          };
        }
        return a;
      });

      return {
        ...prev,
        animals: updatedAnimals,
        pregnancies: [preg, ...prev.pregnancies]
      };
    });
  };

  // Gebelik Güncelle
  const handleUpdatePregnancy = (preg: PregnancyRecord) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      pregnancies: prev.pregnancies.map(p => p.id === preg.id ? preg : p)
    }));
  };

  // Doğum Ekle (Kritik: Otomatik Doğan Kuzuları Sürüye Ekler!)
  const handleAddBirth = (birth: BirthRecord, newLambs: Animal[]) => {
    if (!canEdit) return;
    updateData(prev => {
      const updatedAnimals = prev.animals.map(a => {
        if (a.earTag === birth.eweTag) {
          return {
            ...a,
            isPregnant: false,
            pregnancyDueDate: undefined
          };
        }
        return a;
      });

      return {
        ...prev,
        animals: [...newLambs, ...updatedAnimals],
        births: [birth, ...prev.births]
      };
    });
  };

  // Sağlık / Aşı Kaydı Ekle
  const handleAddHealthRecord = (record: HealthRecord) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      healthRecords: [record, ...prev.healthRecords]
    }));
  };

  // Sağlık / Aşı Kaydı Güncelle
  const handleUpdateHealthRecord = (record: HealthRecord) => {
    if (!canEdit) {
      alert('Yetki Hatası: Bu çiftlik odasında sadece izleme (salt okunur) yetkiniz var.');
      return;
    }
    updateData(prev => ({
      ...prev,
      healthRecords: prev.healthRecords.map(h => h.id === record.id ? record : h)
    }));
  };

  // Yem Ekle
  const handleAddFeed = (feed: FeedItem) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      feeds: [...prev.feeds, feed]
    }));
  };

  // Yem Bilgisi Güncelle
  const handleUpdateFeed = (updatedFeed: FeedItem) => {
    if (!canEdit) {
      alert('Yetki Hatası: Bu çiftlik odasında sadece izleme (salt okunur) yetkiniz var.');
      return;
    }
    updateData(prev => ({
      ...prev,
      feeds: prev.feeds.map(f => f.id === updatedFeed.id ? updatedFeed : f)
    }));
  };

  // Yem Stoku Güncelle
  const handleUpdateFeedStock = (feedId: string, newStockKg: number) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      feeds: prev.feeds.map(f => f.id === feedId ? { ...f, stockKg: newStockKg } : f)
    }));
  };

  // Rasyon Ekle
  const handleAddRation = (ration: RationPlan) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      rations: [...prev.rations, ration]
    }));
  };

  // Rasyon Güncelle
  const handleUpdateRation = (ration: RationPlan) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      rations: prev.rations.map(r => r.id === ration.id ? ration : r)
    }));
  };

  // Finans Kaydı Ekle (Yem Alımı ve Ambar Stok Entegrasyonlu - Requirement 2)
  const handleAddFinanceRecord = (record: FinanceRecord) => {
    if (!canEdit) return;
    updateData(prev => {
      let updatedFeeds = prev.feeds;
      // Eğer yem alımı ve ambar entegrasyonu varsa:
      if (record.feedId && record.feedQuantityKg && record.feedQuantityKg > 0) {
        updatedFeeds = prev.feeds.map(f => {
          if (f.id === record.feedId) {
            const newStock = f.stockKg + (record.feedQuantityKg || 0);
            const newCost = record.feedUnitPrice || f.unitCost;
            return {
              ...f,
              stockKg: newStock,
              unitCost: newCost
            };
          }
          return f;
        });
      }

      return {
        ...prev,
        feeds: updatedFeeds,
        finances: [record, ...prev.finances]
      };
    });
  };

  // Finans Kaydı Güncelle
  const handleUpdateFinanceRecord = (record: FinanceRecord) => {
    if (!canEdit) {
      alert('Yetki Hatası: Bu çiftlik odasında sadece izleme (salt okunur) yetkiniz var.');
      return;
    }
    updateData(prev => ({
      ...prev,
      finances: prev.finances.map(f => f.id === record.id ? record : f)
    }));
  };

  // --- YEM ZAYİ / FİRE İŞLEMLERİ (Requirement 3) ---
  const handleAddFeedWaste = (waste: FeedWasteRecord) => {
    if (!canEdit) return;
    updateData(prev => {
      // Ambardaki stoktan düş
      const updatedFeeds = prev.feeds.map(f => {
        if (f.id === waste.feedId) {
          return {
            ...f,
            stockKg: Math.max(0, f.stockKg - waste.amountKg)
          };
        }
        return f;
      });

      return {
        ...prev,
        feeds: updatedFeeds,
        feedWastes: [waste, ...(prev.feedWastes || [])]
      };
    });
  };

  const handleDeleteFeedWaste = (id: string) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      feedWastes: (prev.feedWastes || []).filter(w => w.id !== id)
    }));
  };

  // --- ORTAKLIK İŞLEMLERİ (Requirement 1) ---
  const handleAddPartner = (partner: FarmPartner) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      partners: [...(prev.partners || []), partner]
    }));
  };

  const handleUpdatePartner = (partner: FarmPartner) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      partners: (prev.partners || []).map(p => p.id === partner.id ? partner : p)
    }));
  };

  const handleDeletePartner = (id: string) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      partners: (prev.partners || []).filter(p => p.id !== id)
    }));
  };

  // --- DEMİRBAŞ & EKİPMAN İŞLEMLERİ (Requirement 4) ---
  const handleAddEquipment = (eq: FarmEquipment) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      equipments: [eq, ...(prev.equipments || [])]
    }));
  };

  const handleUpdateEquipment = (eq: FarmEquipment) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      equipments: (prev.equipments || []).map(e => e.id === eq.id ? eq : e)
    }));
  };

  const handleDeleteEquipment = (id: string) => {
    if (!canEdit) return;
    updateData(prev => ({
      ...prev,
      equipments: (prev.equipments || []).filter(e => e.id !== id)
    }));
  };

  // JSON Yedek İndir
  const handleExportBackup = () => {
    exportFarmDataAsJson(data);
  };

  // JSON Yedekten Geri Yükle
  const handleImportBackupTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (text) {
        importFarmDataFromJson(
          text,
          newData => {
            setData(newData);
            alert('Çiftlik verileri yedekten başarıyla geri yüklendi!');
          },
          errMsg => alert(`Hata: ${errMsg}`)
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Fabrika Ayarlarına Sıfırla
  const handleResetData = () => {
    const fresh = resetFarmData();
    setData(fresh);
    alert('Tüm veriler varsayılan çiftlik ayarlarına sıfırlandı.');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Gizli Dosya Girişi (Yedek Yükleme) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Üst Navigasyon */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        alerts={alerts}
        currentUser={currentUser}
        currentRoom={currentRoom}
        userRole={userRole}
        canEdit={canEdit}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenRoomModal={() => setRoomModalOpen(true)}
        onOpenRoomManagement={() => setRoomManagementOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackupTrigger}
        onResetData={handleResetData}
      />

      {/* Ana Gövde */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            animals={data.animals}
            pregnancies={data.pregnancies}
            healthRecords={data.healthRecords}
            feeds={data.feeds}
            finances={data.finances}
            alerts={alerts}
            setActiveTab={setActiveTab}
            onOpenQuickAdd={() => setQuickAddOpen(true)}
            onSelectAnimal={animal => setSelectedAnimal(animal)}
          />
        )}

        {activeTab === 'animals' && (
          <AnimalsList
            animals={data.animals}
            canEdit={canEdit}
            onSelectAnimal={animal => setSelectedAnimal(animal)}
            onAddAnimal={handleAddAnimal}
            onUpdateAnimal={handleUpdateAnimal}
            onDeleteAnimal={handleDeleteAnimal}
          />
        )}

        {activeTab === 'reproduction' && (
          <ReproductionModule
            animals={data.animals}
            matingGroups={data.matingGroups}
            pregnancies={data.pregnancies}
            births={data.births}
            onAddMatingGroup={handleAddMatingGroup}
            onAddPregnancy={handleAddPregnancy}
            onUpdatePregnancy={handleUpdatePregnancy}
            onAddBirth={handleAddBirth}
            onSelectAnimal={animal => setSelectedAnimal(animal)}
          />
        )}

        {activeTab === 'health' && (
          <HealthModule
            healthRecords={data.healthRecords}
            animals={data.animals}
            canEdit={canEdit}
            onAddHealthRecord={handleAddHealthRecord}
            onUpdateHealthRecord={handleUpdateHealthRecord}
            onUpdateAnimal={handleUpdateAnimal}
          />
        )}

        {activeTab === 'feeds' && (
          <FeedModule
            feeds={data.feeds}
            feedWastes={data.feedWastes || []}
            rations={data.rations}
            canEdit={canEdit}
            onAddFeed={handleAddFeed}
            onUpdateFeedStock={handleUpdateFeedStock}
            onUpdateFeed={handleUpdateFeed}
            onAddRation={handleAddRation}
            onUpdateRation={handleUpdateRation}
            onAddFeedWaste={handleAddFeedWaste}
            onDeleteFeedWaste={handleDeleteFeedWaste}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceModule
            finances={data.finances}
            animals={data.animals}
            partners={data.partners || []}
            equipments={data.equipments || []}
            feeds={data.feeds}
            canEdit={canEdit}
            onAddFinanceRecord={handleAddFinanceRecord}
            onUpdateFinanceRecord={handleUpdateFinanceRecord}
            onAddPartner={handleAddPartner}
            onUpdatePartner={handleUpdatePartner}
            onDeletePartner={handleDeletePartner}
            onAddEquipment={handleAddEquipment}
            onUpdateEquipment={handleUpdateEquipment}
            onDeleteEquipment={handleDeleteEquipment}
          />
        )}
      </main>

      {/* Bireysel Hayvan Detay Modalı */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          allAnimals={data.animals}
          canEdit={canEdit}
          onClose={() => setSelectedAnimal(null)}
          onUpdateAnimal={handleUpdateAnimal}
          onSelectAnotherAnimal={animal => setSelectedAnimal(animal)}
        />
      )}

      {/* Akıllı Bildirim Çekmecesi */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        alerts={alerts}
        setActiveTab={setActiveTab}
      />

      {/* Hızlı İşlem Modalı */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        setActiveTab={setActiveTab}
      />

      {/* Kullanıcı Girişi / Kayıt Modalı */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        users={data.users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Odaya Katıl / Oda Oluştur Modalı */}
      <RoomModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        currentUser={currentUser}
        farmRooms={data.farmRooms}
        permissions={data.permissions}
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
      />

      {/* Oda Sahibi Yetki Yönetim Paneli (RBAC) */}
      {currentRoom && (
        <RoomManagementModal
          isOpen={roomManagementOpen}
          onClose={() => setRoomManagementOpen(false)}
          currentRoom={currentRoom}
          currentUser={currentUser}
          permissions={data.permissions}
          onToggleCanEdit={handleToggleCanEdit}
          onRemoveMember={handleRemoveMember}
          onUpdateRoomPassword={handleUpdateRoomPassword}
        />
      )}
    </div>
  );
}
