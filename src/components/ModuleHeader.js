export default function ModuleHeader({ icon, title, module }) {
  return (
    <div className="bg-brand flex items-center gap-3 px-[18px] py-3.5 rounded-2xl border-b-[3px] border-brand-accent mb-5 no-print">
      <div className="h-[34px] w-[34px] rounded-[10px] bg-brand-accent/20 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <span className="flex-1 text-[15px] font-extrabold text-white">{title}</span>
      <span className="text-[11px] font-bold px-[9px] py-[3px] rounded-full bg-white/20 text-white">
        Module {module}
      </span>
    </div>
  );
}
