"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, LogOut, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";

export function Topbar() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [roads, setRoads] = useState<api.Road[]>([]);
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Load roads
  useEffect(() => {
    if (!token) return;

    api
      .listRoads(token)
      .then((data) => {
        console.log("ROADS LOADED:", data);
        setRoads(data);
      })
      .catch((error) => {
        console.error("FAILED TO LOAD ROADS:", error);
      });
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search roads
  const results = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return [];

    return roads
      .filter((road) => {
        const roadName = road.name?.toLowerCase() ?? "";
        const zone = road.zone?.toLowerCase() ?? "";

        return (
          roadName.includes(search) ||
          zone.includes(search)
        );
      })
      .slice(0, 6);
  }, [roads, query]);

  function handleSearchChange(value: string) {
    setQuery(value);
    setShowDropdown(true);
  }

  function handleRoadClick(roadId: number) {
    setQuery("");
    setShowDropdown(false);

    router.push(`/dashboard/roads/${roadId}`);
  }

  return (
    <header
      className="
        relative
        z-[100]
        h-14
        shrink-0
        border-b
        border-border
        bg-surface
        flex
        items-center
        gap-4
        px-4
        overflow-visible
      "
    >
      {/* Logo */}
      <button
        onClick={() => router.push("/dashboard")}
        className="font-medium text-sm text-ink shrink-0"
      >
        TrafficVision<span className="text-flow">AI</span>
      </button>

      {/* SEARCH */}
      <div
        ref={searchRef}
        className="
          relative
          z-[999]
          flex-1
          max-w-md
        "
      >
        <div
          className="
            h-10
            flex
            items-center
            gap-2
            bg-surface2
            border
            border-border
            rounded-md
            px-3
          "
        >
          <Search className="w-4 h-4 text-muted shrink-0" />

          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (query.trim()) {
                setShowDropdown(true);
              }
            }}
            placeholder="Search road, zone, or vehicle ID"
            className="
              bg-transparent
              text-sm
              text-ink
              placeholder:text-muted
              outline-none
              flex-1
              min-w-0
            "
          />
        </div>

        {/* SEARCH DROPDOWN */}
        {showDropdown && query.trim() !== "" && (
          <div
            className="
              absolute
              top-[calc(100%+6px)]
              left-0
              right-0
              z-[9999]
              bg-surface
              border
              border-border
              rounded-lg
              shadow-2xl
              overflow-hidden
            "
          >
            {results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted">
                No roads match "{query}"
              </div>
            ) : (
              <div>
                {results.map((road) => (
                  <button
                    key={road.id}
                    type="button"
                    onClick={() => handleRoadClick(road.id)}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      text-left
                      hover:bg-surface2
                      transition-colors
                    "
                  >
                    <div
                      className="
                        w-8
                        h-8
                        rounded-md
                        bg-signal/10
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <MapPin className="w-4 h-4 text-signal" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm text-ink truncate">
                        {road.name}
                      </div>

                      {road.zone && (
                        <div className="text-xs text-muted truncate">
                          {road.zone}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/alerts")}
        aria-label="Alerts"
        className="
          relative
          p-2
          rounded-md
          hover:bg-surface2
          text-muted
          hover:text-ink
          shrink-0
        "
      >
        <Bell className="w-5 h-5" />

        <span
          className="
            absolute
            top-1
            right-1
            w-2
            h-2
            rounded-full
            bg-congest
          "
        />
      </button>

      {/* User */}
      <div
        className="
          flex
          items-center
          gap-3
          pl-3
          border-l
          border-border
          shrink-0
        "
      >
        <div className="text-right leading-tight">
          <div className="text-sm text-ink">
            {user?.full_name ?? "Admin"}
          </div>

          <div className="text-xs text-muted capitalize">
            {user?.role?.replace("_", " ") ?? "Admin"}
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          aria-label="Logout"
          className="
            p-2
            rounded-md
            hover:bg-surface2
            text-muted
            hover:text-congest
          "
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}