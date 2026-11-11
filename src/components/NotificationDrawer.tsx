import React from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Heart, 
  Lock, 
  ShieldAlert, 
  Wheat, 
  X 
} from 'lucide-react';
import { FarmAlert } from '../types/farm';
import { ActiveTab } from './Navbar';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: FarmAlert[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  setActiveTab
}) => {
  if (!isOpen) return null;

  const urgentAlerts = alerts.filter(a => a.level === 'acil');
  const warningAlerts = alerts.filter(a => a.level === 'uyari');
  const infoAlerts = alerts.filter(a => a.level === 'bilgi');

  const handleAction = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col text-stone-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                🔔
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Akıllı Çiftlik Bildirimleri</h3>
                <p className="text-[11px] text-stone-400">Otomatik kural motoru uyarıları</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alerts Content */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
            {alerts.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-white font-bold text-sm">Harika! Bekleyen Acil Bildirim Yok</h4>
                <p className="text-stone-400 text-xs">Sürü takviminde her şey yolunda görünüyor.</p>
              </div>
            ) : (
              <>
                {/* Acil Seviye */}
                {urgentAlerts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Acil Eylemler ({urgentAlerts.length})
                    </span>
                    {urgentAlerts.map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => handleAction(alert.type === 'dogum' ? 'reproduction' : alert.type === 'karantina' ? 'health' : 'dashboard')}
                        className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 hover:border-rose-600 transition-colors cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                            {alert.type === 'dogum' ? <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
                            <span>{alert.title}</span>
                          </h4>
                          {alert.remainingDays !== undefined && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-900 text-rose-200 font-bold uppercase">
                              {alert.remainingDays === 0 ? 'Bugün!' : 'Gecikme'}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-300 text-[11px] leading-relaxed">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Uyarı Seviyesi */}
                {warningAlerts.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase text-amber-400 tracking-wider">
                      Yaklaşan Tarihler & Eşikler ({warningAlerts.length})
                    </span>
                    {warningAlerts.map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => handleAction(alert.type === 'dogum' ? 'reproduction' : alert.type === 'yem' ? 'feeds' : 'health')}
                        className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 hover:border-amber-600 transition-colors cursor-pointer space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                            {alert.type === 'yem' ? <Wheat className="w-3.5 h-3.5 text-amber-400" /> : <Calendar className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{alert.title}</span>
                          </h4>
                        </div>
                        <p className="text-stone-300 text-[11px] leading-relaxed">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bilgilendirme Seviyesi */}
                {infoAlerts.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase text-sky-400 tracking-wider">
                      Gelişim & Sütten Kesim ({infoAlerts.length})
                    </span>
                    {infoAlerts.map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => handleAction('reproduction')}
                        className="p-3.5 rounded-xl bg-stone-800/60 border border-stone-800 hover:border-sky-600 transition-colors cursor-pointer space-y-1.5"
                      >
                        <h4 className="font-bold text-white text-xs">{alert.title}</h4>
                        <p className="text-stone-300 text-[11px] leading-relaxed">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
