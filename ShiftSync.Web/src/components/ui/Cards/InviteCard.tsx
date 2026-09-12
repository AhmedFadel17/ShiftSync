import { useState } from "react";
import { toast } from "sonner";

export default function InviteCard() {
    const [copied, setCopied] = useState(false);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://vidimetrics.com";
    const inviteLink = `${baseUrl}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            toast.success("Invite link copied to your clipboard!");

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link.");
        }
    };

    const shareToSocial = (platform: 'twitter' | 'linkedin' | 'whatsapp') => {
        const text = encodeURIComponent("I'm using VidiMetrics to track my content compute metrics. Invite your team and scale your allocations together!");
        const url = encodeURIComponent(inviteLink);

        const links = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`
        };

        window.open(links[platform], "_blank", "width=600,height=400,resizable=yes,scrollbars=yes");
    };

    return (
        <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden border border-white/5 bg-gradient-to-br from-accent-purple/[0.05] via-transparent to-transparent shadow-xl">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-purple/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="material-symbols-outlined text-accent-cyan text-lg">group_add</span>
                        <h4 className="text-lg font-display font-black text-white">
                            Invite Collaborators
                        </h4>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                        Unlock shared team dashboards by adding up to 5 team members to your active workspace allocations.
                    </p>
                </div>

                {/* Interactive Link Input Row */}
                <div className="space-y-1.5 mb-5">
                    <label className="text-[10px] font-label uppercase tracking-widest text-white/40 ml-1">
                        Your Dedicated Team Link
                    </label>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-1.5 rounded-xl focus-within:border-accent-purple/40 transition-all">
                        <input
                            type="text"
                            readOnly
                            value={inviteLink}
                            className="w-full bg-transparent text-xs text-white/60 font-mono px-2 outline-none select-all"
                        />
                        <button
                            onClick={handleCopyLink}
                            type="button"
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${copied
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-white text-black hover:bg-white/90 active:scale-95'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">
                                {copied ? 'check' : 'content_copy'}
                            </span>
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-widest text-white/20 select-none">or share via</span>
                    <div className="flex-grow border-t border-white/5"></div>
                </div>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                    <button
                        onClick={() => shareToSocial('twitter')}
                        className="flex flex-col items-center justify-center gap-1 py-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 active:scale-95 transition-all text-white/60 hover:text-white"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-wider uppercase">X / Twitter</span>
                    </button>

                    <button
                        onClick={() => shareToSocial('linkedin')}
                        className="flex flex-col items-center justify-center gap-1 py-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 active:scale-95 transition-all text-white/60 hover:text-[#0a66c2]"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-wider uppercase">LinkedIn</span>
                    </button>

                    <button
                        onClick={() => shareToSocial('whatsapp')}
                        className="flex flex-col items-center justify-center gap-1 py-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 active:scale-95 transition-all text-white/60 hover:text-[#25d366]"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-3.472c1.657.982 3.111 1.473 4.819 1.474 5.481 0 9.938-4.455 9.941-9.94.001-2.657-1.02-5.155-2.877-7.015s-4.361-2.876-7.016-2.877c-5.486 0-9.942 4.456-9.945 9.942-.001 1.81.487 3.321 1.484 4.987l-.991 3.623 3.714-.974zm11.236-7.042c-.225-.113-1.332-.656-1.539-.731-.207-.075-.357-.112-.507.113-.15.225-.581.731-.712.881-.131.15-.262.169-.487.056-.225-.112-.949-.349-1.807-1.115-.667-.595-1.117-1.33-1.248-1.555-.131-.225-.014-.346.099-.458.101-.1.225-.262.338-.394.112-.131.15-.225.225-.375.075-.15.038-.281-.019-.394-.056-.113-.507-1.219-.694-1.669-.183-.438-.369-.379-.507-.385-.131-.006-.281-.007-.432-.007s-.394.056-.6.281c-.207.225-.788.769-.788 1.875s.807 2.175.92 2.325c.113.15 1.585 2.42 3.84 3.393.536.232.955.37 1.281.474.538.171 1.028.147 1.415.089.431-.064 1.332-.544 1.52-1.069.188-.525.188-.975.131-1.069-.056-.094-.207-.151-.432-.263z" />
                        </svg>
                        <span className="text-[10px] font-bold tracking-wider uppercase">WhatsApp</span>
                    </button>
                </div>
            </div>
        </div>
    );
}