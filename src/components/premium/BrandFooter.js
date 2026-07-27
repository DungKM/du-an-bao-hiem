const STATS = [
  { value: "200+", label: "Văn phòng trên toàn quốc" },
  { value: "03", label: "Ngân hàng đối tác" },
  { value: "1.6 Triệu", label: "Khách hàng được bảo vệ" },
  { value: "Số 1", label: "Thế giới về số lượng thành viên MDRT" },
];

export default function BrandFooter({ agent }) {
  const name = agent?.name || "Tư vấn viên";
  const phone = agent?.phone || "";
  const email = agent?.email || "";
  const bio = agent?.bio || "";
  const avatarSrc = agent?.avatarDataUrl || "";

  return (
    <div style={{ marginTop: 16, borderRadius: 14, overflow: "hidden", border: "1px solid #EDE4E6" }}>
      <div style={{ background: "#FDF3F6", borderTop: "1px solid #F2D9E1", padding: "14px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 12.5, fontStyle: "italic", color: "#D31145", lineHeight: 1.7 }}>
          "Tham gia bảo hiểm không phải vì ai đó sẽ ra đi, tham gia bảo hiểm là vì ai đó sẽ phải tiếp tục sống"
        </p>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#D31145", marginTop: 5 }}>— Harish Mishra</p>
      </div>

      <div style={{ background: "#D31145", padding: "16px 20px", color: "#fff" }}>
        <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, letterSpacing: 0.5 }}>VỀ AIA VIỆT NAM</p>
        <p style={{ fontSize: 11, lineHeight: 1.7, marginBottom: 12 }}>
          AIA Việt Nam là thành viên của Tập đoàn AIA — tập đoàn bảo hiểm nhân thọ độc lập, có nguồn gốc châu Á lớn
          nhất thế giới được niêm yết. Được thành lập vào năm 2000 với mục tiêu bảo vệ sự phồn thịnh và an toàn tài
          chính cho người dân Việt Nam, AIA Việt Nam hiện đang là một trong những công ty bảo hiểm nhân thọ hàng đầu
          và là thương hiệu được khách hàng và công chúng tin cậy.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                flex: "1 1 120px",
                background: "rgba(255,255,255,0.14)",
                borderRadius: 7,
                padding: "8px 12px",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 8.5, marginTop: 3, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", borderTop: "3px solid #D31145", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#FDE8EE",
            border: "2px solid #D31145",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarSrc} alt={name} className="w-full h-full object-cover" />
          ) : (
            "🧑‍💼"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#312629] flex items-center gap-1.5">
            {name}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2 14.4 4.6 17.8 4.2 18.4 7.6 21.4 9.2 20 12.4 21.4 15.6 18.4 17.2 17.8 20.6 14.4 20.2 12 22.8 9.6 20.2 6.2 20.6 5.6 17.2 2.6 15.6 4 12.4 2.6 9.2 5.6 7.6 6.2 4.2 9.6 4.6Z"/><path d="M9 12.5l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </p>
          {(phone || email) && (
            <p className="text-xs text-gray-600 mt-1">
              {phone && <>📞 {phone}</>}
              {phone && email && <> &nbsp;·&nbsp; </>}
              {email && <>✉️ {email}</>}
            </p>
          )}
          {bio && <p className="text-[11px] text-gray-500 mt-1">🏆 {bio}</p>}
        </div>
      </div>
    </div>
  );
}
