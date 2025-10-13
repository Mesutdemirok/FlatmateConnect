import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { searchLocations, normalizeTurkish } from "@/../../shared/tr-locations";

type SearchType = "listing" | "seeker";

export default function SearchBar() {
  const [, navigate] = useLocation();
  const [searchType, setSearchType] = useState<SearchType>("listing");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{type: 'city' | 'district', city: string, district?: string, slug: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{citySlug: string, districtSlug?: string, display: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    
    if (value.length >= 2) {
      const results = searchLocations(value);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    const display = suggestion.district 
      ? `${suggestion.city} / ${suggestion.district}` 
      : suggestion.city;
    
    setQuery(display);
    
    if (suggestion.type === 'city') {
      setSelectedLocation({ citySlug: suggestion.slug, display });
    } else {
      const [citySlug, districtSlug] = suggestion.slug.split('/');
      setSelectedLocation({ citySlug, districtSlug, display });
    }
    
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!selectedLocation) {
      if (query.trim()) {
        navigate(`/arama?type=${searchType}&q=${encodeURIComponent(query)}`);
      }
      return;
    }

    const params = new URLSearchParams();
    params.set('type', searchType);
    params.set('il', selectedLocation.citySlug);
    
    if (selectedLocation.districtSlug) {
      params.set('ilce', selectedLocation.districtSlug);
    }
    
    if (query && query !== selectedLocation.display) {
      params.set('q', query);
    }
    
    navigate(`/arama?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-3" role="tablist">
        <button
          role="tab"
          aria-selected={searchType === "listing"}
          aria-controls="search-panel"
          data-testid="tab-listings"
          onClick={() => setSearchType("listing")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            searchType === "listing"
              ? "bg-white text-indigo-600 shadow-sm"
              : "bg-white/20 text-white hover:bg-white/30"
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
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            searchType === "seeker"
              ? "bg-white text-indigo-600 shadow-sm"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          Oda Arayanlar
        </button>
      </div>

      {/* Search Input */}
      <div
        id="search-panel"
        role="tabpanel"
        className="relative bg-white rounded-2xl ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-indigo-500 transition-all"
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 p-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Semt, ilçe ya da mahalle yazın…"
              aria-label="Konum ara"
              data-testid="input-search"
              className="w-full px-4 py-3 text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 max-h-60 overflow-y-auto z-50"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    data-testid={`suggestion-${index}`}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <div className="text-slate-800 font-medium">
                      {suggestion.district 
                        ? `${suggestion.city} / ${suggestion.district}`
                        : suggestion.city}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {suggestion.type === 'city' ? 'İl' : 'İlçe'}
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
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors sm:rounded-lg"
          >
            <Search className="h-5 w-5" />
            <span>Ara</span>
          </button>
        </div>
      </div>
    </div>
  );
}
