import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Search, MapPin } from "lucide-react";

export default function SearchBox() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"rooms"|"flatmates">("rooms");
  const [location, setLocation] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qp = new URLSearchParams();
    if (location) qp.set("location", location);
    navigate(mode === "rooms" ? `/oda-ilanlari?${qp.toString()}` : `/oda-aramalari?${qp.toString()}`);
  }

  return (
    <section className="w-full -mt-6 sm:-mt-10 mb-8">
      <div className="mx-auto max-w-[1100px] px-3">
        <div className="rounded-2xl shadow-lg bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100">
          {/* Tabs */}
          <div className="flex p-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("rooms")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode==="rooms" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md" : "bg-white text-slate-700 hover:bg-slate-50"}`}
              data-testid="tab-rooms"
            >
              {t("search.rooms_tab", "Oda Ara")}
            </button>
            <button
              type="button"
              onClick={() => setMode("flatmates")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode==="flatmates" ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md" : "bg-white text-slate-700 hover:bg-slate-50"}`}
              data-testid="tab-flatmates"
            >
              {t("search.flatmates_tab", "Oda Arkadaşı Ara")}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-4 sm:p-6 pt-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("search.location_ph", mode === "rooms" ? "Hangi şehir veya semtte oda arıyorsunuz?" : "Hangi şehir veya semtte oda arkadaşı arıyorsunuz?")}
                  className="w-full h-12 rounded-xl border-2 border-indigo-200 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-800 placeholder:text-slate-400"
                  data-testid="input-location"
                />
              </div>
              <button
                type="submit"
                aria-label={t("search.submit","Ara")}
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 sm:w-auto w-full"
                data-testid="button-search"
              >
                <Search className="h-5 w-5" />
                {t("search.submit", "Ara")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
