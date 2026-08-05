import { connectDB } from "@/lib/mongodb";
import PlanLink from "@/models/PlanLink";
import Customer from "@/models/Customer";

// Public endpoint (no auth): a customer fills in their own financial plan
// through a single-use share link (/tu-van/[token]) and submits it here.
// The link is consumed (marked "used") on success so it can never be
// submitted again.
export async function POST(req) {
  const body = await req.json();
  const token = (body?.token || "").trim();
  const name = (body?.name || "").trim();

  if (!token) {
    return Response.json({ error: "Thiếu thông tin link chia sẻ." }, { status: 400 });
  }
  if (!name) {
    return Response.json({ error: "Vui lòng nhập tên của bạn trước khi lưu." }, { status: 400 });
  }

  await connectDB();

  const link = await PlanLink.findOne({ token });
  if (!link) {
    return Response.json({ error: "Link không tồn tại." }, { status: 404 });
  }
  if (link.status !== "pending") {
    return Response.json({ error: "Link này đã được sử dụng và không còn hiệu lực." }, { status: 410 });
  }

  const customer = await Customer.create({
    owner: link.owner,
    name,
    phone: (body.phone || "").trim(),
    email: (body.email || "").trim(),
    dob: (body.dob || "").trim(),
    gender: (body.gender || "").trim(),
    financialPlan: body.financialPlan || null,
    expectedFee: body.expectedFee || 0,
    source: "public",
  });

  link.status = "used";
  link.usedAt = new Date();
  link.customer = customer._id;
  await link.save();

  return Response.json({ customer: { _id: customer._id, name: customer.name } }, { status: 201 });
}
