"use client";

import { useEffect, useMemo, useState } from "react";
import PlanReport from "@/components/plan/PlanReport";
import { normalizeIncome } from "@/components/plan/budgetItems";
import { calcAgeFromDOB } from "@/lib/finance";
import {
  calcProtection,
  calcEducation,
  calcRetirement,
  calcWealth,
  calcHealth,
} from "@/lib/planCalculations";

export default function CustomerListClient({ agent }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/customers");
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.customers || []);
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const s = search.trim().toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(s) || (c.phone || "").includes(s) || (c.email || "").toLowerCase().includes(s)
    );
  }, [customers, search]);

  async function handleDelete(id) {
    if (!window.confirm("Xóa khách hàng này khỏi danh sách?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    load();
  }

  function openDetail(c) {
    const plan = c.financialPlan;
    if (!plan) return;
    const income = normalizeIncome(plan.income);
    const needs = plan.needs || {};
    const results = {
      protection: needs.protection?.selected ? calcProtection(needs.protection) : null,
      education: needs.education?.selected ? calcEducation(needs.education.children) : null,
      retirement: needs.retirement?.selected ? calcRetirement(needs.retirement) : null,
      wealth: needs.wealth?.selected ? calcWealth(needs.wealth) : null,
      health: needs.health?.selected ? calcHealth(needs.health) : null,
    };
    setDetail({ customer: c, income, needs, results });
  }

  return (
    <div>
      <div className={detail ? "no-print" : ""}>
        <div className="bg-brand flex items-center gap-3 px-[18px] py-3.5 rounded-2xl border-b-[3px] border-brand-accent mb-5">
          <div className="h-[34px] w-[34px] rounded-[10px] bg-brand-accent/20 flex items-center justify-center text-lg shrink-0">
            👥
          </div>
          <h1 className="flex-1 text-[15px] font-extrabold text-white">Danh Sách Khách Hàng Đã Lưu</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Tìm theo tên, SĐT, email..."
              className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px]"
            />
            <span className="text-sm text-gray-400 shrink-0">{filtered.length} khách hàng</span>
          </div>

          {loading && <p className="text-center py-6 text-gray-400 text-sm">Đang tải...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-center py-6 text-gray-400 text-sm">Chưa có khách hàng nào.</p>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <div className="sm:hidden space-y-2">
                {filtered.map((c, i) => (
                  <div key={c._id} className="border border-gray-100 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <span className="text-xs text-gray-400 shrink-0">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      {c.source === "public" && (
                        <span className="text-[10px] font-semibold text-brand bg-brand-light rounded px-1.5 py-0.5">
                          🔗 Tự gửi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {c.financialPlan && (
                        <button onClick={() => openDetail(c)} className="text-brand text-sm">
                          👁️ Xem
                        </button>
                      )}
                      <button onClick={() => handleDelete(c._id)} className="text-gray-400">✕</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="text-left text-gray-400 border-b">
                      <th className="py-2">STT</th>
                      <th>Tên KH</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => (
                      <tr key={c._id} className="border-b border-gray-100">
                        <td className="py-2">{i + 1}</td>
                        <td className="font-medium">
                          {c.name}
                          {c.source === "public" && (
                            <span className="ml-1.5 text-[10px] font-semibold text-brand bg-brand-light rounded px-1.5 py-0.5 align-middle">
                              🔗 Tự gửi
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap">
                          {c.financialPlan && (
                            <button onClick={() => openDetail(c)} className="text-brand mr-3">
                              👁️ Xem
                            </button>
                          )}
                          <button onClick={() => handleDelete(c._id)} className="text-gray-400">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-[200] overflow-auto py-8 px-3 print:static print:bg-white print:p-0">
          <div className="relative w-full max-w-3xl print:max-w-none">
            <button
              onClick={() => setDetail(null)}
              aria-label="Đóng"
              className="no-print absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-gray-500 shadow-md flex items-center justify-center text-sm font-bold hover:bg-gray-100 z-10"
            >
              ✕
            </button>
            <PlanReport
              customerName={detail.customer.name}
              customer={{
                ...detail.customer,
                age: detail.customer.dob ? calcAgeFromDOB(detail.customer.dob) : null,
              }}
              income={detail.income}
              needs={detail.needs}
              surveyAnswers={detail.customer.financialPlan?.surveyAnswers}
              results={detail.results}
              agent={agent}
              reportDate={new Date(detail.customer.updatedAt).toLocaleDateString("vi-VN")}
              onPrint={() => window.print()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
