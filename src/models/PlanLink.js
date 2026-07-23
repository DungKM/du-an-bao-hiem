import mongoose from "mongoose";

// A single-use share link: an agent generates one from the Hoạch Định Tài
// Chính page and sends it to a customer. Once the customer fills in the form
// and saves, the link is marked "used" and can never be submitted again.
const PlanLinkSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "used"], default: "pending" },
    usedAt: { type: Date, default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.PlanLink || mongoose.model("PlanLink", PlanLinkSchema);
