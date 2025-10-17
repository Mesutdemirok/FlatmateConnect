import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function SearchBox() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"rooms"|"flatmates">("rooms");
  const [location, setLocation] = useState("");
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qp = new URLSearchParams();
    if (location) qp.set("location", location);
    if (min) qp.set(mode === "rooms" ? "minPrice" : "minBudget", min);
    if (max) qp.set(mode === "rooms" ? "maxPrice" : "maxBudget", max);
    navigate(mode === "rooms" ? `/oda-ilanlari?${qp.toString()}` : `/oda-aramalari?${qp.toString()}`);
  }

  return (
    <section className="w-full -mt-6 sm:-mt-10">
      <div className="mx-auto max-w-[1100px] px-3">
        <div className="rounded-2xl shadow-md bg-white/90 backdrop-blur border border-slate-200">
          {/* Tabs */}
          <div className="flex p-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("rooms")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode==="rooms" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              data-testid="tab-rooms"
            >
              {t("search.rooms_tab", "Oda Ara")}
            </button>
            <button
              type="button"
              onClick={() => setMode("flatmates")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${mode==="flatmates" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              data-testid="tab-flatmates"
            >
              {t("search.flatmates_tab", "Oda Arkadaşı Ara")}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-4 sm:p-6 pt-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">
                  {t("search.location_label", "Konum")}
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("search.location_ph", "Semt / İlçe / Şehir")}
                  className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  data-testid="input-location"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">
                  {mode==="rooms" ? t("search.min_price","Min Kira") : t("search.min_budget","Min Bütçe")}
                </label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  placeholder="0"
                  className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  data-testid="input-min"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-600 mb-1">
                  {mode==="rooms" ? t("search.max_price","Maks Kira") : t("search.max_budget","Maks Bütçe")}
                </label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  placeholder="10000"
                  className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  data-testid="input-max"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  aria-label={t("search.submit","Ara")}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                  data-testid="button-search"
                >
                  {t("search.submit", "Ara")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
