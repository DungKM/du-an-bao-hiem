import { Suspense } from "react";
import CompareClient from "@/components/compare/CompareClient";

export default function SoSanhDongPhiPage() {
  return (
    <Suspense fallback={null}>
      <CompareClient />
    </Suspense>
  );
}
