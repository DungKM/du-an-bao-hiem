"use client";

import { useMemo } from "react";
import { toNumber } from "@/lib/finance";
import { calcAccountValue, calcPersonRiders, getEffectiveAge } from "@/lib/premiumCalc";

const RIDER_ORDER = [
  { key: "healthCardInpatient", label: "Thẻ chăm sóc SK — Nội trú (hạn mức/năm)", limitKey: "sumInsured" },
  { key: "healthCardOutpatient", label: "Thẻ chăm sóc SK — Ngoại trú (hạn mức/năm)", limitKey: "sumInsured" },
  { key: "healthCardDental", label: "Thẻ chăm sóc SK — Nha khoa (hạn mức/năm)", limitKey: "sumInsured" },
  { key: "hospitalCash", label: "Trợ cấp nằm viện", limitKey: "sumInsured" },
  { key: "criticalIllness", label: "Bệnh hiểm nghèo 2.0 (STBH)", limitKey: "sumInsured" },
  { key: "termLife", label: "Tử kỳ gia hạn hàng năm (STBH)", limitKey: "sumInsured" },
  { key: "accident", label: "Tử vong & thương tật do tai nạn (STBH)", limitKey: "sumInsured" },
];

function formatCompact(value) {
  const n = Math.round(toNumber(value));
  if (n <= 0) return "-";
  if (n >= 1_000_000_000) {
    const ty = n / 1_000_000_000;
    return `${Number.isInteger(ty) ? ty : ty.toFixed(1)} TỶ`;
  }
  return `${Math.round(n / 1_000_000)} TRIỆU`;
}

export default function FacebookImageTemplate({ mainProduct, people, familyTotal, designDate, agent }) {
  const mainPerson = people[0];
  const mainAge = getEffectiveAge(mainPerson, designDate);
  const term = Number(mainProduct.paymentTerm) || 20;

  const accountValue = useMemo(
    () =>
      calcAccountValue({
        sumInsured: mainProduct.sumInsured,
        annualPremium: mainProduct.annualPremium,
        age: mainAge,
        gender: mainPerson.gender,
        paymentTerm: term,
        illustratedRate: 4.6,
      }),
    [mainProduct, mainAge, mainPerson.gender, term]
  );

  const perPersonRows = people.map((p) => calcPersonRiders(p, familyTotal.withoutWaiver, designDate));
  const activeRiders = RIDER_ORDER.filter((meta) => perPersonRows.some((pr) => pr.rows.some((r) => r.key === meta.key)));

  const totalMainPremium = Number(mainProduct.annualPremium) * term;
  const totalAttachedPremium = perPersonRows.slice(1).reduce((s, pr) => s + pr.total * term, 0);

  const perDay = Math.round(familyTotal.total / 365 / 1000) * 1000;
  const perDayLabel = perDay >= 1000 ? `~${Math.round(perDay / 1000)}K` : `~${perDay}`;

  const checkpointYears = [10, 15, 20, 25];
  const valueAtYear = (y) => accountValue.illustrated.rows.find((r) => r.year === y && !r.lapsed)?.accountValue ?? null;
  const receivedAtTerm = valueAtYear(term) ?? accountValue.finalIllustrated;

  return (
    <div
      className="fb-image-template"
      style={{
        width: 1200,
        fontFamily: 'var(--font-roboto), Roboto, Arial, sans-serif',
        background: "linear-gradient(160deg, #FCE9EE 0%, #FBF7F5 45%, #FDEFE7 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        .fb-image-template, .fb-image-template * {
          font-family: var(--font-roboto), Roboto, Arial, sans-serif !important;
        }
      `}</style>
      <div style={{ position: "absolute", bottom: 120, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(211,17,69,0.08)" }} />

      <div
        style={{
          position: "relative",
          width: "100%",
          height: 340,
          backgroundImage: 'url("/images/dad_kids.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(252,233,238,0) 30%, rgba(252,233,238,0.25) 55%, rgba(252,233,238,0.6) 75%, rgba(252,233,238,0.88) 90%, #FCE9EE 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "#D31145",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(211,17,69,0.35)",
            border: "4px solid #fff",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.9 }}>CHỈ</span>
          <span style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1 }}>{perDayLabel}</span>
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>/ngày (*)</span>
        </div>
      </div>

      <div style={{ position: "relative", padding: "0 40px 40px" }}>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#D31145",
            margin: "-46px 0 14px",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            maxWidth: 900,
            position: "relative",
          }}
        >
          {mainProduct.productName}
        </h1>

        <div
          style={{
            display: "inline-block",
            background: "#D31145",
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            lineHeight: 1.4,
            borderRadius: 10,
            padding: "10px 20px",
            marginBottom: 20,
          }}
        >
          AN TÂM VỮNG BƯỚC
          <br />
          TRỌN VẸN TƯƠNG LAI
        </div>

        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #EDE1E4", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#D31145", color: "#fff" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 800, fontSize: 12.5, letterSpacing: 0.3 }}>
                  QUYỀN LỢI BẢO HIỂM
                </th>
                {people.map((p, i) => (
                  <th key={i} style={{ padding: "8px 14px", fontWeight: 800, fontSize: 11.5 }}>
                    <div>{i === 0 ? "NĐBH CHÍNH" : `NĐBH ĐÍNH KÈM ${i}`}</div>
                    <div style={{ fontWeight: 600, opacity: 0.9 }}>{getEffectiveAge(p, designDate) || "?"} TUỔI</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#fff" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "#312629" }}>BẢO HIỂM TỬ VONG &amp; TTTBVV</td>
                {people.map((_, i) => (
                  <td key={i} style={{ textAlign: "center", padding: "10px 14px", fontWeight: 800, color: "#D31145" }}>
                    {i === 0 ? formatCompact(mainProduct.sumInsured) : "—"}
                  </td>
                ))}
              </tr>
              {activeRiders.map((meta, idx) => (
                <tr key={meta.key} style={{ background: idx % 2 === 0 ? "#FDF3F6" : "#fff" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: "#312629", textTransform: "uppercase", fontSize: 12 }}>
                    {meta.label}
                  </td>
                  {perPersonRows.map((pr, i) => {
                    const row = pr.rows.find((r) => r.key === meta.key);
                    return (
                      <td key={i} style={{ textAlign: "center", padding: "10px 14px", fontWeight: 800, color: row ? "#D31145" : "#C8B9BD" }}>
                        {row ? formatCompact(row.sumInsured ?? row.fee) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: "#fff", border: "1.5px solid #F0D0D8", borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "14px 18px 12px", textAlign: "center", fontWeight: 800, fontSize: 15, color: "#D31145", letterSpacing: 0.3 }}>
            GIÁ TRỊ HOÀN LẠI DỰ KIẾN{" "}
            <span style={{ fontWeight: 600, fontSize: 11.5, color: "#9AA39E" }}>(LÃI SUẤT MINH HỌA 4.6%)</span>
          </div>
          <div style={{ background: "#D31145", color: "#fff", padding: "14px 18px" }}>
            <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>HẾT HẠN ĐÓNG PHÍ (NĂM {term})</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.95 }}>
              <span>TỔNG PHÍ SP CHÍNH:</span>
              <span style={{ fontWeight: 800 }}>{formatCompact(totalMainPremium)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.95, marginBottom: 8 }}>
              <span>TỔNG PHÍ SP ĐÍNH KÈM:</span>
              <span style={{ fontWeight: 800 }}>{totalAttachedPremium > 0 ? formatCompact(totalAttachedPremium) : "—"}</span>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.3)", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>NHẬN VỀ DỰ KIẾN:</span>
              <span style={{ fontWeight: 900, fontSize: 22, color: "#FFD54A" }}>{formatCompact(receivedAtTerm)}</span>
            </div>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7876", marginBottom: 10 }}>GIÁ TRỊ TÀI KHOẢN QUA CÁC NĂM:</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {checkpointYears.map((y) => {
                const v = valueAtYear(y);
                return (
                  <div
                    key={y}
                    style={{
                      flex: "1 1 120px",
                      background: "#FBF2F4",
                      borderRadius: 10,
                      padding: "10px 8px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7876" }}>NĂM {y}</div>
                    <div style={{ fontSize: 9.5, color: "#9AA39E", marginBottom: 4 }}>{mainAge + y - 1} TUỔI</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#D31145" }}>{v != null ? formatCompact(v) : "—"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#9AA39E", marginBottom: 20 }}>(*) Phí năm đầu tiên</p>

        <div
          style={{
            background: "linear-gradient(135deg, #E56F91, #D31145)",
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            boxShadow: "0 10px 24px rgba(140,10,40,0.35), inset 0 -6px 0 rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: "#fff",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {agent?.avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.avatarDataUrl} alt={agent?.name} className="w-full h-full object-cover" />
            ) : (
              "🧑‍💼"
            )}
          </div>
          <div style={{ color: "#fff" }}>
            <p style={{ fontWeight: 800, fontSize: 20, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ lineHeight: 1 }}>{agent?.name || "Tư vấn viên"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6" style={{ display: "block", flexShrink: 0, transform: "translateY(2px)" }}><path d="M12 2 14.4 4.6 17.8 4.2 18.4 7.6 21.4 9.2 20 12.4 21.4 15.6 18.4 17.2 17.8 20.6 14.4 20.2 12 22.8 9.6 20.2 6.2 20.6 5.6 17.2 2.6 15.6 4 12.4 2.6 9.2 5.6 7.6 6.2 4.2 9.6 4.6Z"/><path d="M9 12.5l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#FFD54A", marginTop: 2 }}>Tài khoản dùng thử</p>
            {(agent?.phone || agent?.email) && (
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 18px", fontSize: 14, fontWeight: 600, marginTop: 6, lineHeight: 1 }}>
                {agent?.phone && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" style={{ display: "block", flexShrink: 0 }}><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z"/></svg>
                    <span>{agent.phone}</span>
                  </span>
                )}
                {agent?.email && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" style={{ display: "block", flexShrink: 0 }}><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm2 0 8 6 8-6H4zm16 2.2-8 6-8-6V18h16V8.2z"/></svg>
                    <span>{agent.email}</span>
                  </span>
                )}
              </div>
            )}
            {agent?.bio && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, opacity: 0.95, marginTop: 5, lineHeight: 1 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFD54A" style={{ display: "block", flexShrink: 0 }}><path d="M7 4h10v2h3a1 1 0 0 1 1 1c0 2.8-1.8 5.1-4.3 5.8A6.5 6.5 0 0 1 13 17.9V20h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-2.1a6.5 6.5 0 0 1-3.7-5.1C4.8 12.1 3 9.8 3 7a1 1 0 0 1 1-1h3V4zm-2 3c0 1.5.9 2.8 2.2 3.4A9 9 0 0 1 7 8V6H5zm12 0v2c0 .8-.1 1.7-.2 2.4C18.1 9.8 19 8.5 19 7h-2z"/></svg>
                <span>{agent.bio}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
