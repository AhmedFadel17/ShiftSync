import React, { useEffect, useCallback } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: ModalSize;
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    showCloseButton?: boolean;
    className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    full: "max-w-[95vw] h-[90vh]",
};

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    size = "md",
    closeOnOverlayClick = true,
    closeOnEsc = true,
    showCloseButton = true,
    className = "",
}: ModalProps) {
    // Handle ESC key press
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (closeOnEsc && event.key === "Escape") {
                onClose();
            }
        },
        [closeOnEsc, onClose]
    );

    // Prevent body scroll when modal is active & bind keyboard listener
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop / Overlay */}
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
                onClick={closeOnOverlayClick ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className={`relative w-full ${sizeClasses[size]} glass-card bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden transition-all duration-300 transform animate-scaleUp ${className}`}
                role="dialog"
                aria-modal="true"
            >
                {/* Modal Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-start justify-between p-5 sm:p-6 border-b border-white/10">
                        <div className="pr-4">
                            {typeof title === "string" ? (
                                <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
                            ) : (
                                title
                            )}
                            {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
                        </div>

                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                type="button"
                                className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl p-2 transition-colors focus:outline-none"
                                aria-label="Close modal"
                            >
                                <span className="material-symbols-outlined text-lg leading-none block">
                                    close
                                </span>
                            </button>
                        )}
                    </div>
                )}

                {/* Modal Body */}
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar text-white/80 text-sm">
                    {children}
                </div>

                {/* Modal Footer */}
                {footer && (
                    <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}