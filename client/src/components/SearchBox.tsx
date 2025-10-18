import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Search, MapPin } from "lucide-react";

type Mode = "rooms" | "flatmates";

export default function SearchBox() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("rooms");
  const [location, setLocation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qp = new URLSearchParams();
    const trimmed = location.trim();
    if (trimmed) qp.set("location", trimmed);

    const path = mode === "rooms" ? "/oda-ilanlari" : "/oda-aramalari";
    navigate(qp.toString() ? `${path}?${qp.toString()}` : path);
  }

  return (
    <section
      className="
        w-full
        -mt-6 sm:-mt-10 md:-mt-12   /* keeps the card tucked under hero on larger screens */
        mb-8 sm:mb-10 md:mb-12
      "
      aria-label={t("search.box_aria", "Arama kutusu")}
    >
      <div className="mx-auto max-w-[1100px] px-3">
        <div
          className="
            rounded-2xl border border-indigo-100
            bg-gradient-to-br from-indigo-50 via-white to-violet-50
            shadow-lg
          "
        >
          {/* Tabs (accessible segmented control) */}
          <fieldset
            className="p-2"
            role="radiogroup"
            aria-label={t("search.mode", "Arama türü")}
          >
            <div
              className="
                grid grid-cols-2 gap-2
                bg-white rounded-xl p-1
              "
            >
              <label
                className={`
                  relative inline-flex items-center justify-center
                  rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer
                  transition-all
                  ${
                    mode === "rooms"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                      : "bg-transparent text-slate-700 hover:bg-slate-50"
                  }
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
                  rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer
                  transition-all
                  ${
                    mode === "flatmates"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                      : "bg-transparent text-slate-700 hover:bg-slate-50"
                  }
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
          <form onSubmit={onSubmit} className="p-4 sm:p-6 pt-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500"
                  aria-hidden
                />
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
                      : "Hangi şehir veya semtte oda arkadaşı arıyorsunuz?",
                  )}
                  autoComplete="off"
                  className="
                    w-full h-12 rounded-xl border-2 border-indigo-200
                    pl-11 pr-4 outline-none
                    focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                    bg-white text-slate-800 placeholder:text-slate-400
                  "
                  data-testid="input-location"
                />
              </div>

              <button
                type="submit"
                aria-label={t("search.submit", "Ara")}
                className="
                  h-12 px-8 rounded-xl
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-700 hover:to-violet-700
                  text-white font-semibold
                  transition-all
                  shadow-md hover:shadow-lg
                  flex items-center justify-center gap-2
                  sm:w-auto w-full
                "
                data-testid="button-search"
              >
                <Search className="h-5 w-5" />
                {t("search.submit", "Ara")}
              </button>
            </div>

            {/* Tiny helper on mobile */}
            <p className="mt-2 text-xs text-slate-500 sm:hidden">
              {t(
                "search.helper_text",
                "Konum boş bırakılırsa tüm ilanlarda arama yapılır.",
              )}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
