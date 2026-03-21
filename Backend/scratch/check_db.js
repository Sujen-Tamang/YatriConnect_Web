import mongoose from 'mongoose';
import CityBus from '../models/CityBus.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './config/config.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const count = await CityBus.countDocuments();
        console.log('Total City Buses:', count);
        const activeCount = await CityBus.countDocuments({ active: true });
        console.log('Active City Buses:', activeCount);
        
        if (count > 0 && activeCount === 0) {
            console.log('Activating all buses for testing...');
            await CityBus.updateMany({}, { active: true });
            console.log('All buses activated.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
