"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "next/navigation";
import { formatVND } from "@/lib/finance";
import { defaultPerson, calcPersonRiders, MAIN_PRODUCTS } from "@/lib/premiumCalc";
import ModuleHeader from "@/components/ModuleHeader";
import PersonCard from "./PersonCard";
import SummaryTable from "./SummaryTable";
import AccountValueSection from "./AccountValueSection";
import BenefitSummary from "./BenefitSummary";
import BrandFooter from "./BrandFooter";
import FacebookImageTemplate from "./FacebookImageTemplate";
import { ShieldIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from "./icons";

const MAX_ATTACHED = 6;

const PRINT_SECTION_LABELS = [
  { key: "summary", label: "Bảng tổng hợp phí & quyền lợi" },
  { key: "benefit", label: "Tóm tắt quyền lợi bảo hiểm" },
  { key: "chart", label: "Biểu đồ năm hòa vốn" },
  { key: "simple", label: "Bảng phí đóng 20 năm" },
  { key: "detail", label: "Bảng phân bổ phí các loại" },
  { key: "gttk", label: "Bảng giá trị tài khoản (GTTK)" },
];

function defaultPrintSections() {
  return { summary: true, benefit: true, chart: true, simple: true, detail: true, gttk: true };
}

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

export default function PremiumClient({ agent }) {
  const searchParams = useSearchParams();
  const [designDate, setDesignDate] = useState(todayISO);
  const [mainProduct, setMainProduct] = useState(defaultMainProduct);
  const [people, setPeople] = useState([defaultPerson("main")]);
  const [collapsed, setCollapsed] = useState([false]);
  const [showBenefitSummary, setShowBenefitSummary] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [printSections, setPrintSections] = useState(defaultPrintSections);
  const pageTopRef = useRef(null);
  const pageBottomRef = useRef(null);
  const exportRef = useRef(null);
  const fbTemplateRef = useRef(null);
  const accountValueRef = useRef(null);

  useEffect(() => {
    const id = searchParams.get("savedPlanId");
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/saved-plans/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const plan = data.savedPlan;
      if (!plan) return;
      setSavedPlanId(plan._id);
      if (plan.designDate) setDesignDate(plan.designDate);
      if (plan.mainProduct) setMainProduct(plan.mainProduct);
      if (Array.isArray(plan.people) && plan.people.length) {
        setPeople(plan.people);
        setCollapsed(plan.people.map(() => true));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ghi snapshot phương án đang nhập vào sessionStorage — để module "So Sánh
  // Đóng Phí" đọc được dữ liệu mới nhất ngay khi chuyển trang, không cần lưu
  // vào DB hay bấm nút riêng.
  useEffect(() => {
    sessionStorage.setItem("tinhPhiSnapshot", JSON.stringify({ designDate, mainProduct, people }));
  }, [designDate, mainProduct, people]);

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

  async function handleSavePlan() {
    const name = people[0]?.name?.trim() || "Phương án chưa đặt tên";
    setSaving(true);
    setSaveMsg("");
    const method = savedPlanId ? "PUT" : "POST";
    const url = savedPlanId ? `/api/saved-plans/${savedPlanId}` : "/api/saved-plans";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, designDate, mainProduct, people, totalPremium: familyTotal.total }),
    });
    setSaving(false);
    const data = await res.json();
    if (!res.ok) {
      setSaveMsg(data.error || "Không thể lưu.");
      return;
    }
    setSavedPlanId(data.savedPlan._id);
    setSaveMsg("Đã lưu vào Phương Án Đã Lưu ✔");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function handlePrintPdf() {
    setPrintMenuOpen(false);
    flushSync(() => {
      setShowBenefitSummary(printSections.benefit);
      accountValueRef.current?.prepareForPrint(printSections);
    });
    window.print();
  }

  async function handleExportImage() {
    if (!fbTemplateRef.current) return;
    setExporting(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => {
        const preload = new window.Image();
        preload.onload = resolve;
        preload.onerror = resolve;
        preload.src = "/images/dad_kids.png";
      });
      const images = Array.from(fbTemplateRef.current.querySelectorAll("img"));
      await Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              })
        )
      );
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(fbTemplateRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `${(mainProduct.productName || "phuong-an").replace(/\s+/g, "-").toLowerCase()}.png`;
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

          <div className={printSections.summary ? "" : "print:hidden"}>
            <SummaryTable mainProduct={mainProduct} people={people} familyTotal={familyTotal} designDate={designDate} />
          </div>

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

          <AccountValueSection
            ref={accountValueRef}
            mainProduct={mainProduct}
            people={people}
            familyTotal={familyTotal}
            designDate={designDate}
          />

          <BrandFooter agent={agent} />

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

      <div style={{ position: "fixed", left: -99999, top: 0 }} aria-hidden="true">
        <div ref={fbTemplateRef}>
          <FacebookImageTemplate
            mainProduct={mainProduct}
            people={people}
            familyTotal={familyTotal}
            designDate={designDate}
            agent={agent}
          />
        </div>
      </div>

      <div className="no-print fixed bottom-6 right-6 flex flex-col items-end gap-2.5 z-40">
        <button
          type="button"
          onClick={() => pageTopRef.current?.scrollIntoView({ behavior: "smooth" })}
          title="Về đầu trang"
          className="w-10 h-10 rounded-full text-white shadow-lg flex items-center justify-center"
          style={{ background: "rgb(224,64,112)" }}
        >
          <ArrowUpIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => pageBottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          title="Xuống cuối trang"
          className="w-10 h-10 rounded-full bg-brand-dark text-white shadow-lg flex items-center justify-center"
        >
          <ArrowDownIcon size={16} />
        </button>

        <button
          type="button"
          onClick={handleSavePlan}
          disabled={saving}
          className="rounded-full text-white text-xs font-semibold px-4 py-2.5 shadow-lg disabled:opacity-60"
          style={{ background: "#0000C1" }}
        >
          {saving ? "Đang lưu..." : "💾 Lưu phương án"}
        </button>
        {saveMsg && <p className="text-[11px] text-brand bg-white rounded-lg px-2 py-1 shadow">{saveMsg}</p>}

        <div className="relative">
          {printMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-[#DED6D8] p-3">
              <p className="text-sm font-bold text-[#312629] mb-2 flex items-center gap-1.5">📄 Chọn nội dung muốn in</p>
              <div className="space-y-1.5 mb-3">
                {PRINT_SECTION_LABELS.map((s, i) => (
                  <label key={s.key} className="flex items-center gap-2 text-xs text-[#312629]">
                    <input
                      type="checkbox"
                      checked={printSections[s.key]}
                      onChange={(e) => setPrintSections((prev) => ({ ...prev, [s.key]: e.target.checked }))}
                    />
                    {i + 1}. {s.label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="w-full rounded-full text-white font-semibold text-sm py-2"
                style={{ background: "rgb(224,64,112)" }}
              >
                🖨️ Lưu PDF ngay
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setPrintMenuOpen((v) => !v)}
            className="rounded-full text-white text-xs font-semibold px-4 py-2.5 shadow-lg"
            style={{ background: "rgb(224,64,112)" }}
          >
            🖨️ Lưu PDF {printMenuOpen ? "▲" : "▼"}
          </button>
        </div>
      </div>
    </div>
  );
}
