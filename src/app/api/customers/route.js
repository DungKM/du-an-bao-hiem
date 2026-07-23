import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

export async function GET(req) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const query = { owner: session.user.id };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const customers = await Customer.find(query).sort({ updatedAt: -1 }).lean();
  return Response.json({ customers });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body?.name?.trim()) {
    return Response.json({ error: "Tên khách hàng là bắt buộc." }, { status: 400 });
  }

  await connectDB();
  const customer = await Customer.create({
    owner: session.user.id,
    name: body.name.trim(),
    location: body.location || "",
    expectedFee: body.expectedFee || 0,
    nextAction: body.nextAction || "",
    status: body.status || "Chưa liên hệ",
    notes: body.notes || "",
  });

  return Response.json({ customer }, { status: 201 });
}
