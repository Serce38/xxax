export type UserRole = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  username: string;
  fullName: string;
  passwordHash: string; // SHA-256 hash
  salt: string;
  createdAt: string;
}

export interface FarmRoom {
  id: string;
  roomNumber: string; // Benzersiz Oda Numarası örn: "CF-1084"
  roomPasswordHash: string; // Oda şifresi hash'i
  roomPasswordHint: string; // Oda sahibinin paylaşabilmesi için gösterilen şifre
  name: string; // Çiftlik / İşletme Adı
  ownerId: string;
  ownerUsername: string;
  createdAt: string;
}

export interface UserFarmPermission {
  id: string;
  farmId: string; // Hangi çiftlik odası
  userId: string; // Hangi kullanıcı
  username: string;
  fullName: string;
  role: UserRole; // 'owner' | 'editor' | 'viewer'
  canEdit: boolean; // Düzenleme Hakkı (Owner açıp kapatabilir)
  joinedAt: string;
}

export interface AuthSession {
  currentUser: User | null;
  currentFarm: FarmRoom | null;
  userRole: UserRole; // Aktif çiftlikteki rolü
  canEdit: boolean; // Aktif çiftlikteki düzenleme yetkisi
}
