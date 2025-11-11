// ODANET Mobil Detay Revizyonu – Ortak Tanım Listesi Bileşeni
import { ReactNode } from "react";

export interface DefinitionItem {
  label: string;
  value: string | number | ReactNode;
  hideIfNull?: boolean;
}

interface DefinitionListProps {
  items: DefinitionItem[];
  columns?: 1 | 2;
}

export default function DefinitionList({ items, columns = 1 }: DefinitionListProps) {
  const visibleItems = items.filter((item) => {
    if (item.hideIfNull && (item.value === null || item.value === undefined || item.value === "")) {
      return false;
    }
    return true;
  });

  return (
    <dl
      className={`grid gap-4 ${
        columns === 2 ? "grid-cols-1 md:grid-cols-2 md:gap-x-6" : "grid-cols-1"
      }`}
      data-testid="definition-list"
    >
      {visibleItems.map((item, index) => (
        <div key={index} className="space-y-1">
          <dt className="text-slate-500 uppercase tracking-wide text-[11px] font-medium">
            {item.label}
          </dt>
          <dd className="text-slate-900 font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
