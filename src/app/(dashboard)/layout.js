import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  let daysLeft = null;
  if (user.role !== "admin") {
    await connectDB();
    const dbUser = await User.findById(user.id).lean();
    if (dbUser) {
      const elapsedMs = Date.now() - new Date(dbUser.trialStartedAt).getTime();
      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      daysLeft = (dbUser.trialDays ?? 14) - elapsedDays;
    }
  }

  return (
    <DashboardShell user={user} daysLeft={daysLeft} isAdmin={user.role === "admin"}>
      {children}
    </DashboardShell>
  );
}
