import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
    from: {
        type: String,
        required: [true, 'Please enter departure city']
    },
    to: {
        type: String,
        required: [true, 'Please enter destination city']
    },
    distance: {
        type: String,
        required: [true, 'Please enter travel distance']
    },
    duration: {
        type: String,
        required: [true, 'Please enter estimated travel time']
    },
    price: {
        type: Number,
        required: [true, 'Please enter ticket price']
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: [true, 'Please assign a bus to this route']
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    schedule: {
        departure: { type: String, required: true },
        arrival: { type: String, required: true },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'daily'
        }
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('Route', routeSchema);
