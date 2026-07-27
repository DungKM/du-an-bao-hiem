"use client";

import { useState } from "react";
import { formatVND, calcAgeFromDOB } from "@/lib/finance";
import { HEALTH_CARD_TIERS, MAIN_PRODUCTS, calcPersonRiders, searchOccupations } from "@/lib/premiumCalc";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";

const NONE = "__none__";
const TIER_OPTIONS = HEALTH_CARD_TIERS.inpatient.map((t) => t.tier);

const RIDER_GRID = "grid grid-cols-[1fr_150px_90px] sm:grid-cols-[1fr_180px_100px] gap-2";

function RiderTableHeader() {
  return (
    <div className={`${RIDER_GRID} border-b-2 border-[#DED6D8] pb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500`}>
      <span>Tên quyền lợi</span>
      <span>STBH / Hạng thẻ</span>
      <span className="text-right">Phí đóng (đ)</span>
    </div>
  );
}

function RiderTableRow({ label, hint, enabled, fee, children }) {
  return (
    <div className={`${RIDER_GRID} items-start border-b border-gray-100 py-2.5 last:border-b-0`}>
      <div>
        <p className="text-[13px] font-semibold text-[#312629]">{label}</p>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
      <div className={`text-right text-sm font-semibold pt-0.5 ${enabled ? "text-brand" : "text-gray-300"}`}>{formatVND(fee)}</div>
    </div>
  );
}

function TierSelect({ value, onChange }) {
  return (
    <select
      value={value ? value : NONE}
      onChange={(e) => onChange(e.target.value === NONE ? null : e.target.value)}
      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full"
    >
      <option value={NONE}>0</option>
      {TIER_OPTIONS.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}

function AmountInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value ?? 0}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full"
    />
  );
}

function OccupationField({ person, set }) {
  const [query, setQuery] = useState(person.occupationName || "");
  const [open, setOpen] = useState(false);
  const results = searchOccupations(query);

  function pick(item) {
    setQuery(item.name);
    setOpen(false);
    set({ occupationName: item.name, occupationClass: item.classValue });
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block relative">
        <span className="text-xs font-semibold text-gray-700">Nghề nghiệp</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            set({ occupationName: e.target.value });
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Gõ để tìm nghề nghiệp..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
        />
        {open && results.length > 0 && (
          <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {results.map((r) => (
              <li key={r.name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(r)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-brand-light"
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-gray-700">Loại nghề (tự suy ra)</span>
        <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 bg-gray-50 text-gray-500">
          {person.occupationClass ? `Nhóm ${person.occupationClass}` : "—"}
        </div>
      </label>
    </div>
  );
}

function MainProductFields({ mainProduct, setMainProduct }) {
  return (
    <div className="border-t border-dashed border-gray-200 pt-3 mt-1 space-y-3">
      <p className="text-[13.5px] font-bold text-brand">Sản phẩm chính</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">Tên quyền lợi</span>
          <select
            value={mainProduct.productName}
            onChange={(e) => setMainProduct((p) => ({ ...p, productName: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
          >
            {MAIN_PRODUCTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">Thời gian đóng phí dự kiến (năm)</span>
          <div className="flex items-center border border-gray-200 rounded-lg mt-1 overflow-hidden">
            <input
              type="number"
              value={mainProduct.paymentTerm}
              onChange={(e) => setMainProduct((p) => ({ ...p, paymentTerm: e.target.value === "" ? "" : Number(e.target.value) }))}
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <span className="px-3 text-xs text-gray-400 bg-gray-50 self-stretch flex items-center">năm</span>
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">B1. Số tiền bảo hiểm (STBH)</span>
          <div className="flex items-center border border-gray-200 rounded-lg mt-1 overflow-hidden">
            <input
              type="number"
              value={mainProduct.sumInsured}
              onChange={(e) => setMainProduct((p) => ({ ...p, sumInsured: e.target.value === "" ? "" : Number(e.target.value) }))}
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <span className="px-3 text-xs text-gray-400 bg-gray-50 self-stretch flex items-center">đ</span>
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-gray-700">B2. Mức phí BH (đ/năm)</span>
          <div className="flex items-center border border-gray-200 rounded-lg mt-1 overflow-hidden">
            <input
              type="number"
              value={mainProduct.annualPremium}
              onChange={(e) => setMainProduct((p) => ({ ...p, annualPremium: e.target.value === "" ? "" : Number(e.target.value) }))}
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <span className="px-3 text-xs text-gray-400 bg-gray-50 self-stretch flex items-center">đ/năm</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Dải gợi ý: 10.000.000 – 50.000.000 đ/năm</p>
        </label>
      </div>
    </div>
  );
}

export default function PersonCard({
  person,
  onChange,
  onRemove,
  canWaiver,
  familyPremiumWithoutWaiver,
  title,
  isMain,
  mainProduct,
  setMainProduct,
  designDate,
  collapsed,
  onToggleCollapse,
}) {
  function set(patch) {
    onChange({ ...person, ...patch });
  }
  function setRider(key, patch) {
    onChange({ ...person, riders: { ...person.riders, [key]: { ...person.riders[key], ...patch } } });
  }
  function toggleTier(key, tier, extra) {
    if (tier == null) setRider(key, { enabled: false });
    else setRider(key, { enabled: true, tier, ...extra });
  }

  const { rows, total } = calcPersonRiders(person, familyPremiumWithoutWaiver, designDate);
  const fee = (key) => rows.find((r) => r.key === key)?.fee || 0;
  const computedAge = person.dob ? calcAgeFromDOB(person.dob, designDate) : person.age;

  return (
    <div className="bg-white border border-[#DED6D8] rounded-[14px] overflow-hidden">
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between gap-2 px-[18px] py-3.5 text-left"
      >
        <div>
          <p className="text-[15px] font-bold text-[#312629]">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {person.name || "Chưa nhập tên"} · {computedAge || "?"} tuổi · {person.gender}
            {total > 0 && <span className="text-brand font-semibold"> · {formatVND(total)}/năm</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onRemove && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              ✕ Xóa
            </span>
          )}
          {collapsed ? <ChevronDownIcon size={18} className="text-gray-400" /> : <ChevronUpIcon size={18} className="text-gray-400" />}
        </div>
      </button>

      {!collapsed && (
        <div className="px-[18px] pb-[18px] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">Họ và tên</span>
              <input
                value={person.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Chưa nhập tên"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">Ngày tháng năm sinh</span>
              <input
                type="date"
                value={person.dob || ""}
                onChange={(e) => set({ dob: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">Giới tính</span>
              <select
                value={person.gender}
                onChange={(e) => set({ gender: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              >
                <option>Nam</option>
                <option>Nữ</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-700">Tuổi (tự động tính)</span>
              <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 bg-gray-50 text-gray-500">
                {computedAge != null && computedAge !== "" ? `${computedAge} tuổi` : "—"}
              </div>
            </label>
          </div>

          <OccupationField person={person} set={set} />

          {isMain && <MainProductFields mainProduct={mainProduct} setMainProduct={setMainProduct} />}

          <p className="text-xs font-bold text-[#6B7876] pt-1 uppercase tracking-wide">Quyền lợi đính kèm</p>
          <div className="border border-gray-200 rounded-lg px-3">
            <RiderTableHeader />

            <RiderTableRow
              label="Thẻ Sức Khỏe Trọn Đời — Nội trú"
              hint='Hạn mức năm: Cơ bản 150tr · Nâng cao 350tr · Toàn diện 700tr · Hoàn hảo 1.2 tỷ. Chọn "Toàn diện"/"Hoàn hảo" sẽ tự gồm quyền lợi thai sản.'
              enabled={person.riders.healthCardInpatient.enabled}
              fee={fee("healthCardInpatient")}
            >
              <TierSelect
                value={person.riders.healthCardInpatient.enabled ? person.riders.healthCardInpatient.tier : null}
                onChange={(tier) => toggleTier("healthCardInpatient", tier)}
              />
              <select
                value={person.riders.healthCardInpatient.scope}
                onChange={(e) => setRider("healthCardInpatient", { scope: e.target.value })}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-full"
              >
                <option value="vn">Phạm vi: Việt Nam</option>
                <option value="global">Phạm vi: Toàn cầu</option>
              </select>
            </RiderTableRow>

            <RiderTableRow
              label="Thẻ Sức Khỏe Trọn Đời — Ngoại trú"
              hint="Hạn mức năm: Cơ bản 6tr · Nâng cao 12tr · Toàn diện 24tr · Hoàn hảo 48tr"
              enabled={person.riders.healthCardOutpatient.enabled}
              fee={fee("healthCardOutpatient")}
            >
              <TierSelect
                value={person.riders.healthCardOutpatient.enabled ? person.riders.healthCardOutpatient.tier : null}
                onChange={(tier) => toggleTier("healthCardOutpatient", tier)}
              />
            </RiderTableRow>

            <RiderTableRow
              label="Thẻ Sức Khỏe Trọn Đời — Nha khoa"
              hint="Hạn mức năm theo hạng đã chọn"
              enabled={person.riders.healthCardDental.enabled}
              fee={fee("healthCardDental")}
            >
              <TierSelect
                value={person.riders.healthCardDental.enabled ? person.riders.healthCardDental.tier : null}
                onChange={(tier) => toggleTier("healthCardDental", tier)}
              />
            </RiderTableRow>

            <RiderTableRow
              label="Bảo hiểm Hỗ trợ chi phí nằm viện (TCYT)"
              hint="Nhập mức trợ cấp/ngày nằm viện (đ)"
              enabled={person.riders.hospitalCash.enabled}
              fee={fee("hospitalCash")}
            >
              <AmountInput
                value={person.riders.hospitalCash.amountPerDay}
                onChange={(v) => setRider("hospitalCash", { enabled: v > 0, amountPerDay: v })}
              />
            </RiderTableRow>

            <RiderTableRow
              label="Bảo hiểm Toàn diện Bệnh hiểm nghèo 2.0"
              hint="STBH bệnh hiểm nghèo (giai đoạn sớm/giữa/nghiêm trọng gộp 1 quyền lợi)"
              enabled={person.riders.criticalIllness.enabled}
              fee={fee("criticalIllness")}
            >
              <AmountInput
                value={person.riders.criticalIllness.sumInsured}
                onChange={(v) => setRider("criticalIllness", { enabled: v > 0, sumInsured: v })}
              />
            </RiderTableRow>

            <RiderTableRow
              label="Bảo hiểm tử kỳ gia hạn hàng năm"
              hint="STBH tử kỳ — phí tái tục tăng theo tuổi mỗi năm"
              enabled={person.riders.termLife.enabled}
              fee={fee("termLife")}
            >
              <AmountInput
                value={person.riders.termLife.sumInsured}
                onChange={(v) => setRider("termLife", { enabled: v > 0, sumInsured: v })}
              />
            </RiderTableRow>

            <RiderTableRow
              label="Bảo hiểm Tử vong &amp; thương tật do tai nạn"
              hint="Phí cố định theo loại nghề nghiệp (không theo tuổi)"
              enabled={person.riders.accident.enabled}
              fee={fee("accident")}
            >
              <AmountInput
                value={person.riders.accident.sumInsured}
                onChange={(v) => setRider("accident", { enabled: v > 0, sumInsured: v })}
              />
            </RiderTableRow>

            {canWaiver && (
              <RiderTableRow
                label="Bảo hiểm Miễn thu phí 3.0"
                hint="Nếu người này tử vong/thương tật, miễn toàn bộ phí năm sau của cả gia đình"
                enabled={person.riders.waiver.enabled}
                fee={fee("waiver")}
              >
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={person.riders.waiver.enabled}
                    onChange={(e) => setRider("waiver", { enabled: e.target.checked })}
                  />
                  Tham gia
                </label>
              </RiderTableRow>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold">
            <span>Tổng phí quyền lợi đính kèm</span>
            <span className="text-brand">{formatVND(total)}/năm</span>
          </div>
        </div>
      )}
    </div>
  );
}
