"use client";

import { useMemo, useRef, useState } from "react";
import { formatVND } from "@/lib/finance";
import { defaultPerson, calcPersonRiders, MAIN_PRODUCTS } from "@/lib/premiumCalc";
import ModuleHeader from "@/components/ModuleHeader";
import PersonCard from "./PersonCard";
import SummaryTable from "./SummaryTable";
import AccountValueSection from "./AccountValueSection";
import BenefitSummary from "./BenefitSummary";
import BrandFooter from "./BrandFooter";
import { ShieldIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from "./icons";

const MAX_ATTACHED = 6;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function defaultMainProduct() {
  return {
    productName: MAIN_PRODUCTS[0],
    paymentTerm: 20,
    sumInsured: 1_000_000_000,
    annualPremium: 10_000_000,
  };
}

export default function PremiumClient() {
  const [designDate, setDesignDate] = useState(todayISO);
  const [mainProduct, setMainProduct] = useState(defaultMainProduct);
  const [people, setPeople] = useState([defaultPerson("main")]);
  const [collapsed, setCollapsed] = useState([false]);
  const [showBenefitSummary, setShowBenefitSummary] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pageTopRef = useRef(null);
  const pageBottomRef = useRef(null);
  const exportRef = useRef(null);

  function updatePerson(index, next) {
    setPeople((prev) => prev.map((p, i) => (i === index ? next : p)));
  }

  function addPerson() {
    if (people.length - 1 >= MAX_ATTACHED) return;
    setPeople((prev) => [...prev, defaultPerson("attached")]);
    setCollapsed((prev) => [...prev, false]);
  }

  function removePerson(index) {
    setPeople((prev) => prev.filter((_, i) => i !== index));
    setCollapsed((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleCollapse(index) {
    setCollapsed((prev) => prev.map((c, i) => (i === index ? !c : c)));
  }

  const familyTotal = useMemo(() => {
    const pass1 = people.map((p) => calcPersonRiders(p, 0, designDate));
    const withoutWaiver =
      Number(mainProduct.annualPremium) +
      pass1.reduce((s, pr) => s + pr.rows.filter((r) => r.key !== "waiver").reduce((s2, r) => s2 + r.fee, 0), 0);
    const pass2 = people.map((p) => calcPersonRiders(p, withoutWaiver, designDate));
    const total = Number(mainProduct.annualPremium) + pass2.reduce((s, pr) => s + pr.total, 0);
    return { withoutWaiver, total };
  }, [mainProduct, people, designDate]);

  const attachedCount = people.length - 1;

  async function handleExportImage() {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(exportRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = "tinh-phi-quyen-loi.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Không thể tạo ảnh, vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div ref={pageTopRef} className="border border-[#DED6D8] rounded-2xl overflow-hidden">
      <ModuleHeader icon="🛡️" title="Tính Phí Quyền Lợi" module={3} />

      <div
        className="no-print text-white px-4 sm:px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 sticky top-2 z-30 mb-3 mx-4 sm:mx-6 mt-3 rounded-lg shadow-md"
        style={{ background: "rgb(224,64,112)" }}
      >
        <p className="text-xs font-semibold opacity-90">💰 Tổng phí năm đầu</p>
        <p className="text-sm font-extrabold">{formatVND(familyTotal.total)}</p>
        <p className="text-[11px] opacity-80">{formatVND(familyTotal.total / 12)}/tháng</p>
      </div>

      <div className="bg-[#F5F1F2] px-4 sm:px-6 py-8">
        <div ref={exportRef} className="max-w-[900px] mx-auto space-y-3.5 bg-[#F5F1F2]">
          <header className="flex items-center gap-4 pb-1">
            <div className="w-[52px] h-[52px] rounded-full bg-brand flex items-center justify-center shrink-0">
              <ShieldIcon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#312629]">Tính Phí Quyền Lợi Bảo Hiểm</h1>
              <p className="text-sm text-gray-500 mt-0.5">Tính phí, GTTK &amp; tóm tắt quyền lợi cho cả gia đình</p>
            </div>
          </header>

          <div className="bg-brand rounded-[14px] px-[18px] py-4 text-white space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm font-semibold opacity-90">Tổng phí đóng năm đầu tiên dành cho cả gia đình</p>
                <p className="text-[26px] font-extrabold leading-tight">{formatVND(familyTotal.total)}</p>
              </div>
              <div className="text-right text-xs opacity-90 space-y-0.5">
                <p>Tiết kiệm theo tháng: {formatVND(familyTotal.total / 12)}</p>
                <p>Tiết kiệm theo ngày: {formatVND(familyTotal.total / 365)}</p>
              </div>
            </div>
            <div className="border-t border-white/20 pt-3 flex items-center gap-2">
              <label className="text-xs font-semibold opacity-90 flex items-center gap-2">
                Ngày thiết kế phương án
                <input
                  type="date"
                  value={designDate}
                  onChange={(e) => setDesignDate(e.target.value)}
                  className="bg-white/15 border border-white/30 rounded-lg px-2 py-1 text-xs text-white [color-scheme:dark]"
                />
              </label>
            </div>
          </div>

          {people.map((p, i) => (
            <PersonCard
              key={i}
              title={i === 0 ? "Người được bảo hiểm chính" : `Người được bảo hiểm đính kèm ${i}`}
              person={p}
              onChange={(next) => updatePerson(i, next)}
              onRemove={i === 0 ? null : () => removePerson(i)}
              canWaiver={i > 0}
              familyPremiumWithoutWaiver={familyTotal.withoutWaiver}
              isMain={i === 0}
              mainProduct={mainProduct}
              setMainProduct={setMainProduct}
              designDate={designDate}
              collapsed={collapsed[i]}
              onToggleCollapse={() => toggleCollapse(i)}
            />
          ))}

          {attachedCount < MAX_ATTACHED && (
            <button
              type="button"
              onClick={addPerson}
              className="no-print w-full border-2 border-dashed rounded-[14px] py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition"
              style={{ borderColor: "rgb(0,0,193)", color: "rgb(0,0,193)", background: "rgb(227,227,249)" }}
            >
              <PlusIcon size={16} /> Thêm người được bảo hiểm đính kèm ({attachedCount}/{MAX_ATTACHED})
            </button>
          )}

          <SummaryTable mainProduct={mainProduct} people={people} familyTotal={familyTotal} designDate={designDate} />

          <button
            type="button"
            onClick={() => setShowBenefitSummary((v) => !v)}
            className="no-print rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-[13px] py-2.5 px-5 transition mx-auto block"
          >
            {showBenefitSummary ? "📄 Ẩn tóm tắt quyền lợi bảo hiểm" : "📄 Xem tóm tắt quyền lợi bảo hiểm"}
          </button>

          {showBenefitSummary && (
            <BenefitSummary mainProduct={mainProduct} people={people} familyTotal={familyTotal} designDate={designDate} />
          )}

          <AccountValueSection mainProduct={mainProduct} people={people} familyTotal={familyTotal} designDate={designDate} />

          <BrandFooter />

          <div className="text-center no-print">
            <button
              type="button"
              onClick={handleExportImage}
              disabled={exporting}
              className="rounded-full text-white font-semibold text-sm px-6 py-2.5 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, rgb(211,17,69), rgb(138,14,46))" }}
            >
              {exporting ? "Đang tạo ảnh..." : "📸 Tạo ảnh đăng Facebook"}
            </button>
            <p className="text-[11px] text-gray-400 mt-1">PNG 1200×1200px</p>
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            ⚠️ Toàn bộ số phí trong trang này là số MINH HỌA ước lượng cho mục đích tư vấn, không phải bảng phí chính
            thức của công ty bảo hiểm. Số phí thật căn cứ hồ sơ yêu cầu bảo hiểm &amp; bảng minh họa chính thức.
          </p>
        </div>
      </div>
      <div ref={pageBottomRef} />

      <div className="no-print fixed bottom-6 right-6 flex flex-col items-end gap-2 z-40">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-brand text-white text-xs font-semibold px-4 py-2.5 shadow-lg hover:bg-brand-dark"
        >
          🖨️ Lưu PDF
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => pageTopRef.current?.scrollIntoView({ behavior: "smooth" })}
            title="Về đầu trang"
            className="w-9 h-9 rounded-full bg-white border border-[#DED6D8] text-brand shadow flex items-center justify-center hover:bg-brand-light"
          >
            <ArrowUpIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => pageBottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            title="Xuống cuối trang"
            className="w-9 h-9 rounded-full bg-brand text-white shadow flex items-center justify-center hover:bg-brand-dark"
          >
            <ArrowDownIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
