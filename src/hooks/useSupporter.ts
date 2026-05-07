import { useCallback } from 'react';

// Paywall temporarily disabled — all users get premium access until real
// premium-only features ship. Restore the localStorage + code-check logic
// (see git history) when re-enabling.
export const useSupporter = () => {
    const unlock = useCallback((_code: string): boolean => true, []);
    return { isSupporter: true, unlock };
};
