import crypto from 'crypto';
import axios from 'axios';

export const generateEsewaSignature = (amount, transactionId, productCode, secretKey) => {
    const signatureString = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${productCode}`;
    return crypto
        .createHmac('sha256', secretKey)
        .update(signatureString)
        .digest('base64');
};

export const verifyEsewaPayment = async (config, transactionId, amount, refId = null) => {
    const { baseUrl, merchantId } = config;

    try {
        // Try new status API first
        const statusResponse = await axios.get(`${baseUrl}/api/epay/transaction/status`, {
            params: {
                merchant_id: merchantId,
                transaction_id: transactionId,
            }
        });

        if (statusResponse.data?.status === 'SUCCESS') {
            return statusResponse.data;
        }

        // Fallback to legacy verification if needed
        if (refId) {
            const legacyResponse = await axios.post(`${baseUrl}/epay/transrec`, {
                amt: amount,
                rid: refId,
                pid: transactionId,
                scd: merchantId,
            }, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (legacyResponse.data?.response_code === 'Success') {
                return {
                    status: 'SUCCESS',
                    transaction_code: refId,
                    amount: parseFloat(amount)
                };
            }
        }

        return { status: 'NOT_FOUND' };
    } catch (error) {
        console.error('eSewa verification error:', error);
        return { status: 'ERROR', message: error.message };
    }
};