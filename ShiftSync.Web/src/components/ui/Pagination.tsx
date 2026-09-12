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
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl px-8 py-4 select-none">

            {/* Left Section: Selectors Controls & Total Metrics */}
            <div className="flex items-center gap-6">
                {/* Per Page Controller */}
                {pageSizeOption &&
                    <div className="flex items-center gap-2 border-r border-white/10 pr-6">
                        <span className="text-xs text-white/40 font-medium whitespace-nowrap">Per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => pageSizeOption.onChange(Number(e.target.value))}
                            className="bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                            {pageSizeOption.values.map((size) => (
                                <option key={size} value={size} className="bg-surface-container-high">{size} items</option>
                            ))}
                        </select>
                    </div>}

                {/* Jump Directly to Page Controller */}
                {totalPages > 0 && (
                    <div className="flex items-center gap-2 border-r border-white/10 pr-6">
                        <span className="text-xs text-white/40 font-medium whitespace-nowrap">Go to:</span>
                        <select
                            value={page}
                            onChange={(e) => onPageChange(Number(e.target.value))}
                            className="bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                        >
                            {pageOptions.map((pNum) => (
                                <option key={pNum} value={pNum} className="bg-surface-container-high">
                                    Page {pNum}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Plain Total Records Label */}
                <div className="text-xs font-medium text-white/30">
                    Total Records: <span className="text-white font-semibold">{totalCount}</span>
                </div>
            </div>

            {/* Right Section: Interactive Action Triggers */}
            <div className="flex items-center gap-4">
                {/* Previous */}
                <button
                    disabled={page === 1 || totalCount === 0}
                    onClick={() => onPageChange(page - 1)}
                    className="px-3 py-2 flex items-center justify-center gap-1 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-300 text-sm"
                >
                    <span className="material-symbols-outlined text-md">chevron_left</span>
                    <span>Prev</span>
                </button>

                {/* Numeric Pagination Bar */}
                {getPages().map((p, i) => (
                    p === '...' ? (
                        <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-white/20">...</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 font-medium text-sm ${page === p
                                ? 'bg-primary-container/40 border border-primary text-white font-bold shadow-[0_0_15px_rgba(120,24,198,0.3)]'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {p}
                        </button>
                    )
                ))}

                {/* Next */}
                <button
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => onPageChange(page + 1)}
                    className="px-3 py-2 flex items-center justify-center gap-1 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-all duration-300 text-sm"
                >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-md">chevron_right</span>
                </button>
            </div>
        </div>
    );
}