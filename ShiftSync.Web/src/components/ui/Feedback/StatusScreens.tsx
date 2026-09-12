interface LoadingScreenProps {
    message?: string;
    accentColor?: 'purple' | 'cyan';
}

export function LoadingScreen({ message = "Accessing Neural Archives...", accentColor = 'cyan' }: LoadingScreenProps) {
    const colorClass = accentColor === 'purple' ? 'border-accent-purple/30 border-t-accent-purple' : 'border-accent-cyan/30 border-t-accent-cyan';
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in">
            <div className={`w-16 h-16 border-4 rounded-full animate-spin ${colorClass}`}></div>
            <p className="text-white/40 font-label text-xs uppercase tracking-widest animate-pulse">{message}</p>
        </div>
    );
}

interface ErrorScreenProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorScreen({ 
    title = "Signal Interrupted", 
    message = "Unable to establish connection. Please verify the uplink.",
    onRetry 
}: ErrorScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 glass-card rounded-[3rem] border border-error/20 p-12 animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-error">warning</span>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-headline font-bold text-white tracking-tight">{title}</h2>
                <p className="text-white/40 max-w-md mx-auto">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all uppercase text-[10px] font-black tracking-widest"
                >
                    Reconnect Uplink
                </button>
            )}
        </div>
    );
}
