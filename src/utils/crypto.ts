/**
 * Web Crypto API kullanarak güvenli SHA-256 parola hashleme ve oda no oluşturma
 */

export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + ':' + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const calculatedHash = await hashPassword(password, salt);
  return calculatedHash === expectedHash;
}

export function generateRoomNumber(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 basamaklı sayı
  return `CF-${randomNum}`;
}
