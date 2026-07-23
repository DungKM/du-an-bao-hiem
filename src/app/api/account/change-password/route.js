import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return Response.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return Response.json({ error: "Mật khẩu hiện tại không đúng." }, { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return Response.json({ ok: true });
}
