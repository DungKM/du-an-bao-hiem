import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import NumerologyClient from "@/components/numerology/NumerologyClient";

export default async function ThanSoHocPage() {
  const session = await auth();
  await connectDB();
  const dbUser = await User.findById(session.user.id).lean();

  const agent = {
    name: dbUser?.name || session.user.name,
    phone: dbUser?.phone || "",
    email: dbUser?.email || "",
    bio: dbUser?.bio || "",
  };

  return <NumerologyClient agent={agent} />;
}
