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
      style={{
        width: 1200,
        fontFamily: 'Arial, "Helvetica Neue", "Segoe UI", sans-serif',
        background: "linear-gradient(160deg, #FCE9EE 0%, #FBF7F5 45%, #FDEFE7 100%)",
        padding: 40,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", bottom: 120, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(211,17,69,0.08)" }} />

      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "relative",
            borderRadius: 0,
            overflow: "hidden",
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

        <div style={{ background: "#F2EFEC", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ background: "#EDE7E3", padding: "10px 18px", textAlign: "center", fontWeight: 800, fontSize: 14, color: "#312629" }}>
            GIÁ TRỊ HOÀN LẠI DỰ KIẾN{" "}
            <span style={{ fontWeight: 600, fontSize: 12, color: "#6B7876" }}>(LÃI SUẤT MINH HỌA 4.6%)</span>
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
                      background: "#fff",
                      borderRadius: 10,
                      padding: "10px 8px",
                      textAlign: "center",
                      border: "1px solid #EDE1E4",
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
            borderRadius: 14,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#fff",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
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
            <p style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}>
              {agent?.name || "Tư vấn viên"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 2 14.4 4.6 17.8 4.2 18.4 7.6 21.4 9.2 20 12.4 21.4 15.6 18.4 17.2 17.8 20.6 14.4 20.2 12 22.8 9.6 20.2 6.2 20.6 5.6 17.2 2.6 15.6 4 12.4 2.6 9.2 5.6 7.6 6.2 4.2 9.6 4.6Z"/><path d="M9 12.5l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </p>
            <p style={{ fontSize: 12, opacity: 0.85 }}>Tài khoản dùng thử</p>
            {(agent?.phone || agent?.email) && (
              <p style={{ fontSize: 12, opacity: 0.95, marginTop: 2 }}>
                {agent?.phone && <>📞 {agent.phone}</>}
                {agent?.phone && agent?.email && <> &nbsp;·&nbsp; </>}
                {agent?.email && <>✉️ {agent.email}</>}
              </p>
            )}
            {agent?.bio && <p style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>🏆 {agent.bio}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
