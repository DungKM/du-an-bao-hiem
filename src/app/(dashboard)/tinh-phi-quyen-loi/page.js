import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PremiumClient from "@/components/premium/PremiumClient";

export default async function TinhPhiQuyenLoiPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  await connectDB();
  const dbUser = await User.findById(session.user.id).lean();

  const agent = {
    name: dbUser?.name || session.user.name || "",
    phone: dbUser?.phone || "",
    email: dbUser?.email || "",
    bio: dbUser?.bio || "",
    avatarDataUrl: dbUser?.avatarDataUrl || "",
  };

  return (
    <Suspense fallback={null}>
      <PremiumClient agent={agent} />
    </Suspense>
  );
}
