interface PaginationProps {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    pageSizeOption?: {
        values: number[];
        onChange: (pageSize: number) => void;
    };
    onPageChange: (page: number) => void;
}

export default function Pagination({
    page,
    pageSize,
    totalPages,
    totalCount,
    onPageChange,
    pageSizeOption
}: PaginationProps) {

    const getPages = () => {
        const pages = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (page > 3) {
                pages.push('...');
            }

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            let adjustedStart = start;
            let adjustedEnd = end;

            if (page <= 3) {
                adjustedEnd = 4;
            } else if (page >= totalPages - 2) {
                adjustedStart = totalPages - 3;
            }

            for (let i = Math.max(2, adjustedStart); i <= Math.min(totalPages - 1, adjustedEnd); i++) {
                pages.push(i);
            }

            if (page < totalPages - 2) {
                pages.push('...');
            }

            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }
        return pages;
    };

    // Generate numeric array values for the Page Jumper select element
    const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex flex-wrap justify-between items-center gap-4 bg-surface-container-lowest border border-outline-variant/25 rounded-xl px-6 py-3 shadow-sm select-none w-full">

            {/* Left Section: Selectors Controls & Total Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Per Page Controller */}
                {pageSizeOption &&
                    <div className="flex items-center gap-2 border-r border-outline-variant/20 pr-4 sm:pr-6">
                        <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">Per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => pageSizeOption.onChange(Number(e.target.value))}
                            className="bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                            {pageSizeOption.values.map((size) => (
                                <option key={size} value={size}>{size} items</option>
                            ))}
                        </select>
                    </div>}

                {/* Jump Directly to Page Controller */}
                {totalPages > 0 && (
                    <div className="flex items-center gap-2 border-r border-outline-variant/20 pr-4 sm:pr-6">
                        <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">Go to:</span>
                        <select
                            value={page}
                            onChange={(e) => onPageChange(Number(e.target.value))}
                            className="bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs text-on-surface px-2.5 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                            {pageOptions.map((pNum) => (
                                <option key={pNum} value={pNum}>
                                    Page {pNum}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Plain Total Records Label */}
                <div className="text-xs font-medium text-on-surface-variant">
                    Total Records: <span className="text-on-surface font-semibold">{totalCount}</span>
                </div>
            </div>

            {/* Right Section: Interactive Action Triggers */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Previous */}
                <button
                    disabled={page === 1 || totalCount === 0}
                    onClick={() => onPageChange(page - 1)}
                    className="px-3 py-1.5 flex items-center justify-center gap-1 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:hover:bg-transparent transition-all text-xs font-medium"
                >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    <span>Prev</span>
                </button>

                {/* Numeric Pagination Bar */}
                <div className="flex items-center gap-1">
                    {getPages().map((p, i) => (
                        p === '...' ? (
                            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-outline text-xs">...</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p as number)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all text-xs font-semibold ${page === p
                                    ? 'bg-primary text-on-primary shadow-sm'
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    ))}
                </div>

                {/* Next */}
                <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => onPageChange(page + 1)}
                    className="px-3 py-1.5 flex items-center justify-center gap-1 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:hover:bg-transparent transition-all text-xs font-medium"
                >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
        </div>
    );
}