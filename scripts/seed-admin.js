/* eslint-disable no-console */
const fs = require("fs");
const dotenv = require("dotenv");
// Support either .env or .env.local — load .env first, then let .env.local
// override it if both happen to exist.
if (fs.existsSync(".env")) dotenv.config({ path: ".env" });
if (fs.existsSync(".env.local")) dotenv.config({ path: ".env.local", override: true });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI (check your .env.local file).");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const UserSchema = new mongoose.Schema(
    {
      username: String,
      email: String,
      phone: String,
      name: String,
      passwordHash: String,
      role: String,
      bio: String,
      trialStartedAt: Date,
      trialDays: Number,
    },
    { timestamps: true }
  );
  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  const username = process.env.ADMIN_SEED_USERNAME || "admin";
  const password = process.env.ADMIN_SEED_PASSWORD || "changeme123";

  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`Admin account "${username}" already exists. Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    username,
    email: process.env.ADMIN_SEED_EMAIL || "",
    phone: process.env.ADMIN_SEED_PHONE || "",
    name: process.env.ADMIN_SEED_NAME || "Quan Tri Vien",
    passwordHash,
    role: "admin",
    trialDays: 36500,
  });

  console.log(`Created admin account. username="${username}" password="${password}"`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
