import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PlanClient from "@/components/plan/PlanClient";
import ModuleHeader from "@/components/ModuleHeader";

export default async function HoachDinhTaiChinhPage() {
  const session = await auth();
  await connectDB();
  const dbUser = await User.findById(session.user.id).lean();

  const agent = {
    name: dbUser?.name || session.user.name,
    phone: dbUser?.phone || "",
    email: dbUser?.email || "",
    bio: dbUser?.bio || "",
    avatarDataUrl: dbUser?.avatarDataUrl || "",
  };

  return (
    <div>
      <ModuleHeader icon="📊" title="Hoạch Định Tài Chính" module={2} />
      <PlanClient agent={agent} />
    </div>
  );
}
