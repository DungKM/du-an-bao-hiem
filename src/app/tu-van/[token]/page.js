import { connectDB } from "@/lib/mongodb";
import PlanLink from "@/models/PlanLink";
import User from "@/models/User";
import PublicPlanClient from "@/components/plan/PublicPlanClient";

function ExpiredNotice({ title, message }) {
  return (
    <div className="min-h-screen bg-[#F5F1F2] flex items-center justify-center px-4">
      <div className="bg-white border border-[#DED6D8] rounded-[14px] p-8 max-w-md text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-lg font-bold text-[#312629] mb-2">{title}</h1>
        <p className="text-sm text-[#6B7876]">{message}</p>
      </div>
    </div>
  );
}

export default async function PublicPlanLinkPage({ params }) {
  const { token } = params;
  await connectDB();
  const link = await PlanLink.findOne({ token }).lean();

  if (!link) {
    return (
      <ExpiredNotice
        title="Không tìm thấy link"
        message="Link này không tồn tại hoặc đã bị xóa. Vui lòng liên hệ tư vấn viên để nhận link mới."
      />
    );
  }

  if (link.status !== "pending") {
    return (
      <ExpiredNotice
        title="Link đã hết hiệu lực"
        message="Link này đã được sử dụng để gửi thông tin trước đó. Vui lòng liên hệ tư vấn viên để nhận link mới."
      />
    );
  }

  const user = await User.findById(link.owner).lean();
  const agent = {
    name: user?.name || user?.username || "",
    phone: user?.phone || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatarDataUrl: user?.avatarDataUrl || "",
  };

  return (
    <div className="min-h-screen bg-[#F5F1F2] py-8 px-4">
      <PublicPlanClient agent={agent} token={token} />
    </div>
  );
}
