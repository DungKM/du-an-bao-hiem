"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="inline-flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2 mb-10">
          <span className="text-white font-bold text-lg">🛡️ Trust Tool</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại 👋</h1>
        <p className="text-white/80 mb-8">
          Đăng nhập để sử dụng bộ công cụ tư vấn tài chính chuyên nghiệp.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1 tracking-wide">
              TÊN ĐĂNG NHẬP / EMAIL
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username hoặc email..."
              required
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1 tracking-wide">
              MẬT KHẨU
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
            <p className="text-white/60 text-xs mt-2">
              💡 Đang dùng thử? Mật khẩu mặc định là <b>số điện thoại</b> bạn đã đăng ký. Bạn có
              thể đổi mật khẩu sau khi đăng nhập (nút 🔑 ở góc trên).
            </p>
          </div>

          {error && (
            <p className="text-sm bg-white/10 border border-white/30 text-white rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-brand font-bold rounded-lg py-3 hover:bg-white/90 transition disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
          </button>

          <p className="text-center text-white/80 text-sm">
            Liên hệ Admin để được cấp tài khoản: <b>09 8118 8866</b>
          </p>
        </form>
      </div>
    </div>
  );
}
