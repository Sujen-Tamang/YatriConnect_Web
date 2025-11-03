import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../config.env') });

const connectDB = async () => {
  mongoose
      .connect(process.env.MONGO_URI, {
        dbName: "YatruSewa",
      })
      .then(() => {
        console.log("Connected to database.");
      })
      .catch((err) => {
        console.log(`Some error occured while connecting to database: ${err}`);
      });
};

export default connectDB;