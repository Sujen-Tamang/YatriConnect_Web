import mongoose from 'mongoose';

const cityBusRideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CityBus',
        required: true
    },
    checkInTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkOutTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'cancelled'],
        default: 'ongoing'
    }
});

export default mongoose.model('CityBusRide', cityBusRideSchema);
