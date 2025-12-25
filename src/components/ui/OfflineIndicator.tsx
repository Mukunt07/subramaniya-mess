import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-stone-900 text-stone-200 px-4 py-3 rounded-xl shadow-lg border border-stone-800 flex items-center gap-3">
                <div className="bg-red-500/10 p-2 rounded-lg">
                    <WifiOff className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <p className="text-sm font-semibold">You are offline</p>
                    <p className="text-xs text-stone-500">Changes will sync when online</p>
                </div>
            </div>
        </div>
    );
}
