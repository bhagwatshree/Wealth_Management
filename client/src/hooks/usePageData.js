import { useState, useCallback } from 'react';
import { parseApiError } from '../utils/errorHelper';

/**
 * Hook for loading page data with error handling.
 * Returns { rows, loading, pageError, clearPageError, load }
 *
 * Usage:
 *   const { rows, loading, pageError, clearPageError, load } = usePageData(fetchFn);
 *
 * For transforms (e.g. data.pageItems):
 *   const { rows, loading, pageError, clearPageError, load } = usePageData(fetchFn, data => data.pageItems || data);
 */
export default function usePageData(fetchFn, transform) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setPageError(null);
    fetchFn()
      .then(data => {
        setRows(transform ? transform(data) : data);
      })
      .catch(err => {
        setPageError(parseApiError(err));
      })
      .finally(() => setLoading(false));
  }, [fetchFn, transform]);

  return { rows, setRows, loading, pageError, clearPageError: () => setPageError(null), load };
}
