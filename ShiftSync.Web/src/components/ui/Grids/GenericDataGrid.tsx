import React, { useState, useRef, useEffect } from 'react';
import Pagination from '../Pagination';
import { ErrorScreen, LoadingScreen } from '@/components/ui/Feedback/StatusScreens';

interface SearchConfig {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}

interface FilterFieldOption {
    value: any;
    label: string;
}

export interface FilterGroupConfig {
    id: string;
    label: string;
    type: 'select' | 'date' | 'radio';
    options?: FilterFieldOption[];
    searchable?: boolean; // Enable inline search inside dropdown
    onSearch?: (searchTerm: string) => void; // Optional dynamic lookup query handler
    isLoading?: boolean; // Show loader when dynamic lookup is running
}

interface FilterConfig {
    fields: FilterGroupConfig[];
    values: Record<string, any>;
    onChange: (nextValues: Record<string, any>) => void;
}

interface SortOption {
    label: string;
    orderBy: string;
    sortOrder: 'asc' | 'desc';
}

interface SortConfig {
    options: SortOption[];
    currentOrderBy: string;
    currentSortOrder: 'asc' | 'desc';
    onChange: (orderBy: string, sortOrder: 'asc' | 'desc') => void;
}

interface PaginationMetadata {
    pageNumber: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
}

interface GenericDataGridProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    searchOption?: SearchConfig;
    filterOptions?: FilterConfig;
    sortOption?: SortConfig;
    paginationData?: PaginationMetadata;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeValues?: number[];
    isLoading?: boolean;
    error?: any;
    loadingMessage?: string;
    errorTitle?: string;
    errorMessage?: string;
    emptyStateMessage?: string;
    cols?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    className?: string;
}

/* -------------------------------------------------------------------------- */
/*                       Searchable Select Sub-Component                      */
/* -------------------------------------------------------------------------- */

interface SearchableSelectProps {
    field: FilterGroupConfig;
    selectedValue: any;
    onChange: (value: any) => void;
}

function SearchableSelect({ field, selectedValue, onChange }: SearchableSelectProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Only trigger dynamic lookups if empty or >= 2 characters
        if (field.onSearch && (value.trim().length === 0 || value.trim().length >= 2)) {
            field.onSearch(value);
        }
    };

    const options = field.options || [];

    // Local client-side filtering logic
    const filteredOptions = field.onSearch
        ? options
        : options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <div className="space-y-1.5">
            {field.searchable && (
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder={`Search ${field.label.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none transition-all font-medium"
                    />
                    {field.isLoading && (
                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 text-sm animate-spin">
                            progress_activity
                        </span>
                    )}
                </div>
            )}

            {/* Helper message when query is exactly 1 character */}
            {searchTerm.trim().length === 1 && field.onSearch && (
                <div className="text-[10px] text-white/40 px-1 italic">
                    Type at least 2 characters to search...
                </div>
            )}

            <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto border border-white/5 p-1 rounded-xl bg-white/[0.02]">
                {filteredOptions.length === 0 ? (
                    <div className="text-center py-2 text-xs text-white/30">
                        No results found
                    </div>
                ) : (
                    filteredOptions.map((opt) => {
                        const currentVal = selectedValue ?? 'all';
                        const isSelected = currentVal === opt.value;
                        return (
                            <button
                                key={String(opt.value)}
                                type="button"
                                onClick={() => onChange(opt.value)}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${isSelected
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                                    }`}
                            >
                                <span>{opt.label}</span>
                                {isSelected && (
                                    <span className="material-symbols-outlined text-xs text-accent-cyan">
                                        check
                                    </span>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                           Main GenericDataGrid                             */
/* -------------------------------------------------------------------------- */

export function GenericDataGrid<T>({
    items,
    renderItem,
    searchOption,
    filterOptions,
    sortOption,
    paginationData,
    onPageChange,
    onPageSizeChange,
    pageSizeValues = [4, 8, 12, 16, 20],
    isLoading = false,
    error = null,
    loadingMessage = "Loading dashboard assets...",
    errorTitle = "Network Error",
    errorMessage = "Failed to fetch remote parameters. Please try again.",
    emptyStateMessage = "No parameters found matching your active filters.",
    cols = { sm: 1, md: 2, lg: 4 },
    className = ""
}: GenericDataGridProps<T>) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [tempFilterValues, setTempFilterValues] = useState<Record<string, any>>(filterOptions?.values ?? {});

    const filterDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (filterOptions?.values) {
            setTempFilterValues(filterOptions.values);
        }
    }, [filterOptions?.values]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (error) {
        return <ErrorScreen title={errorTitle} message={errorMessage} />;
    }

    if (isLoading) {
        return <LoadingScreen message={loadingMessage} />;
    }

    const colStyles = `
        grid 
        grid-cols-${cols.sm || 1} 
        md:grid-cols-${cols.md || 2} 
        lg:grid-cols-${cols.lg || 3} 
        xl:grid-cols-${cols.xl || cols.lg || 4} 
        gap-4
    `.trim().replace(/\s+/g, ' ');

    const handleFieldChange = (fieldId: string, value: any) => {
        setTempFilterValues(prev => {
            const updated = { ...prev };
            if (value === 'all' || value === '') {
                delete updated[fieldId];
            } else {
                updated[fieldId] = value;
            }
            return updated;
        });
    };

    const handleApplyFilters = () => {
        if (filterOptions) {
            filterOptions.onChange(tempFilterValues);
        }
        setIsFilterOpen(false);
    };

    const handleResetFilters = () => {
        setTempFilterValues({});
        if (filterOptions) {
            filterOptions.onChange({});
        }
        setIsFilterOpen(false);
    };

    const handleSelectSort = (opt: SortOption) => {
        if (sortOption) {
            sortOption.onChange(opt.orderBy, opt.sortOrder);
        }
        setIsSortOpen(false);
    };

    const activeFiltersCount = filterOptions ? Object.keys(filterOptions.values).length : 0;
    const currentSortObj = sortOption?.options.find(
        opt => opt.orderBy === sortOption.currentOrderBy && opt.sortOrder === sortOption.currentSortOrder
    );

    return (
        <div className="space-y-6 w-full">
            {(searchOption || filterOptions || sortOption) && (
                <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#16171d]/80 to-[#0b0c10]/90 border border-white/5 backdrop-blur-xl shadow-lg relative z-10">
                    <div className="flex-1 max-w-md relative">
                        {searchOption && (
                            <>
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg pointer-events-none">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder={searchOption.placeholder || "Search database metrics..."}
                                    value={searchOption.value}
                                    onChange={(e) => searchOption.onChange(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 focus:border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all font-medium shadow-inner"
                                />
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        {sortOption && sortOption.options.length > 0 && (
                            <div className="relative" ref={sortDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSortOpen(!isSortOpen);
                                        setIsFilterOpen(false);
                                    }}
                                    className="h-10 px-4 rounded-lg flex items-center gap-2 text-xs font-bold tracking-wider uppercase bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-accent-cyan transition-all duration-300"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {sortOption.currentSortOrder === 'asc' ? 'sort_by_alpha' : 'filter_list_off'}
                                    </span>
                                    <span className="text-white/50 lowercase font-normal font-sans pr-1">sort:</span>
                                    <span>{currentSortObj?.label || "Order"}</span>
                                    <span className="material-symbols-outlined text-xs text-white/40 ml-1">keyboard_arrow_down</span>
                                </button>

                                {isSortOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#0b0c10] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl p-3 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-2 px-2">
                                            Sort Dataset By
                                        </div>
                                        <div className="space-y-0.5">
                                            {sortOption.options.map((opt, index) => {
                                                const isSelected = opt.orderBy === sortOption.currentOrderBy && opt.sortOrder === sortOption.currentSortOrder;
                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleSelectSort(opt)}
                                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${isSelected
                                                            ? 'bg-accent-cyan/10 text-accent-cyan'
                                                            : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                                                            }`}
                                                    >
                                                        <span>{opt.label}</span>
                                                        {isSelected && (
                                                            <span className="material-symbols-outlined text-xs">check</span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {filterOptions && (
                            <div className="relative" ref={filterDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsFilterOpen(!isFilterOpen);
                                        setIsSortOpen(false);
                                    }}
                                    className={`h-10 px-4 rounded-lg flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${activeFiltersCount > 0
                                        ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30 shadow-[0_0_15px_rgba(138,43,226,0.15)]'
                                        : 'bg-white/5 text-white/70 border-white/5 hover:border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">filter_list</span>
                                    <span>Filters</span>
                                    {activeFiltersCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-accent-purple text-[9px] font-black text-white ml-0.5 shadow-[0_0_8px_#8a2be2]">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                {isFilterOpen && (
                                    <div className="absolute right-0 mt-2 w-[24rem] rounded-xl bg-[#0b0c10] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl p-4 z-10 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                                        <div className="max-h-[24rem] overflow-y-auto pr-1 custom-scrollbar space-y-4">
                                            {filterOptions.fields.map((field) => (
                                                <div key={field.id} className="space-y-1.5">
                                                    <label className="text-[10px] font-black tracking-widest text-white/30 uppercase px-1">
                                                        {field.label}
                                                    </label>

                                                    {field.type === 'radio' && field.options && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {field.options.map((opt) => {
                                                                const currentVal = tempFilterValues[field.id] ?? 'all';
                                                                const isSelected = currentVal === opt.value;
                                                                return (
                                                                    <button
                                                                        key={String(opt.value)}
                                                                        type="button"
                                                                        onClick={() => handleFieldChange(field.id, opt.value)}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${isSelected
                                                                            ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30'
                                                                            : 'bg-white/5 text-white/40 border-transparent hover:text-white/70'
                                                                            }`}
                                                                    >
                                                                        {isSelected &&
                                                                            <span className={`w-1.5 h-1.5 rounded-full transition-all bg-accent-purple shadow-[0_0_6px_#8a2be2]`} />
                                                                        }
                                                                        <span>{opt.label}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {field.type === 'select' && (
                                                        <SearchableSelect
                                                            field={field}
                                                            selectedValue={tempFilterValues[field.id]}
                                                            onChange={(val) => handleFieldChange(field.id, val)}
                                                        />
                                                    )}

                                                    {field.type === 'date' && (
                                                        <input
                                                            type="date"
                                                            value={tempFilterValues[field.id] ?? ''}
                                                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white/80 focus:outline-none focus:border-accent-cyan/40 transition-colors scheme-dark"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                            <button
                                                type="button"
                                                onClick={handleResetFilters}
                                                className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-rose-400 bg-white/5 border border-white/5 hover:border-rose-500/20 transition-all"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleApplyFilters}
                                                className="flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-on-primary bg-primary hover:bg-primary/70 shadow-[0_0_15px_rgba(0,242,255,0.3)] transition-all transform active:scale-95"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {items.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center gap-2 glass-card rounded-xl border border-white/5 bg-white/5 text-white/30 text-center p-6 relative">
                    <span className="material-symbols-outlined text-4xl text-white/20">search_off</span>
                    <p className="text-sm font-medium">{emptyStateMessage}</p>
                </div>
            ) : (
                <div className={`${className || colStyles} relative`}>
                    {items.map((item, index) => (
                        <React.Fragment key={(item as any).id || index}>
                            {renderItem(item)}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {paginationData && paginationData.totalPages > 1 && (
                <div className="pt-2 relative">
                    <Pagination
                        page={paginationData.pageNumber}
                        totalPages={paginationData.totalPages}
                        pageSize={paginationData.pageSize}
                        totalCount={paginationData.totalCount}
                        onPageChange={onPageChange}
                        pageSizeOption={onPageSizeChange ? {
                            values: pageSizeValues,
                            onChange: onPageSizeChange
                        } : undefined}
                    />
                </div>
            )}
        </div>
    );
}