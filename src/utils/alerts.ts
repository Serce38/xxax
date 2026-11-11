import { Animal, FarmAlert, FeedItem, HealthRecord, PregnancyRecord } from '../types/farm';
import { checkWithdrawalActive, getPregnancyProgress } from './calculations';

export function generateFarmAlerts(
  animals: Animal[],
  pregnancies: PregnancyRecord[],
  healthRecords: HealthRecord[],
  feeds: FeedItem[]
): FarmAlert[] {
  const alerts: FarmAlert[] = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Doğum Uyarıları (Gebelik 150 gün kontrolü)
  for (const preg of pregnancies) {
    if (preg.status !== 'beklemede') continue;
    
    const { daysRemaining, isOverdue } = getPregnancyProgress(preg.matingDate, preg.expectedDueDate);

    if (isOverdue) {
      alerts.push({
        id: `birth-overdue-${preg.id}`,
        type: 'dogum',
        level: 'acil',
        title: `Gecikmiş Doğum Uyarısı: ${preg.eweTag}`,
        message: `${preg.eweTag} küpeli koyunun tahmini 150 günlük doğum tarihi geçti (${Math.abs(daysRemaining)} gün gecikme). Doğumhaneyi ve veteriner hekimi kontrol edin.`,
        targetTag: preg.eweTag,
        date: preg.expectedDueDate,
        remainingDays: daysRemaining
      });
    } else if (daysRemaining === 0) {
      alerts.push({
        id: `birth-today-${preg.id}`,
        type: 'dogum',
        level: 'acil',
        title: `Bugün Doğum Bekleniyor: ${preg.eweTag}`,
        message: `${preg.eweTag} küpeli koyun 150. gebelik gününü doldurdu. Bugün doğurması bekleniyor!`,
        targetTag: preg.eweTag,
        date: preg.expectedDueDate,
        remainingDays: 0
      });
    } else if (daysRemaining <= 7) {
      alerts.push({
        id: `birth-near-${preg.id}`,
        type: 'dogum',
        level: 'uyari',
        title: `Yaklaşan Doğum: ${preg.eweTag} (${daysRemaining} Gün Kaldı)`,
        message: `${preg.eweTag} için tahmini doğuma ${daysRemaining} gün kaldı. Temiz doğum bölmesine (padok) alınız.`,
        targetTag: preg.eweTag,
        date: preg.expectedDueDate,
        remainingDays: daysRemaining
      });
    }
  }

  // 2. İlaç Arınma (Karantina) Süresi Uyarıları
  for (const animal of animals) {
    if (animal.status !== 'aktif') continue;
    if (animal.quarantine?.active) {
      const meatCheck = checkWithdrawalActive(animal.quarantine.meatUntil);
      const milkCheck = checkWithdrawalActive(animal.quarantine.milkUntil);

      if (meatCheck.isActive) {
        alerts.push({
          id: `quarantine-meat-${animal.id}`,
          type: 'karantina',
          level: 'acil',
          title: `Et Kesim Yasağı: ${animal.earTag}`,
          message: `${animal.earTag} küpeli hayvanda ${animal.quarantine.medicineName || 'ilaç'} kaynaklı et arınma süresi devam ediyor (${meatCheck.remainingDays} gün kaldı). Kesime GÖNDERİLEMEZ!`,
          targetTag: animal.earTag,
          date: animal.quarantine.meatUntil,
          remainingDays: meatCheck.remainingDays
        });
      }

      if (milkCheck.isActive) {
        alerts.push({
          id: `quarantine-milk-${animal.id}`,
          type: 'karantina',
          level: 'uyari',
          title: `Süt Döküm Uyarısı: ${animal.earTag}`,
          message: `${animal.earTag} küpeli koyunun sütü insan tüketimine sunulamaz (${milkCheck.remainingDays} gün arınma süresi var).`,
          targetTag: animal.earTag,
          date: animal.quarantine.milkUntil,
          remainingDays: milkCheck.remainingDays
        });
      }
    }
  }

  // 3. Planlanmış Aşı ve Parazit İlaçlama Takvimi
  for (const hr of healthRecords) {
    if (!hr.nextScheduledDate) continue;
    const nextDate = new Date(hr.nextScheduledDate);
    const diffTime = nextDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      alerts.push({
        id: `health-past-${hr.id}`,
        type: 'asi',
        level: 'acil',
        title: `Gecikmiş Sağlık Uygulaması: ${hr.title}`,
        message: `${hr.title} için planlanan tarih ${Math.abs(diffDays)} gün önce geçti (${hr.nextScheduledDate}). Uygulama yapınız.`,
        date: hr.nextScheduledDate,
        remainingDays: diffDays
      });
    } else if (diffDays <= 5) {
      alerts.push({
        id: `health-near-${hr.id}`,
        type: 'asi',
        level: 'uyari',
        title: `Yaklaşan Aşı/Bakım: ${hr.title}`,
        message: `${hr.title} uygulamasına ${diffDays === 0 ? 'Bugün' : diffDays + ' gün'} kaldı (${hr.nextScheduledDate}). İlaç/aşı stoğunu kontrol edin.`,
        date: hr.nextScheduledDate,
        remainingDays: diffDays
      });
    }
  }

  // 4. Kritik Yem Stoku
  for (const feed of feeds) {
    if (feed.stockKg <= feed.minThresholdKg) {
      alerts.push({
        id: `feed-low-${feed.id}`,
        type: 'yem',
        level: 'uyari',
        title: `Kritik Yem Stoku: ${feed.name}`,
        message: `${feed.name} stoku ${feed.stockKg.toLocaleString('tr-TR')} kg kaldı (Eşik: ${feed.minThresholdKg.toLocaleString('tr-TR')} kg). Tedarik planlayınız.`,
        date: todayStr
      });
    }
  }

  // 5. Kuzuların Sütten Kesilme (Weaning) Kontrolü (65+ günlük kuzular)
  for (const animal of animals) {
    if (animal.category === 'kuzu' && animal.status === 'aktif') {
      const birth = new Date(animal.birthDate).getTime();
      const ageDays = Math.floor((now.getTime() - birth) / (1000 * 60 * 60 * 24));
      
      if (ageDays >= 65 && (!animal.weightHistory || animal.weightHistory.length <= 1)) {
        alerts.push({
          id: `weaning-${animal.id}`,
          type: 'weaning',
          level: 'bilgi',
          title: `Sütten Kesim & Tartım: ${animal.earTag}`,
          message: `${animal.earTag} kuzu ${ageDays} günlük oldu. Sütten kesim tartımı ve kuzu büyütme rasyonuna geçiş kontrolü yapınız.`,
          targetTag: animal.earTag,
          remainingDays: 0
        });
      }
    }
  }

  return alerts;
}
