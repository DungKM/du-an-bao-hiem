import mongoose from "mongoose";

const SavedPlanSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    designDate: { type: String, trim: true, default: "" },
    mainProduct: { type: mongoose.Schema.Types.Mixed, default: null },
    people: { type: mongoose.Schema.Types.Mixed, default: [] },
    totalPremium: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.SavedPlan || mongoose.model("SavedPlan", SavedPlanSchema);
