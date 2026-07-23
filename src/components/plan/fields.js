"use client";

export function NumField({ label, value, onChange, suffix, hint }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <div className="flex items-center border border-gray-200 rounded-lg mt-1 overflow-hidden focus-within:border-brand/40">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
        />
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
