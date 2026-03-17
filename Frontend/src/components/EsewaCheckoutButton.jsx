import React, { useState } from 'react';
import axios from 'axios';

const EsewaPaymentButton = ({ bookingId, amount }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/payments/esewa/initiate', { bookingId });

            if (response.data.success) {
                // Submit form to eSewa
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = response.data.paymentUrl;

                Object.entries(response.data.paymentData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                throw new Error('Failed to initiate payment');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <div className="error-message">{error}</div>}
            <button
                onClick={handlePayment}
                disabled={loading || !bookingId}
            >
                {loading ? 'Processing...' : 'Pay with eSewa'}
            </button>
        </div>
    );
};