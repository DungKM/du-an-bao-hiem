import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    name: { type: String, trim: true },
    title: { type: String, trim: true, default: "" },
    avatarDataUrl: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "agent"], default: "agent" },
    bio: { type: String, default: "" },
    trialStartedAt: { type: Date, default: Date.now },
    trialDays: { type: Number, default: 14 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
