import { useState, useEffect, useCallback } from 'react';
import axios from '@/lib/api/axios';
import { ApiState } from '@/types/ui.types';

interface UseApiDataOptions<T = unknown> {
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useApiData<T>(
  url: string,
  options: UseApiDataOptions<T> = {}
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
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      const errorMessage =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'An error occurred';

      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
  // Note: This pattern is intentional for data fetching on mount. The fetchData function
  // is wrapped in useCallback and includes proper state management.
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
