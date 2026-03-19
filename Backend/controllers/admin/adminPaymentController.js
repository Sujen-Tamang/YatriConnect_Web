import { Payment } from '../../models/Payment.js';

// GET /api/v1/admin/payments
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email phone')
            .populate({
                path: 'booking',
                populate: {
                    path: 'bus',
                    select: 'yatayatName route travelDate'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching payments'
        });
    }
};

// GET /api/v1/admin/payments/stats
export const getPaymentStats = async (req, res) => {
    try {
        const stats = await Payment.aggregate([
            {
                $group: {
                    _id: '$status',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching payment stats'
        });
    }
};
