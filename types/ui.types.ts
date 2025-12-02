export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface SearchFilters {
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
