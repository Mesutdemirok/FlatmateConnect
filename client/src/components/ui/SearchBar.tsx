import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { searchLocations } from "@/../../shared/tr-locations";

type SearchType = "listing" | "seeker";

export default function SearchBar() {
  const [, navigate] = useLocation();
  const [searchType, setSearchType] = useState<SearchType>("listing");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{
      type: "city" | "district";
      city: string;
      district?: string;
      slug: string;
    }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    citySlug: string;
    districtSlug?: string;
    display: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (selectedLocation && value !== selectedLocation.display)
      setSelectedLocation(null);
    if (value.trim().length >= 2) {
      setSuggestions(searchLocations(value));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (s: (typeof suggestions)[0]) => {
    const display = s.district ? `${s.city} / ${s.district}` : s.city;
    setQuery(display);
    if (s.type === "city") setSelectedLocation({ citySlug: s.slug, display });
    else {
      const [citySlug, districtSlug] = s.slug.split("/");
      setSelectedLocation({ citySlug, districtSlug, display });
    }
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!selectedLocation) {
      if (query.trim())
        navigate(`/arama?type=${searchType}&q=${encodeURIComponent(query)}`);
      return;
    }
    const p = new URLSearchParams();
    p.set("type", searchType);
    p.set("il", selectedLocation.citySlug);
    if (selectedLocation.districtSlug)
      p.set("ilce", selectedLocation.districtSlug);
    if (query && query !== selectedLocation.display) p.set("q", query);
    navigate(`/arama?${p.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
      {/* Compact tabs */}
      <div className="flex gap-1.5 mb-2" role="tablist">
        <button
          role="tab"
          aria-selected={searchType === "listing"}
          aria-controls="search-panel"
          data-testid="tab-listings"
          onClick={() => setSearchType("listing")}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm ring-1
            ${
              searchType === "listing"
                ? "bg-white text-indigo-700 ring-white/40"
                : "bg-white/10 text-white hover:bg-white/20 ring-white/20"
            }`}
        >
          Oda İlanları
        </button>
        <button
          role="tab"
          aria-selected={searchType === "seeker"}
          aria-controls="search-panel"
          data-testid="tab-seekers"
          onClick={() => setSearchType("seeker")}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm ring-1
            ${
              searchType === "seeker"
                ? "bg-white text-indigo-700 ring-white/40"
                : "bg-white/10 text-white hover:bg-white/20 ring-white/20"
            }`}
        >
          Oda Arayanlar
        </button>
      </div>

      {/* Compact input + suggestions + button */}
      <div
        id="search-panel"
        role="tabpanel"
        className="relative flex flex-col gap-2"
      >
        <div className="relative rounded-lg bg-white/10 backdrop-blur-sm ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-white transition-all">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (suggestions.length > 0 || query.length >= 2)
                setShowSuggestions(true);
            }}
            placeholder="Semt, ilçe ya da mahalle yazın…"
            aria-label="Konum ara"
            data-testid="input-search"
            className="w-full px-3 py-2.5 text-white placeholder-white/75 bg-transparent focus:outline-none text-sm md:text-base font-normal"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto z-50"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  data-testid={`suggestion-${i}`}
                  className="w-full px-3 py-2 text-left hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <div className="text-slate-800 text-sm font-medium">
                    {s.district ? `${s.city} / ${s.district}` : s.city}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {s.type === "city" ? "İl" : "İlçe"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          data-testid="button-search"
          aria-label="Ara"
          className="flex items-center justify-center w-full gap-2.5 px-4 py-2.5 text-sm md:text-base bg-white text-indigo-700 font-semibold rounded-lg transition-colors shadow-md hover:bg-indigo-50"
        >
          <Search className="h-5 w-5" />
          <span>Ara</span>
        </button>
      </div>
    </div>
  );
}
