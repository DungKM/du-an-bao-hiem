"use client";

export default function NeedCard({ icon, title, subtitle, selected, onToggle, children }) {
  return (
    <div className="bg-white border border-[#DED6D8] rounded-[14px] p-[18px] mb-3.5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-brand flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <p className="text-[16px] font-bold text-[#312629]">{title}</p>
            <p className="text-[13px] text-[#6B7876] mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onToggle(true)}
            className={`text-sm font-semibold px-[18px] py-2 rounded-lg border ${
              selected === true
                ? "bg-brand text-white border-brand"
                : "border-[#DED6D8] text-[#312629] bg-transparent"
            }`}
          >
            Có
          </button>
          <button
            type="button"
            onClick={() => onToggle(false)}
            className={`text-sm font-semibold px-[18px] py-2 rounded-lg border ${
              selected === false
                ? "bg-gray-700 text-white border-gray-700"
                : "border-[#DED6D8] text-[#312629] bg-transparent"
            }`}
          >
            Không
          </button>
        </div>
      </div>
      {selected === true && (
        <div className="mt-4 pt-4 border-t border-[#EFE7E9] grid grid-cols-2 gap-3">{children}</div>
      )}
    </div>
  );
}
