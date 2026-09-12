
// Types for styling and sizing variants
type CardSize = "sm" | "md" | "lg";
type CardVariant = "grid-box" | "row-strip";
type AccentColor = "cyan" | "purple" | "emerald" | "amber" | "rose" | "gray";

interface DashboardStatCardProps {
    label: string;
    value: string | number;
    icon: string;
    variant?: CardVariant;
    size?: CardSize;
    accent?: AccentColor;
    onClick?: () => void;
}

// Accent style map ensuring complete dynamic Tailwind class loading strings
const accentStyles: Record<AccentColor, { text: string; bg: string; border: string; hoverBorder: string }> = {
    cyan: { text: "text-accent-cyan", bg: "bg-cyan-500/10", border: "border-cyan-500/20", hoverBorder: "hover:border-accent-cyan/30" },
    purple: { text: "text-accent-purple", bg: "bg-purple-500/10", border: "border-purple-500/20", hoverBorder: "hover:border-accent-purple/30" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hoverBorder: "hover:border-emerald-400/30" },
    amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", hoverBorder: "hover:border-amber-400/30" },
    rose: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", hoverBorder: "hover:border-rose-400/30" },
    gray: { text: "text-white/60", bg: "bg-white/5", border: "border-white/10", hoverBorder: "hover:border-white/20" }
};

export default function DashboardStatCard({
    label,
    value,
    icon,
    variant = "grid-box",
    size = "md",
    accent = "cyan",
    onClick
}: DashboardStatCardProps) {
    const colors = accentStyles[accent];
    const isInteractive = !!onClick;

    // Size variants configuration layout definitions
    const sizeConfig = {
        sm: { labelTxt: "text-[9px]", valTxt: "text-sm", iconSize: "text-sm", wrapperPadding: "p-3" },
        md: { labelTxt: "text-[10px]", valTxt: "text-xl", iconSize: "text-lg", wrapperPadding: "p-4" },
        lg: { labelTxt: "text-[11px]", valTxt: "text-3xl", iconSize: "text-2xl", wrapperPadding: "p-6" }
    };

    const currentSize = sizeConfig[size];

    // Style layout rendering variant A: Square/Box Grid
    if (variant === "grid-box") {
        return (
            <div
                onClick={onClick}
                className={`glass-card ${currentSize.wrapperPadding} rounded-2xl border border-white/5 flex flex-col items-center gap-2 transition-all duration-300 group
                    ${isInteractive ? "cursor-pointer hover:scale-105 " + colors.hoverBorder : ""}`}
            >
                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 ${colors.text}`}>
                    <span className={`material-symbols-outlined ${currentSize.iconSize}`}>{icon}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className={`${currentSize.labelTxt} font-black uppercase tracking-widest text-white/40`}>{label}</span>
                    <span className={`${currentSize.valTxt} font-headline font-bold text-white mt-0.5`}>{value}</span>
                </div>
            </div>
        );
    }

    // Style layout rendering variant B: Horizontal Row
    return (
        <div
            onClick={onClick}
            className={`flex justify-between items-center py-3 rounded-xl border border-transparent transition-all duration-300
                ${isInteractive ? "cursor-pointer hover:bg-white/[0.02] " + colors.hoverBorder : ""}`}
        >
            <div className="flex flex-col">
                <span className={`${currentSize.labelTxt} font-black uppercase tracking-widest text-white/30`}>{label}</span>
                <div className={`${currentSize.valTxt} font-headline font-bold text-white`}>{value}</div>
            </div>
            <div className={`inline-flex rounded-lg px-3 py-2 items-center justify-center border ${colors.text} ${colors.border} ${colors.bg}`}>
                <span className={`material-symbols-outlined ${currentSize.iconSize}`}>{icon}</span>
            </div>
        </div>
    );
}

