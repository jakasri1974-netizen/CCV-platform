import React, { useState, useEffect, useRef, useId } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

/**
 * Enterprise SearchableAutocomplete / SearchableSelect Component
 * Supports keyboard navigation, click outside to close, clear selection, and type-to-search query requirement.
 */
export default function SearchableSelect({
  label,
  placeholder = "Search...",
  options = [],
  value,
  onChange,
  disabled = false,
  icon: Icon,
  required = false,
  dark = false,
  className = "",
  emptyMessage = "No matching results found",
  typeToSearchText = "Type to search options...",
  requireQueryToOpen = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  // Normalize options array into objects: { value, label, subtitle, searchTerms }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt, subtitle: '', searchTerms: opt };
    }
    const val = opt.value || opt._id || opt.id || opt.code || opt.collegeId || opt.courseId || '';
    const lbl = opt.label || opt.name || opt.collegeName || opt.courseName || val;
    const sub = opt.subtitle || opt.district || opt.departmentCode || opt.degreeType || opt.code || '';
    const terms = opt.searchTerms || `${lbl} ${val} ${sub}`;
    return {
      value: val,
      label: lbl,
      subtitle: sub,
      searchTerms: terms,
      original: opt,
    };
  });

  // Determine currently selected option object
  const selectedOption = normalizedOptions.find((opt) => {
    if (!value) return false;
    if (typeof value === 'object') {
      const vVal = value.value || value._id || value.id || value.collegeId || value.courseId;
      return opt.value === vVal;
    }
    return opt.value === value || opt.label === value;
  });

  // Filter options based on query
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase().trim();
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.value.toString().toLowerCase().includes(q) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(q)) ||
      (opt.searchTerms && opt.searchTerms.toLowerCase().includes(q))
    );
  });

  // If query is empty and requireQueryToOpen is false, show top options (capped to 20)
  const displayOptions = !query.trim() && !requireQueryToOpen ? normalizedOptions.slice(0, 20) : filteredOptions;

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle option selection
  const handleSelect = (option) => {
    if (onChange) {
      onChange(option ? (option.original || option) : null);
    }
    setIsOpen(false);
    setQuery("");
    setHighlightedIndex(0);
  };

  // Clear current selection
  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) onChange(null);
    setQuery("");
    if (inputRef.current) inputRef.current.focus();
  };

  // Keyboard Navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % Math.max(1, displayOptions.length));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + displayOptions.length) % Math.max(1, displayOptions.length));
        break;
      case 'Enter':
        e.preventDefault();
        if (displayOptions[highlightedIndex]) {
          handleSelect(displayOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery("");
        break;
      default:
        break;
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      {label && (
        <label className={`block text-xs font-semibold mb-1 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input / Control Box */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            if (inputRef.current) inputRef.current.focus();
          }
        }}
        className={`relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-all cursor-pointer ${
          dark
            ? 'bg-slate-900/90 border border-slate-700 text-white shadow-inner focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
            : 'bg-white border border-slate-300 text-slate-900 shadow-xs focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      >
        {Icon && <Icon className={`w-4 h-4 shrink-0 ${dark ? 'text-indigo-400' : 'text-slate-400'}`} />}

        <div className="flex-1 flex items-center min-w-0">
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={selectedOption ? selectedOption.label : placeholder}
              className={`w-full bg-transparent outline-none font-medium text-xs ${
                dark ? 'text-white placeholder:text-slate-400' : 'text-slate-900 placeholder:text-slate-400'
              }`}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={isOpen}
            />
          ) : (
            <span
              className={`truncate font-semibold text-xs ${
                selectedOption
                  ? dark
                    ? 'text-white font-bold'
                    : 'text-slate-900 font-bold'
                  : dark
                  ? 'text-slate-400'
                  : 'text-slate-400'
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>

        {/* Action Controls (Clear & Chevron) */}
        <div className="flex items-center gap-1 shrink-0">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-1 rounded-full transition ${
                dark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }`}
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
              dark ? 'text-slate-400' : 'text-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Popover Dropdown Results */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={`absolute z-50 mt-1.5 w-full rounded-2xl border shadow-xl overflow-hidden max-h-60 overflow-y-auto font-sans transition-all duration-150 ${
            dark ? 'bg-slate-900 border-slate-700 text-white shadow-slate-950/80' : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
          }`}
        >
          {/* Quick Search Header inside Dropdown */}
          <div className={`p-2 border-b text-[11px] font-semibold flex items-center gap-1.5 ${dark ? 'border-slate-800 text-slate-400 bg-slate-800/40' : 'border-slate-100 text-slate-500 bg-slate-50'}`}>
            <Search className="w-3.5 h-3.5" />
            <span>{query.trim() ? `Search results (${filteredOptions.length})` : 'Type to search...'}</span>
          </div>

          {!query.trim() && requireQueryToOpen ? (
            <div className={`p-4 text-center text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="font-semibold">{typeToSearchText}</div>
              <div className="text-[10px] mt-0.5 text-slate-400">Type course code, title, or college name</div>
            </div>
          ) : displayOptions.length > 0 ? (
            <div className="py-1">
              {displayOptions.map((opt, idx) => {
                const isSelected = selectedOption && selectedOption.value === opt.value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.value + "-" + idx}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2.5 text-xs flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? dark
                          ? 'bg-indigo-600/30 text-indigo-300 font-bold'
                          : 'bg-indigo-50 text-indigo-700 font-bold'
                        : isHighlighted
                        ? dark
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-900'
                        : dark
                        ? 'text-slate-200 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="truncate font-semibold">{opt.label}</div>
                      {opt.subtitle && (
                        <div className={`text-[10px] truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {opt.subtitle}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-4 text-center text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
