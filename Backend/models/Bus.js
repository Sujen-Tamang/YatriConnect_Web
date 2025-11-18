import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        uppercase: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookingDate: {
        type: Date
    },
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reservedUntil: {
        type: Date
    }
}, { _id: false });

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    yatayatName: {
        type: String,
        required: false,
        trim: true
    },
    route: {
        from: { type: String },
        to: { type: String },
        stops: [{ type: String }],
        distance: { type: String },
        duration: { type: String }
    },
    schedule: {
        departure: { type: String },
        arrival: { type: String },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'daily'
        }
    },
    seats: [seatSchema],
    totalSeats: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    price: {
        type: Number,
        required: true,
        min: 0
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


// Auto-generate seats on new bus creation
busSchema.pre('save', function(next) {
    if (this.isNew) {
        const rows = Math.ceil(this.totalSeats / 4);
        this.seats = [];

        for (let row = 1; row <= rows; row++) {
            for (let col = 1; col <= 4; col++) {
                if (this.seats.length < this.totalSeats) {
                    this.seats.push({
                        number: `${row}${String.fromCharCode(64 + col)}`,
                        isBooked: false
                    });
                }
            }
        }
    }
    next();
});

export default mongoose.model('Bus', busSchema);
