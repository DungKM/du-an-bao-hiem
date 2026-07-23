import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const users = await User.find({}, "-passwordHash").sort({ createdAt: -1 }).lean();
  return Response.json({ users });
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const username = (body.username || "").trim();
  const phone = (body.phone || "").trim();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const role = body.role === "admin" ? "admin" : "agent";
  const password = (body.password || phone).trim();

  if (!username || !name || !password) {
    return Response.json({ error: "Vui lòng nhập đủ tên đăng nhập, họ tên và mật khẩu." }, { status: 400 });
  }

  await connectDB();
  const exists = await User.findOne({ username });
  if (exists) {
    return Response.json({ error: "Tên đăng nhập đã tồn tại." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    phone,
    name,
    email,
    role,
    passwordHash,
    bio: body.bio || "",
  });

  return Response.json(
    { user: { id: user._id, username: user.username, name: user.name, role: user.role } },
    { status: 201 }
  );
}
