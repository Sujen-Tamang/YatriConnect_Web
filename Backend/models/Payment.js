import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({ 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    pidx: { // Khalti's unique payment identifier
        type: String,
        sparse: true // Allows multiple null/missing values if not provided
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['initiated', 'completed', 'failed', 'pending'],
        default: 'initiated'
    },
    payment_method: {
        type: String,
        enum: ['khalti','esewa'],
        required: true
    },
    transactionId: {
        type: String
    },
    refunded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
