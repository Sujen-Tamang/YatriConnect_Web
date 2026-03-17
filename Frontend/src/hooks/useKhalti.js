// src/hooks/useKhalti.js
import { useEffect, useState } from 'react';

const useKhalti = () => {
    const [khaltiLoaded, setKhaltiLoaded] = useState(false);

    useEffect(() => {
        // Check if Khalti is already loaded
        if (window.KhaltiCheckout) {
            setKhaltiLoaded(true);
            return;
        }

        // Function to handle script loading
        const loadScript = () => {
            const script = document.createElement('script');
            script.src = 'https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js';
            script.async = true;

            script.onload = () => {
                setKhaltiLoaded(true);
            };

            script.onerror = () => {
                console.error('Failed to load Khalti script');
                setKhaltiLoaded(false);
            };

            document.body.appendChild(script);
        };

        // Check if we're in the browser environment
        if (typeof window !== 'undefined') {
            loadScript();
        }

        // Cleanup function
        return () => {
            if (window.KhaltiCheckout) {
                // Remove the script if needed
                const scripts = document.querySelectorAll(
                    'script[src="https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js"]'
                );
                scripts.forEach(script => {
                    document.body.removeChild(script);
                });
            }
        };
    }, []);

    return khaltiLoaded;
};

export default useKhalti;