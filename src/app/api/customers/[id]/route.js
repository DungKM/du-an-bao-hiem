import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

async function findOwned(id, ownerId) {
  const customer = await Customer.findOne({ _id: id, owner: ownerId });
  return customer;
}

export async function GET(req, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const customer = await findOwned(params.id, session.user.id);
  if (!customer) return Response.json({ error: "Không tìm thấy." }, { status: 404 });

  return Response.json({ customer });
}

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const customer = await findOwned(params.id, session.user.id);
  if (!customer) return Response.json({ error: "Không tìm thấy." }, { status: 404 });

  const fields = ["name", "location", "status", "expectedFee", "nextAction", "notes", "financialPlan"];
  for (const f of fields) {
    if (body[f] !== undefined) customer[f] = body[f];
  }
  await customer.save();

  return Response.json({ customer });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const customer = await findOwned(params.id, session.user.id);
  if (!customer) return Response.json({ error: "Không tìm thấy." }, { status: 404 });

  await customer.deleteOne();
  return Response.json({ ok: true });
}
