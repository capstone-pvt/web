import { useState, useEffect, useCallback } from 'react';
import axios from '@/lib/api/axios';
import { ApiState } from '@/types/ui.types';

interface UseApiDataOptions {
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApiData<T>(
  url: string,
  options: UseApiDataOptions = {}
): ApiState<T> & {
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
} {
  const { autoFetch = true, onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: autoFetch,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.get(url);
      const data = response.data.success ? response.data.data : response.data;

      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        'An error occurred';

      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    refetch: fetchData,
    setData,
  };
}
