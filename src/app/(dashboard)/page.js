import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ProfileCard from "@/components/profile/ProfileCard";

const STATS = [
  { value: "05", label: "Tính năng tư vấn trong bộ công cụ" },
  { value: "50", label: "Khách hàng lưu trữ trong danh sách" },
  { value: "14", label: "Ngày dùng thử miễn phí" },
  { value: "24/7", label: "Truy cập hồ sơ tư vấn mọi lúc" },
];

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  await connectDB();
  const dbUser = await User.findById(session.user.id).lean();

  const profile = {
    name: dbUser?.name || session.user.name || "",
    title:
      dbUser?.title || (session.user.role === "admin" ? "Quản trị viên" : "Tài khoản dùng thử"),
    phone: dbUser?.phone || "",
    email: dbUser?.email || "",
    bio: dbUser?.bio || "",
    avatarDataUrl: dbUser?.avatarDataUrl || "",
  };

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <ProfileCard initialProfile={profile} />

        <div className="bg-brand px-7 py-[18px]">
          <p className="text-[12px] font-extrabold text-white mb-2.5 tracking-[1px]">
            VỀ TRUST TOOL
          </p>
          <p className="text-[12px] text-white leading-[1.8] mb-3.5">
            Trust Tool hỗ trợ tư vấn viên hoạch định tài chính cho khách hàng: tính toán nhu cầu
            bảo vệ, so sánh phương án đóng phí, tính phí quyền lợi, quản lý danh sách khách hàng đã
            lưu và quà tặng thần số học — tất cả trong một nơi.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex-1 min-w-[100px] bg-white/[0.07] border border-white/10 rounded-xl px-3 py-2.5 text-center"
              >
                <p className="text-sm font-black text-white">{s.value}</p>
                <p className="text-[10px] text-white mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-9 text-center text-[11px] text-[#B0BAB5] leading-[1.9]">
        <p>Trust Tool · Phiên bản 1.0 · 2026</p>
        <p className="mt-1.5 text-[10.5px] text-[#C8B88A] italic">
          ⚠️ Lưu ý: Công cụ này chỉ hỗ trợ quá trình tư vấn trước khi đến với bảng minh họa cuối
          cùng cùng điều khoản sản phẩm.
        </p>
      </div>
    </div>
  );
}
