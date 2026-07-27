import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PhuongAnDaLuuClient from "@/components/saved-plans/PhuongAnDaLuuClient";

export default async function PhuongAnDaLuuPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return <PhuongAnDaLuuClient />;
}
