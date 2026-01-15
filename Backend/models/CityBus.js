import mongoose from 'mongoose';

const cityBusSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    route: {
        from: { 
            name: { type: String, required: true },
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 }
        },
        to: { 
            name: { type: String, required: true },
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 }
        },
        stops: [{
            name: { type: String, required: true },
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 }
        }]
    },
    active: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['on-route', 'break', 'offline'],
        default: 'offline'
    },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        updatedAt: { type: Date, default: Date.now }
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('CityBus', cityBusSchema);
