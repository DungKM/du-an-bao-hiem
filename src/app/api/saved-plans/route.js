import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import SavedPlan from "@/models/SavedPlan";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const savedPlans = await SavedPlan.find({ owner: session.user.id }).sort({ updatedAt: -1 }).lean();
  return Response.json({ savedPlans });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body?.name?.trim()) {
    return Response.json({ error: "Tên phương án là bắt buộc." }, { status: 400 });
  }

  await connectDB();
  const savedPlan = await SavedPlan.create({
    owner: session.user.id,
    name: body.name.trim(),
    designDate: body.designDate || "",
    mainProduct: body.mainProduct || null,
    people: body.people || [],
    totalPremium: body.totalPremium || 0,
  });

  return Response.json({ savedPlan }, { status: 201 });
}
