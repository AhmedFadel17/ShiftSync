import React, { useState, useRef, useEffect } from 'react';
import Pagination from '../Pagination';
import { ErrorScreen, LoadingScreen } from '@/components/ui/Feedback/StatusScreens';

export interface TableColumn<T> {
    key: string;
    header: React.ReactNode;
    render?: (item: T, index: number) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
    sortable?: boolean;
    editable?: boolean;
    editRender?: (item: T, onChange: (val: Partial<T>) => void, index: number) => React.ReactNode;
}

export interface TableAction<T> {
    label: string;
    icon?: string;
    onClick?: (item: T) => void;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
    disabled?: (item: T) => boolean;
    show?: (item: T) => boolean;
    isEditAction?: boolean;
}

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
}

interface FilterConfig {
    fields: FilterGroupConfig[];
    values: Record<string, any>;
    onChange: (nextValues: Record<string, any>) => void;
}

interface SortOption {
    label: string;
    orderBy: string;
    sortOrder?: 'asc' | 'desc';
}

interface SortConfig {
    options: SortOption[];
    currentOrderBy?: string;
    currentSortOrder?: 'asc' | 'desc';
    onChange: (orderBy: string | undefined, sortOrder: 'asc' | 'desc' | undefined) => void;
}

interface PaginationMetadata {
    pageNumber: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
}

interface GenericTableProps<T> {
    items: T[];
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    actionsHeader?: React.ReactNode;
    actionsAlign?: 'left' | 'center' | 'right';
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
    className?: string;
    tableClassName?: string;
    responsiveStyle?: 'scroll' | 'stacked';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (orderBy: string | undefined, sortOrder: 'asc' | 'desc' | undefined) => void;
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    onSaveRow?: (updatedItem: T, index: number) => Promise<void> | void;
}

export function GenericTable<T>({
    items,
    columns,
    actions,
    actionsHeader = "Actions",
    actionsAlign = "right",
    searchOption,
    filterOptions,
    sortOption,
    paginationData,
    onPageChange,
    onPageSizeChange,
    pageSizeValues = [4, 8, 12, 16, 20],
    isLoading = false,
    error = null,
    loadingMessage = "Loading table records...",
    errorTitle = "Failed to Fetch Data",
    errorMessage = "Failed to load the requested database records. Please try again.",
    emptyStateMessage = "No matching records found.",
    className = "",
    tableClassName = "",
    responsiveStyle = "stacked",
    sortBy,
    sortOrder,
    onSort,
    defaultSortBy,
    defaultSortOrder,
    onSaveRow
}: GenericTableProps<T>) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [tempFilterValues, setTempFilterValues] = useState<Record<string, any>>(filterOptions?.values ?? {});

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<T | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const [internalSortBy, setInternalSortBy] = useState<string | undefined>(defaultSortBy);
    const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc' | undefined>(defaultSortOrder);

    const currentSortBy = sortOption
        ? sortOption.currentOrderBy
        : (sortBy !== undefined ? sortBy : internalSortBy);

    const currentSortOrder = sortOption
        ? sortOption.currentSortOrder
        : (sortOrder !== undefined ? sortOrder : internalSortOrder);

    const isControlledSort = typeof onSort === 'function' || sortOption !== undefined || sortBy !== undefined;

    const handleSort = (key: string) => {
        let nextOrder: 'asc' | 'desc' | undefined = 'asc';
        let nextOrderBy: string | undefined = key;

        if (currentSortBy === key) {
            if (currentSortOrder === 'asc') {
                nextOrder = 'desc';
                nextOrderBy = key;
            } else if (currentSortOrder === 'desc') {
                nextOrder = undefined;
                nextOrderBy = undefined;
            } else {
                nextOrder = 'asc';
                nextOrderBy = key;
            }
        }

        if (sortOption) {
            sortOption.onChange(nextOrderBy, nextOrder);
        } else if (onSort) {
            onSort(nextOrderBy, nextOrder);
        } else {
            setInternalSortBy(nextOrderBy);
            setInternalSortOrder(nextOrder);
        }
    };

    const handleStartEdit = (item: T, index: number) => {
        setEditingIndex(index);
        setEditValues({ ...item });
    };

    const handleSave = async (index: number) => {
        if (!editValues) return;
        setIsSaving(true);
        try {
            if (onSaveRow) {
                await onSaveRow(editValues, index);
            }
            setEditingIndex(null);
            setEditValues(null);
        } catch (err) {
            console.error("Failed to save row changes:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setEditValues(null);
    };

    const sortedItems = React.useMemo(() => {
        if (isControlledSort || !currentSortBy || !currentSortOrder) {
            return items;
        }

        const getNestedValue = (obj: any, path: string) => {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        return [...items].sort((a, b) => {
            const aVal = getNestedValue(a, currentSortBy);
            const bVal = getNestedValue(b, currentSortBy);

            if (aVal === undefined || aVal === null) return 1;
            if (bVal === undefined || bVal === null) return -1;

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return currentSortOrder === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (aVal < bVal) return currentSortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return currentSortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [items, currentSortBy, currentSortOrder, isControlledSort]);

    if (error) {
        return <ErrorScreen title={errorTitle} message={errorMessage} />;
    }

    if (isLoading) {
        return <LoadingScreen message={loadingMessage} />;
    }

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

    const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
        if (align === 'center') return 'text-center';
        if (align === 'right') return 'text-right';
        return 'text-left';
    };

    const getAlignmentJustify = (align?: 'left' | 'center' | 'right') => {
        if (align === 'center') return 'justify-center';
        if (align === 'right') return 'justify-end';
        return 'justify-start';
    };

    const getActionVariantClass = (variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent') => {
        switch (variant) {
            case 'primary':
                return 'text-accent-purple hover:text-white bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/20';
            case 'accent':
                return 'text-accent-cyan hover:text-white bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/20';
            case 'danger':
                return 'text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10';
            case 'secondary':
                return 'text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10';
            case 'ghost':
            default:
                return 'text-white/40 hover:text-white/80 hover:bg-white/5';
        }
    };

    const renderActionButtons = (item: T, index: number) => {
        if (editingIndex === index) {
            return (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleSave(index)}
                        disabled={isSaving}
                        title="Save"
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-accent-cyan hover:text-white bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/20 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        {isSaving ? (
                            <span className="material-symbols-outlined text-base animate-spin">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-base">save</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        title="Cancel"
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
            );
        }

        if (!actions) return null;
        return actions
            .filter(act => !act.show || act.show(item))
            .map((act, idx) => {
                const disabled = act.disabled?.(item) ?? false;
                const handleClick = () => {
                    if (disabled) return;
                    if (act.isEditAction) {
                        handleStartEdit(item, index);
                    } else if (act.onClick) {
                        act.onClick(item);
                    }
                };
                return (
                    <button
                        key={idx}
                        onClick={handleClick}
                        disabled={disabled}
                        title={act.label}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-headline font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none ${getActionVariantClass(act.variant)} ${act.className || ''}`}
                    >
                        {act.icon && (
                            <span className="material-symbols-outlined text-base">
                                {act.icon}
                            </span>
                        )}
                    </button>
                );
            });
    };

    return (
        <div className={`space-y-6 w-full ${className}`}>
            {/* Header Toolbar (Search, Sort, Filter) */}
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
                                    placeholder={searchOption.placeholder || "Search table..."}
                                    value={searchOption.value}
                                    onChange={(e) => searchOption.onChange(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 focus:border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-all font-medium shadow-inner"
                                />
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        {/* Sort Dropdown */}
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
                                            Sort By
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

                        {/* Filters Dropdown */}
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

                                                    {field.type === 'select' && field.options && (
                                                        <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto border border-white/5 p-1 rounded-xl bg-white/[0.02]">
                                                            {field.options.map((opt) => {
                                                                const currentVal = tempFilterValues[field.id] ?? 'all';
                                                                const isSelected = currentVal === opt.value;
                                                                return (
                                                                    <button
                                                                        key={String(opt.value)}
                                                                        type="button"
                                                                        onClick={() => handleFieldChange(field.id, opt.value)}
                                                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${isSelected
                                                                            ? 'bg-white/10 text-white'
                                                                            : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                                                                            }`}
                                                                    >
                                                                        <span>{opt.label}</span>
                                                                        {isSelected && (
                                                                            <span className="material-symbols-outlined text-xs text-accent-cyan">check</span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
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

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center gap-2 glass-card rounded-xl border border-white/5 bg-white/5 text-white/30 text-center p-6 relative">
                    <span className="material-symbols-outlined text-4xl text-white/20">search_off</span>
                    <p className="text-sm font-medium">{emptyStateMessage}</p>
                </div>
            ) : (
                /* Table Content Container */
                <div className={`w-full ${responsiveStyle === 'scroll' ? 'overflow-x-auto custom-scrollbar' : 'overflow-hidden'}`}>

                    {/* Desktop View (Standard Table) */}
                    <table className={`${responsiveStyle === 'scroll' ? 'min-w-full' : 'w-full'} border-collapse ${responsiveStyle === 'stacked' ? 'hidden md:table' : 'table'} ${tableClassName}`}>
                        <thead>
                            <tr className="p-4 rounded-xl bg-gradient-to-r from-[#16171d]/80 to-[#0b0c10]/90 border border-white/5 backdrop-blur-xl shadow-lg relative font-bold uppercase tracking-wider text-xs text-white/40">
                                {columns.map((col) => {
                                    const isSortable = col.sortable;
                                    const isActive = currentSortBy === col.key;
                                    return (
                                        <th
                                            key={col.key}
                                            onClick={() => isSortable && handleSort(col.key)}
                                            className={`px-6 py-4 ${isSortable ? 'cursor-pointer select-none group/th hover:bg-white/[0.02] hover:text-white/80' : ''} ${getAlignmentClass(col.align)} ${col.className || ''}`}
                                        >
                                            <div className={`flex items-center gap-1.5 ${getAlignmentJustify(col.align)}`}>
                                                <span>{col.header}</span>
                                                {isSortable && (
                                                    <span className={`material-symbols-outlined text-[16px] transition-all ${isActive ? 'text-accent-cyan font-bold scale-110' : 'text-white/20 group-hover/th:text-white/50'}`}>
                                                        {isActive ? (currentSortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                                {actions && actions.length > 0 && (
                                    <th className={`px-6 py-4 ${getAlignmentClass(actionsAlign)}`}>
                                        {actionsHeader}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03] text-xs font-medium text-white/70">
                            {sortedItems.map((item, index) => (
                                <tr
                                    key={String((item as any).id || (item as any)._id || index)}
                                    className="hover:bg-white/[0.01] transition-colors group"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-6 py-4 ${getAlignmentClass(col.align)} ${col.className || ''}`}
                                        >
                                            {editingIndex === index && (col.editable || col.editRender) ? (
                                                col.editRender ? (
                                                    col.editRender(editValues!, (val) => setEditValues(prev => ({ ...prev, ...val } as T)), index)
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={(editValues as any)?.[col.key] || ''}
                                                        onChange={(e) => setEditValues(prev => ({ ...prev, [col.key]: e.target.value } as any))}
                                                        className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan/40 transition-colors"
                                                    />
                                                )
                                            ) : (
                                                col.render ? col.render(item, index) : (item as any)[col.key]
                                            )}
                                        </td>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <td className={`px-6 py-4`}>
                                            <div className={`flex items-center gap-2 ${getAlignmentJustify(actionsAlign)}`}>
                                                {renderActionButtons(item, index)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Stacked View (Cards Layout) */}
                    {responsiveStyle === 'stacked' && (
                        <div className="flex flex-col gap-4 md:hidden">
                            {sortedItems.map((item, index) => {
                                const isEditing = editingIndex === index;
                                return (
                                    <div
                                        key={String((item as any).id || (item as any)._id || index)}
                                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3"
                                    >
                                        {columns.map((col) => (
                                            <div
                                                key={col.key}
                                                className="flex justify-between items-center gap-4 py-2 border-b border-white/[0.02] last:border-b-0"
                                            >
                                                <div className="text-[10px] font-headline font-bold uppercase tracking-wider text-white/40">
                                                    {col.header}
                                                </div>
                                                <div className={`text-xs text-white/80 ${col.className || ''}`}>
                                                    {isEditing && (col.editable || col.editRender) ? (
                                                        col.editRender ? (
                                                            col.editRender(editValues!, (val) => setEditValues(prev => ({ ...prev, ...val } as T)), index)
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={(editValues as any)?.[col.key] || ''}
                                                                onChange={(e) => setEditValues(prev => ({ ...prev, [col.key]: e.target.value } as any))}
                                                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent-cyan/40 transition-colors text-right max-w-[150px] w-full"
                                                            />
                                                        )
                                                    ) : (
                                                        col.render ? col.render(item, index) : (item as any)[col.key]
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {actions && actions.length > 0 && (
                                            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-white/5 mt-3">
                                                {renderActionButtons(item, index)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
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
