import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook that calls onClose when the route changes.
 * Useful for closing modals/sheets when navigation occurs.
 */
export function useCloseOnNavigation(
  isOpen: boolean,
  onClose: () => void,
  closeOnNavigation: boolean = true
) {
  const location = useLocation();

  useEffect(() => {
    if (isOpen && closeOnNavigation) {
      // Close when location changes
      onClose();
    }
    // Only trigger on location change, not on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);
}
