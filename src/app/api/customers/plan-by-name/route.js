import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";

// Saves (upserts) a financial plan under a customer name. If a customer
// with the same name (case-insensitive) already exists for this agent,
// the plan is attached to that record instead of creating a duplicate.
export async function POST(req) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = (body?.name || "").trim();
  if (!name) {
    return Response.json({ error: "Vui lòng nhập tên khách hàng trước khi lưu." }, { status: 400 });
  }

  await connectDB();

  let customer = await Customer.findOne({
    owner: session.user.id,
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  });

  if (!customer) {
    customer = new Customer({ owner: session.user.id, name });
  }

  customer.financialPlan = body.financialPlan || null;
  if (body.expectedFee !== undefined) customer.expectedFee = body.expectedFee;
  await customer.save();

  return Response.json({ customer });
}
