"use client";

// Input số tiền: hiển thị có dấu chấm phân cách hàng nghìn (vi-VN) trong lúc
// gõ, nhưng giá trị trả về qua onChange luôn là số nguyên thuần.
export function MoneyInput({ value, onChange, className, placeholder }) {
  const display = value === "" || value === null || value === undefined ? "" : Number(value).toLocaleString("vi-VN");
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        onChange(digits === "" ? "" : Number(digits));
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}

export function NumField({ label, value, onChange, suffix, hint }) {
  const isMoney = suffix?.startsWith("đ");
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <div className="flex items-center border border-gray-200 rounded-lg mt-1 overflow-hidden focus-within:border-brand/40">
        {isMoney ? (
          <MoneyInput
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />
        ) : (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />
        )}
        {suffix && <span className="px-3 text-xs text-gray-400 bg-gray-50 self-stretch flex items-center">{suffix}</span>}
      </div>
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg mt-1 px-3 py-2 text-sm text-gray-700 outline-none focus-within:border-brand/40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ResultLine({ label, value, strong }) {
  return (
    <div
      className={`flex justify-between py-1.5 ${
        strong ? "border-t-2 border-brand mt-1.5 pt-2.5" : "border-b border-dashed border-gray-200 last:border-none"
      }`}
    >
      <span className={strong ? "font-semibold" : "text-gray-600"}>{label}</span>
      <span className={strong ? "font-extrabold text-brand text-[18px]" : "font-medium"}>{value}</span>
    </div>
  );
}
