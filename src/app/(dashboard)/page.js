import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import ProfileCard from "@/components/profile/ProfileCard";

const STATS = [
  { value: "200+", label: "Văn phòng trên toàn quốc" },
  { value: "03", label: "Ngân hàng đối tác" },
  { value: "1.6 Triệu", label: "Khách hàng được bảo vệ" },
  { value: "Số 1", label: "Thế giới về số lượng thành viên MDRT" },
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
      dbUser?.title || (session.user.role === "admin" ? "Quản trị viên" : "Tư vấn viên tài chính"),
    phone: dbUser?.phone || "",
    email: dbUser?.email || "",
    bio: dbUser?.bio || "",
    avatarDataUrl: dbUser?.avatarDataUrl || "",
  };

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-xl border-t-4 border-brand overflow-hidden">
        <ProfileCard initialProfile={profile} />

        <div className="bg-brand px-7 py-[18px]">
          <p className="text-[12px] font-extrabold text-white mb-2.5 tracking-[1px]">
            VỀ AIA VIỆT NAM
          </p>
          <p className="text-[12px] text-white leading-[1.8] mb-3.5">
            AIA Việt Nam là thành viên của Tập đoàn AIA — tập đoàn bảo hiểm nhân thọ độc lập lớn
            nhất niêm yết trên thế giới, đồng hành cùng khách hàng Việt Nam trong hành trình bảo vệ
            và phát triển tài chính lâu dài.
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
        <p>Turbox · Phiên bản 1.0 · 2026</p>
        <p className="mt-1.5 text-[10.5px] text-[#C8B88A] italic">
          ⚠️ Lưu ý: Công cụ này chỉ hỗ trợ quá trình tư vấn trước khi đến với bảng minh họa cuối
          cùng cùng điều khoản sản phẩm.
        </p>
      </div>
    </div>
  );
}
