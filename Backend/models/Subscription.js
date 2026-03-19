import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planType: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly'],
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending'],
        default: 'pending'
    },
    paymentDetails: {
        idx: { type: String },
        amount: { type: Number },
        mobile: { type: String },
        product_identity: { type: String },
        product_name: { type: String }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Helper to determine active status
subscriptionSchema.methods.isActive = function() {
    return this.status === 'active' && this.endDate > new Date();
};

export default mongoose.model('Subscription', subscriptionSchema);
