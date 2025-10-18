import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Search, MapPin, X } from "lucide-react";

type Mode = "rooms" | "flatmates";

export default function SearchBox() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("rooms");
  const [location, setLocation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const m = localStorage.getItem("search-mode") as Mode | null;
    if (m === "rooms" || m === "flatmates") setMode(m);
  }, []);
  useEffect(() => {
    localStorage.setItem("search-mode", mode);
  }, [mode]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = location.trim().replace(/\s+/g, " ");
    const qp = new URLSearchParams();
    if (trimmed) qp.set("location", trimmed);
    const path = mode === "rooms" ? "/oda-ilanlari" : "/oda-aramalari";
    navigate(qp.toString() ? `${path}?${qp.toString()}` : path);
  }

  return (
    <section
      aria-label={t("search.box_aria", "Arama kutusu")}
      className="w-full mt-5 sm:mt-8 md:mt-10 mb-8 sm:mb-10 md:mb-12"
    >
      <div className="mx-auto max-w-[1100px] px-3">
        <div
          className="
            rounded-2xl border border-indigo-100
            bg-gradient-to-br from-indigo-50 via-white to-violet-50
            shadow-lg
          "
        >
          {/* Tabs */}
          <fieldset className="p-2" role="radiogroup" aria-label={t("search.mode", "Arama türü")}>
            <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-1">
              <label
                className={`
                  relative inline-flex items-center justify-center
                  rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all select-none
                  ${mode === "rooms"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                    : "bg-transparent text-slate-700 hover:bg-slate-50"}
                `}
              >
                <input
                  type="radio"
                  name="search-mode"
                  value="rooms"
                  checked={mode === "rooms"}
                  onChange={() => setMode("rooms")}
                  className="sr-only"
                  aria-checked={mode === "rooms"}
                />
                {t("search.rooms_tab", "Oda Ara")}
              </label>

              <label
                className={`
                  relative inline-flex items-center justify-center
                  rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all select-none
                  ${mode === "flatmates"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                    : "bg-transparent text-slate-700 hover:bg-slate-50"}
                `}
              >
                <input
                  type="radio"
                  name="search-mode"
                  value="flatmates"
                  checked={mode === "flatmates"}
                  onChange={() => setMode("flatmates")}
                  className="sr-only"
                  aria-checked={mode === "flatmates"}
                />
                {t("search.flatmates_tab", "Oda Arkadaşı Ara")}
              </label>
            </div>
          </fieldset>

          {/* Form */}
          <form role="search" onSubmit={onSubmit} className="p-4 sm:p-6 pt-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
                <label htmlFor="home-search-location" className="sr-only">
                  {t("search.location_label", "Konum")}
                </label>
                <input
                  id="home-search-location"
                  ref={inputRef}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t(
                    "search.location_ph",
                    mode === "rooms"
                      ? "Hangi şehir veya semtte oda arıyorsunuz?"
                      : "Hangi şehir veya semtte oda arkadaşı arıyorsunuz?"
                  )}
                  autoComplete="address-level2"
                  inputMode="search"
                  maxLength={120}
                  className="
                    w-full h-12 rounded-xl border-2 border-indigo-200
                    pl-11 pr-10 outline-none
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                    bg-white text-slate-800 placeholder:text-slate-400
                  "
                  data-testid="input-location"
                />
                {location && (
                  <button
                    type="button"
                    aria-label={t("search.clear", "Temizle")}
                    onClick={() => {
                      setLocation("");
                      inputRef.current?.focus();
                    }}
                    className="
                      absolute right-2 top-1/2 -translate-y-1/2
                      inline-flex h-7 w-7 items-center justify-center
                      rounded-full bg-white text-slate-600
                      ring-1 ring-slate-200 hover:bg-slate-50
                    "
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                aria-label={t("search.submit", "Ara")}
                className="
                  h-12 px-8 rounded-xl
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-700 hover:to-violet-700
                  text-white font-semibold
                  transition-all shadow-md hover:shadow-lg
                  flex items-center justify-center gap-2
                  sm:w-auto w-full
                "
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