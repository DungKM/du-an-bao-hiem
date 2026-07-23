import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

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
    <div className="min-h-screen flex flex-col">
      <Topbar user={user} daysLeft={daysLeft} />
      <div className="flex-1 flex justify-center">
        <div className="flex w-full max-w-7xl">
          <Sidebar isAdmin={user.role === "admin"} />
          <main className="flex-1 p-6 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
