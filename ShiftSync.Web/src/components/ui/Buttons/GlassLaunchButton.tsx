import { ButtonHTMLAttributes } from "react";

export type GlassButtonVariant = "cyan" | "purple" | "emerald" | "amber" | "white";

export interface GlassLaunchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    subtitle?: string;
    iconName?: string;
    variant?: GlassButtonVariant;
    fullWidth?: boolean;
    isLoading?: boolean;
}

const variantMap = {
    cyan: {
        border: "border-cyan-400/20 group-hover:border-cyan-400/80",
        shadow: "shadow-[inset_0_0_12px_rgba(34,211,238,0.05)] group-hover:shadow-[inset_0_0_20px_rgba(34,211,238,0.2),0_0_20px_rgba(34,211,238,0.15)]",
        glowLeft: "bg-purple-500/10",
        glowRight: "bg-cyan-500/10",
        iconHover: "group-hover:text-cyan-300 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]",
        textGradient: "group-hover:to-cyan-200",
        subtitleHover: "group-hover:text-cyan-400/60"
    },
    purple: {
        border: "border-purple-500/20 group-hover:border-purple-500/80",
        shadow: "shadow-[inset_0_0_12px_rgba(168,85,247,0.05)] group-hover:shadow-[inset_0_0_20px_rgba(168,85,247,0.2),0_0_20px_rgba(168,85,247,0.15)]",
        glowLeft: "bg-pink-500/10",
        glowRight: "bg-purple-500/10",
        iconHover: "group-hover:text-purple-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
        textGradient: "group-hover:to-purple-200",
        subtitleHover: "group-hover:text-purple-400/60"
    },
    emerald: {
        border: "border-emerald-400/20 group-hover:border-emerald-400/80",
        shadow: "shadow-[inset_0_0_12px_rgba(52,211,153,0.05)] group-hover:shadow-[inset_0_0_20px_rgba(52,211,153,0.2),0_0_20px_rgba(52,211,153,0.15)]",
        glowLeft: "bg-cyan-500/10",
        glowRight: "bg-emerald-500/10",
        iconHover: "group-hover:text-emerald-300 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]",
        textGradient: "group-hover:to-emerald-200",
        subtitleHover: "group-hover:text-emerald-400/60"
    },
    amber: {
        border: "border-amber-400/20 group-hover:border-amber-400/80",
        shadow: "shadow-[inset_0_0_12px_rgba(251,191,36,0.05)] group-hover:shadow-[inset_0_0_20px_rgba(251,191,36,0.2),0_0_20px_rgba(251,191,36,0.15)]",
        glowLeft: "bg-orange-500/10",
        glowRight: "bg-amber-500/10",
        iconHover: "group-hover:text-amber-300 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]",
        textGradient: "group-hover:to-amber-200",
        subtitleHover: "group-hover:text-amber-400/60"
    },
    white: {
        border: "border-white/10 group-hover:border-white/40",
        shadow: "shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] group-hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]",
        glowLeft: "bg-white/[0.02]",
        glowRight: "bg-white/[0.02]",
        iconHover: "group-hover:text-white group-hover:shadow-none",
        textGradient: "group-hover:to-white/90",
        subtitleHover: "group-hover:text-white/50"
    }
};

export default function GlassLaunchButton({
    title,
    subtitle,
    iconName = "auto_awesome",
    variant = "cyan",
    fullWidth = false,
    isLoading = false,
    className = "",
    disabled,
    children,
    ...props
}: GlassLaunchButtonProps) {
    const theme = variantMap[variant];

    return (
        <button
            disabled={disabled || isLoading}
            className={`group relative px-6 py-3 rounded-lg bg-gradient-to-b from-[#1a1c24] to-[#12131a] border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition-all duration-500 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 text-center overflow-hidden select-none focus:outline-none max-w-md ${fullWidth ? "w-full" : "w-auto min-w-[280px]"
                } ${className}`}
            {...props}
        >
            <div className={`absolute inset-[1px] rounded-lg border ${theme.border} ${theme.shadow} transition-all duration-500 pointer-events-none`} />

            <div className={`absolute -top-12 -left-12 w-32 h-32 ${theme.glowLeft} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
            <div className={`absolute -bottom-12 -right-12 w-32 h-32 ${theme.glowRight} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.05] opacity-100 group-hover:opacity-50 transition-opacity pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[52%] bg-gradient-to-b from-white/[0.03] to-transparent transform -skew-y-6 origin-top-left pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center">

                {iconName && (
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-b from-[#2a2d3a] to-[#16171d] border border-white/10 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.08)] ${theme.iconHover} transition-all duration-500 mb-1 relative shrink-0`}>
                        {isLoading ? (
                            <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined text-xl text-white/70 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12 select-none">
                                {iconName}
                            </span>
                        )}
                        <div className="absolute inset-0.5 rounded-full border border-white/[0.02] pointer-events-none" />
                    </div>
                )}

                {children ? (
                    children
                ) : (
                    <>
                        <h3 className={`text-lg font-bold tracking-wide text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white ${theme.textGradient} transition-all duration-300 mb-1`}>
                            {title}
                        </h3>

                        {subtitle && (
                            <p className={`text-[10px] font-black tracking-[0.16em] uppercase text-white/30 ${theme.subtitleHover} font-mono transition-colors duration-300`}>
                                {subtitle}
                            </p>
                        )}
                    </>
                )}
            </div>
        </button>
    );
}