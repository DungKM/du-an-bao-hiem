import crypto from "crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import PlanLink from "@/models/PlanLink";

// Creates a new single-use share link for the logged-in agent.
export async function POST() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const token = crypto.randomBytes(16).toString("hex");
  const link = await PlanLink.create({ owner: session.user.id, token });

  return Response.json({ token: link.token }, { status: 201 });
}
