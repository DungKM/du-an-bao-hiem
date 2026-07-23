import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function PUT(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  await connectDB();
  const user = await User.findById(params.id);
  if (!user) return Response.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });

  if (body.name !== undefined) user.name = body.name;
  if (body.phone !== undefined) user.phone = body.phone;
  if (body.email !== undefined) user.email = body.email;
  if (body.trialDays !== undefined) user.trialDays = body.trialDays;
  if (body.newPassword) {
    user.passwordHash = await bcrypt.hash(body.newPassword, 10);
  }
  await user.save();

  return Response.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  if (params.id === session.user.id) {
    return Response.json({ error: "Không thể tự xóa tài khoản của mình." }, { status: 400 });
  }

  await connectDB();
  await User.findByIdAndDelete(params.id);
  return Response.json({ ok: true });
}
