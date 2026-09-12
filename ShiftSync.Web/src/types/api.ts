

export type ApiResponse<T> = {
    data: T;
    message: string;
    status: number;
}

export interface PaginationResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    itemsCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface PaginationFilter {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: string;
    search?: string;
}

export interface Lookup {
    id: string;
    name: string;
    imageUrl?: string;
}
export interface LookupOption<TValue = number | string> {
    value: TValue;
    label: string;
    [key: string]: any;
}

export interface BaseEntity {
    id: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}