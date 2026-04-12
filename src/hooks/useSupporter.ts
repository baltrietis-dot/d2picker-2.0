import { useState, useCallback } from 'react';

const STORAGE_KEY = 'd2picker_supporter';
// Change this code whenever you want to rotate it (e.g. per month)
const VALID_CODE = 'D2PRO2025';

export const useSupporter = () => {
    const [isSupporter, setIsSupporter] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY) === VALID_CODE;
    });

    const unlock = useCallback((code: string): boolean => {
        if (code.trim().toUpperCase() === VALID_CODE) {
            localStorage.setItem(STORAGE_KEY, VALID_CODE);
            setIsSupporter(true);
            return true;
        }
        return false;
    }, []);

    return { isSupporter, unlock };
};
