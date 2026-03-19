import mongoose from "mongoose";

const legalDocSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true, // e.g., 'terms', 'privacy', 'cancellation'
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "draft"],
    default: "active",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const LegalDoc = mongoose.model("LegalDoc", legalDocSchema);

export default LegalDoc;
