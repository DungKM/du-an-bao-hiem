import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import SavedPlan from "@/models/SavedPlan";

async function findOwned(id, ownerId) {
  const savedPlan = await SavedPlan.findOne({ _id: id, owner: ownerId });
  return savedPlan;
}

export async function GET(req, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const savedPlan = await findOwned(params.id, session.user.id);
  if (!savedPlan) return Response.json({ error: "Không tìm thấy." }, { status: 404 });

  return Response.json({ savedPlan });
}

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const savedPlan = await findOwned(params.id, session.user.id);
  if (!savedPlan) return Response.json({ error: "Không tìm thấy." }, { status: 404 });

  const fields = ["name", "designDate", "mainProduct", "people", "totalPremium"];
  for (const f of fields) {
    if (body[f] !== undefined) savedPlan[f] = body[f];
  }
  await savedPlan.save();

  return Response.json({ savedPlan });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const savedPlan = await findOwned(params.id, session.user.id);
  if (!savedPlan) return Response.json({ error: "Không tìm thấy." }, { status: 404 });

  await savedPlan.deleteOne();
  return Response.json({ ok: true });
}
