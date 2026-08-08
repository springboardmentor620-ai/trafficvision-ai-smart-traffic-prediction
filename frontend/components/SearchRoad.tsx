"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

interface Road {
  road_id: number;
  road_name: string;
  zone: string;
}

interface Props {
  roads: Road[];
  selectedRoad: Road | null;
  setSelectedRoad: (road: Road | null) => void;
  onSearch: () => void;
}

export default function SearchRoad({
  roads,
  selectedRoad,
  setSelectedRoad,
  onSearch,
}: Props) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredRoads = useMemo(() => {
    if (!query.trim()) return [];

    return roads.filter(
      (road) =>
        road.road_name.toLowerCase().includes(query.toLowerCase()) ||
        road.zone.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, roads]);

  return (
    <div className="w-full max-w-3xl relative">

      <div className="flex gap-3">

        <div className="relative flex-1">

          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search road name or area..."
            className="w-full rounded-lg border border-gray-700 bg-slate-900 text-white pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
          />

          {showSuggestions && filteredRoads.length > 0 && (
            <div className="absolute w-full mt-2 rounded-lg bg-slate-900 border border-gray-700 shadow-xl z-50 max-h-64 overflow-y-auto">

              {filteredRoads.map((road) => (

                <button
                  key={road.road_id}
                  onClick={() => {
                    setSelectedRoad(road);
                    setQuery(`${road.road_name} (${road.zone})`);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-800 transition"
                >

                  <div className="font-semibold text-white">
                    {road.road_name}
                  </div>

                  <div className="text-sm text-gray-400">
                    {road.zone}
                  </div>

                </button>

              ))}

            </div>
          )}

        </div>

        <button
          onClick={onSearch}
          disabled={!selectedRoad}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 px-6 rounded-lg text-white font-semibold"
        >
          Search
        </button>

      </div>

      {selectedRoad && (
        <div className="mt-3 text-green-400 text-sm">
          Selected Road:{" "}
          <strong>
            {selectedRoad.road_name}
          </strong>{" "}
          ({selectedRoad.zone})
        </div>
      )}
    </div>
  );
}