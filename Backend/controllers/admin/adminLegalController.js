import LegalDoc from "../../models/LegalDoc.js";

// ── GET ALL LEGAL DOCS ──────────────────────────────────────────
export const getAllLegalDocs = async (req, res) => {
  try {
    const docs = await LegalDoc.find().sort({ title: 1 });
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET LEGAL DOC BY SLUG ────────────────────────────────────────
export const getLegalDocBySlug = async (req, res) => {
  try {
    const doc = await LegalDoc.findOne({ slug: req.params.slug });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Policy document not found" });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPSERT LEGAL DOC (ADD/UPDATE) ─────────────────────────────────
export const upsertLegalDoc = async (req, res) => {
  const { title, slug, content, status } = req.body;
  try {
    const doc = await LegalDoc.findOneAndUpdate(
      { slug },
      { title, content, status, lastUpdated: Date.now() },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: "Policy synchronized", data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE LEGAL DOC ──────────────────────────────────────────────
export const deleteLegalDoc = async (req, res) => {
  try {
    const doc = await LegalDoc.findOneAndDelete({ slug: req.params.slug });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Policy document does not exist" });
    }
    res.status(200).json({ success: true, message: "Policy removed from registry" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
