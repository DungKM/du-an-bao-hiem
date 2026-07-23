import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const MAX_AVATAR_LENGTH = 3_000_000; // ~2MB image as base64

export async function PUT(req) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.avatarDataUrl && body.avatarDataUrl.length > MAX_AVATAR_LENGTH) {
    return Response.json({ error: "Ảnh đại diện quá lớn, vui lòng chọn ảnh nhỏ hơn." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return Response.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });

  const fields = ["name", "title", "phone", "email", "bio", "avatarDataUrl"];
  for (const f of fields) {
    if (body[f] !== undefined) user[f] = body[f];
  }
  await user.save();

  return Response.json({
    user: {
      name: user.name,
      title: user.title,
      phone: user.phone,
      email: user.email,
      bio: user.bio,
      avatarDataUrl: user.avatarDataUrl,
    },
  });
}
