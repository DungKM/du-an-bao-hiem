import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/");
  }
  return <AdminClient />;
}
