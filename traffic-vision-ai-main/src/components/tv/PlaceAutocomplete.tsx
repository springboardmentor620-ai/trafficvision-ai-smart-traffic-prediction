import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { searchPlaces } from "@/lib/route-planner.functions";
import { cn } from "@/lib/utils";

type Place = {
  id: number;
  name: string;
  area: string;
  category: string;
  lat: number;
  lng: number;
};

/** Google-Maps-style autocomplete over the Bengaluru dataset gazetteer. */
export function PlaceAutocomplete({
  value,
  onChange,
  placeholder,
  icon,
  className,
}: {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(value);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setTerm(value), [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const [debounced, setDebounced] = useState(term);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 200);
    return () => clearTimeout(t);
  }, [term]);

  const q = useQuery({
    queryKey: ["places", debounced],
    queryFn: () => searchPlaces({ data: { q: debounced, limit: 8 } }) as Promise<Place[]>,
    enabled: open && debounced.trim().length >= 2,
    staleTime: 60_000,
  });

  const results = q.data ?? [];

  return (
    <div ref={box} className={cn("relative", className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
        {icon ?? <MapPin className="h-4 w-4" />}
      </span>
      <Input
        className="pl-9"
        value={term}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setTerm(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
      />
      {q.isFetching && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {open && debounced.trim().length >= 2 && (
        <div className="absolute z-[900] mt-2 w-full overflow-hidden rounded-2xl border bg-popover shadow-[var(--shadow-soft)]">
          {results.length === 0 && !q.isFetching ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">No matching location in the dataset</p>
          ) : (
            <ul className="max-h-72 overflow-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setTerm(p.name);
                      onChange(p.name);
                      setOpen(false);
                    }}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.category} · {p.area}, Bengaluru
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
