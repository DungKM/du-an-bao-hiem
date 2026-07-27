const STATS = [
  { value: "200+", label: "Văn phòng trên toàn quốc" },
  { value: "03", label: "Ngân hàng đối tác" },
  { value: "1.6 Triệu", label: "Khách hàng được bảo vệ" },
  { value: "Số 1", label: "Thế giới về số lượng thành viên MDRT" },
];

export default function BrandFooter() {
  return (
    <div className="space-y-3">
      <div className="bg-brand-light rounded-[14px] px-[18px] py-4 text-center">
        <p className="text-sm text-[#312629] italic">
          "Tham gia bảo hiểm không phải vì ai đó sẽ ra đi, tham gia bảo hiểm là vì ai đó sẽ phải tiếp tục sống"
        </p>
        <p className="text-xs text-gray-500 mt-1">— Harish Mishra</p>
      </div>

      <div className="bg-brand rounded-[14px] px-[18px] py-5 text-white space-y-4">
        <div>
          <p className="text-[15px] font-extrabold tracking-wide">VỀ AIA VIỆT NAM</p>
          <p className="text-sm opacity-90 mt-1.5">
            AIA Việt Nam là thành viên của Tập đoàn AIA — tập đoàn bảo hiểm nhân thọ độc lập lớn nhất niêm yết trên
            thế giới, đồng hành cùng khách hàng Việt Nam trong hành trình bảo vệ và phát triển tài chính lâu dài.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white/10 rounded-lg px-3 py-2.5 text-center">
              <p className="text-lg font-extrabold">{s.value}</p>
              <p className="text-[11px] opacity-90 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#DED6D8] rounded-[14px] px-[18px] py-4 border-t-[3px]" style={{ borderTopColor: "#D31145" }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center text-2xl shrink-0">🧑‍💼</div>
          <div className="flex-1">
            <p className="font-bold text-[#312629] flex items-center gap-1.5">
              Hoàng Anh Dũng
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2 14.4 4.6 17.8 4.2 18.4 7.6 21.4 9.2 20 12.4 21.4 15.6 18.4 17.2 17.8 20.6 14.4 20.2 12 22.8 9.6 20.2 6.2 20.6 5.6 17.2 2.6 15.6 4 12.4 2.6 9.2 5.6 7.6 6.2 4.2 9.6 4.6Z"/><path d="M9 12.5l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </p>
            <p className="text-xs text-gray-400">Tài khoản dùng thử</p>
            <p className="text-xs text-gray-600 mt-1">
              📞 0399646714 &nbsp;·&nbsp; ✉️ hoangdung@nsis.ai.vn
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              🏆 MDRT 2022 · MDRT 2023 · MDRT 2024 — Hơn 8 năm kinh nghiệm, 350+ hợp đồng, 200+ khách hàng tin tưởng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
