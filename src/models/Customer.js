import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    source: { type: String, enum: ["agent", "public"], default: "agent" },
    status: {
      type: String,
      enum: ["Chưa liên hệ", "Đã liên hệ", "Đã gửi tóm tắt QL", "Đã chốt HĐ", "Từ chối"],
      default: "Chưa liên hệ",
    },
    expectedFee: { type: Number, default: 0 },
    nextAction: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    financialPlan: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
