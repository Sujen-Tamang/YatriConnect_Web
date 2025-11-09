import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from './models/userModel.js';

dotenv.config({ path: './config.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@yatrusewa.com';
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log('Admin already exists.');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            name: 'System Admin',
            email: email,
            phone: '+9779800000000',
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });

        console.log('Admin user created successfully.');
        console.log('Email: admin@yatrusewa.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
