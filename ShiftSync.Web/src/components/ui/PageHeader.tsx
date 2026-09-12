import React from 'react';

export interface PageHeaderProps {
    chipText: string;
    titlePrefix: string;
    gradientText?: string;
    description: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    chipText,
    titlePrefix,
    gradientText,
    description,
}) => {
    return (
        <div className="space-y-1">
            {/* Upper Status Pulse Chip */}
            <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_#4cd7f6]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary">
                    {chipText}
                </span>
            </div>

            {/* Main Composite Heading */}
            <h1 className="text-4xl font-headline font-bold text-on-surface">
                {titlePrefix}{' '}
                {gradientText && (
                    <span className="text-gradient-primary">{gradientText}</span>
                )}
            </h1>

            {/* Narrative Meta Description */}
            <p className="text-on-surface-variant/70 text-sm">
                {description}
            </p>
        </div>
    );
};