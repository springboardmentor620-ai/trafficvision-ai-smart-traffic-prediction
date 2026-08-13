import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import authFetch from "../api/http";
import Layout from "../components/Layout";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
  Navigation,
  MapPin,
  Clock,
  Gauge,
  Route as RouteIcon,
  Zap,
  BarChart2,

  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Brain,
  Timer,
  Car,
} from "lucide-react";


// ============================================================
// LEAFLET MARKER FIX
// ============================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});


// ============================================================
// CUSTOM PULSE MARKERS
// ============================================================

const makePulseIcon = (color) =>
  new L.DivIcon({
    html: `
      <div style="
        position:relative;
        display:flex;
        align-items:center;
        justify-content:center;
        width:28px;
        height:28px;
      ">
        <span style="
          position:absolute;
          width:28px;
          height:28px;
          border-radius:50%;
          background:${color};
          opacity:.25;
          animation:routePing 1.4s cubic-bezier(0,0,.2,1) infinite;
        "></span>

        <span style="
          position:relative;
          width:14px;
          height:14px;
          border-radius:50%;
          background:${color};
          border:2.5px solid #0f172a;
          box-shadow:0 0 10px ${color}80;
        "></span>
      </div>
    `,

    className: "",

    iconSize: [
      28,
      28,
    ],

    iconAnchor: [
      14,
      14,
    ],
  });


const srcIcon =
  makePulseIcon("#3b82f6");

const dstIcon =
  makePulseIcon("#ef4444");


// ============================================================
// MAP AUTO FIT
// ============================================================

function FitBounds({ geometry }) {
  const map = useMap();

  useEffect(() => {
    if (
      !geometry ||
      geometry.length < 2
    ) {
      return;
    }

    const bounds =
      L.latLngBounds(
        geometry.map(
          ([lat, lng]) => [
            lat,
            lng,
          ]
        )
      );

    map.fitBounds(
      bounds,
      {
        padding: [
          48,
          48,
        ],
      }
    );

  }, [
    geometry,
    map,
  ]);

  return null;
}


// ============================================================
// CONGESTION META
// ============================================================

const congestionMeta = {

  Low: {
    color: "#22c55e",

    badge:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",

    icon: CheckCircle,
  },

  Medium: {
    color: "#f59e0b",

    badge:
      "bg-amber-500/15 text-amber-400 border-amber-500/30",

    icon: AlertTriangle,
  },

  High: {
    color: "#ef4444",

    badge:
      "bg-red-500/15 text-red-400 border-red-500/30",

    icon: AlertTriangle,
  },
};


// ============================================================
// ROUTE COLORS
// ============================================================

const routeColors = [
  "#22c55e",
  "#f59e0b",
  "#64748b",
  "#8b5cf6",
  "#06b6d4",
];


// ============================================================
// NOMINATIM SUGGESTIONS
// ============================================================

function useSuggestions(query) {

  const [
    suggestions,
    setSuggestions,
  ] = useState([]);

  const timerRef =
    useRef(null);

  useEffect(() => {

    if (
      !query ||
      query.trim().length < 3
    ) {

      setSuggestions([]);

      return undefined;
    }

    clearTimeout(
      timerRef.current
    );

    timerRef.current =
      setTimeout(
        async () => {

          try {

            const response =
              await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                  query.trim()
                )}&format=json&limit=5&addressdetails=1`,
                {
                  headers: {
                    "User-Agent":
                      "TrafficVisionAI/1.0",
                  },
                }
              );

            if (!response.ok) {
              throw new Error(
                "Geocoding failed"
              );
            }

            const data =
              await response.json();

            setSuggestions(
              Array.isArray(data)
                ? data
                : []
            );

          } catch {

            setSuggestions([]);

          }

        },
        400
      );

    return () =>
      clearTimeout(
        timerRef.current
      );

  }, [
    query,
  ]);

  return [
    suggestions,
    setSuggestions,
  ];
}


// ============================================================
// LOCATION INPUT
// ============================================================

function LocationInput({
  id,
  label,
  icon: Icon,
  color,
  value,
  onChange,
}) {

  const [
    suggestions,
    setSuggestions,
  ] = useSuggestions(value);

  const [
    open,
    setOpen,
  ] = useState(false);

  return (

    <div className="relative">

      <label
        htmlFor={id}
        className="
          text-[10px]
          font-bold
          text-slate-400
          uppercase
          tracking-widest
          block
          mb-1.5
        "
      >
        {label}
      </label>

      <div className="relative">

        <Icon
          className={`
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            h-4
            w-4
            ${color}
          `}
        />

        <input
          id={id}
          type="text"
          value={value}

          onChange={(event) => {
            onChange(
              event.target.value
            );

            setOpen(true);
          }}

          onFocus={() =>
            setOpen(true)
          }

          onBlur={() =>
            setTimeout(
              () =>
                setOpen(false),
              180
            )
          }

          placeholder={
            `Enter ${label.toLowerCase()}...`
          }

          autoComplete="off"

          className="
            w-full
            pl-9
            pr-3
            py-2.5
            rounded-lg
            border
            border-slate-700
            bg-slate-800/80
            text-slate-200
            text-sm
            placeholder-slate-500
            focus:outline-none
            focus:border-blue-500
            focus:ring-1
            focus:ring-blue-500/40
            transition-all
          "
        />

      </div>


      {open &&
        suggestions.length > 0 && (

          <ul
            className="
            absolute
            z-[1000]
            mt-1
            w-full
            rounded-lg
            border
            border-slate-700
            bg-slate-900/95
            backdrop-blur-md
            shadow-xl
            overflow-hidden
          "
          >

            {suggestions.map(
              (
                item,
                index
              ) => (

                <li
                  key={
                    `${item.place_id ?? index}`
                  }

                  onMouseDown={() => {

                    onChange(
                      item.display_name
                    );

                    setSuggestions([]);

                    setOpen(false);
                  }}

                  className="
                  px-3
                  py-2
                  text-xs
                  text-slate-300
                  hover:bg-blue-600/20
                  hover:text-white
                  cursor-pointer
                  transition-colors
                  border-b
                  border-slate-800
                  last:border-0
                  truncate
                "
                >

                  <MapPin
                    className="
                    inline
                    h-3
                    w-3
                    mr-1.5
                    text-slate-500
                  "
                  />

                  {item.display_name}

                </li>

              )
            )}

          </ul>

        )}

    </div>
  );
}


// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}) {

  return (

    <div
      className={`
        rounded-xl
        p-3.5
        border
        ${accent}
        bg-slate-900/60
        backdrop-blur-sm
        flex
        items-start
        gap-3
        transition-all
        hover:scale-[1.01]
      `}
    >

      <div
        className={`
          p-2
          rounded-lg
          ${accent}
          flex-shrink-0
        `}
      >

        <Icon
          className="h-4 w-4"
        />

      </div>

      <div className="min-w-0">

        <p
          className="
            text-[10px]
            text-slate-400
            uppercase
            tracking-wider
          "
        >
          {label}
        </p>

        <p
          className="
            text-sm
            font-bold
            text-white
            mt-0.5
            leading-tight
          "
        >
          {value}
        </p>

        {sub && (

          <p
            className="
              text-[10px]
              text-slate-500
              mt-0.5
              truncate
            "
          >
            {sub}
          </p>

        )}

      </div>

    </div>
  );
}


// ============================================================
// ROUTE BADGE
// ============================================================

function RouteBadge({
  route,
  index,
  isSelected,
  onClick,
}) {

  const color =
    routeColors[index]
    ?? "#64748b";

  const congestion =
    congestionMeta[
    route.congestion_level
    ]
    ?? congestionMeta.Medium;

  const CongestionIcon =
    congestion.icon;

  const recommended =
    index === 0;

  return (

    <button
      type="button"
      onClick={onClick}

      className={`
        w-full
        text-left
        p-3
        rounded-xl
        border
        transition-all
        duration-200

        ${isSelected
          ? `
              border-blue-500/50
              bg-blue-500/10
              shadow-lg
              shadow-blue-500/10
            `
          : `
              border-slate-700/60
              bg-slate-800/40
              hover:border-slate-600
              hover:bg-slate-800/70
            `
        }
      `}
    >

      <div
        className="
          flex
          items-center
          justify-between
          mb-2
          gap-2
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            min-w-0
          "
        >

          <span
            className="
              h-3
              w-3
              rounded-full
              flex-shrink-0
            "
            style={{
              background:
                color,

              boxShadow:
                `0 0 8px ${color}80`,
            }}
          />

          <span
            className="
              text-xs
              font-semibold
              text-slate-200
              truncate
            "
          >
            {
              recommended
                ? "⭐ Recommended"
                : `Alternative ${index}`
            }
          </span>

        </div>


        <span
          className={`
            text-[10px]
            px-2
            py-0.5
            rounded-full
            border
            font-medium
            flex
            items-center
            gap-1
            ${congestion.badge}
          `}
        >

          <CongestionIcon
            className="h-3 w-3"
          />

          {
            route.congestion_level
          }

        </span>

      </div>


      <div
        className="
          flex
          items-center
          gap-3
          text-[11px]
          text-slate-400
        "
      >

        <span
          className="
            flex
            items-center
            gap-1
          "
        >

          <RouteIcon
            className="h-3 w-3"
          />

          {
            route.distance_km
          } km

        </span>


        <span
          className="
            flex
            items-center
            gap-1
          "
        >

          <Clock
            className="h-3 w-3"
          />

          {
            route.duration_min
          } min

        </span>


        <span
          className="
            flex
            items-center
            gap-1
            ml-auto
            text-slate-500
          "
        >

          <Gauge
            className="h-3 w-3"
          />

          {
            route.traffic_score
          }/100

        </span>

      </div>


      {route.traffic_adjusted_duration_min != null && (

        <div
          className="
            mt-2
            pt-2
            border-t
            border-slate-800
            flex
            justify-between
            text-[10px]
          "
        >

          <span
            className="text-slate-500"
          >
            Traffic-adjusted ETA
          </span>

          <span
            className="
              text-cyan-400
              font-semibold
            "
          >
            {
              route.traffic_adjusted_duration_min
            } min
          </span>

        </div>

      )}

    </button>
  );
}


// ============================================================
// MAIN ROUTE PLANNER
// ============================================================

export default function RoutePlanner() {

  const [
    source,
    setSource,
  ] = useState("");

  const [
    destination,
    setDestination,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    selectedRouteIdx,
    setSelectedRouteIdx,
  ] = useState(0);

  const [
    mapCenter,
  ] = useState([
    16.8148,
    81.5275,
  ]);


  // ==========================================================
  // ALL ROUTES
  // ==========================================================

  const allRoutes =
    useMemo(() => {

      if (!result) {
        return [];
      }

      if (
        Array.isArray(
          result.all_routes
        )
        &&
        result.all_routes.length > 0
      ) {

        return result.all_routes;
      }

      const recommended =
        result.recommended_route
          ? [
            result.recommended_route,
          ]
          : [];

      const alternatives =
        Array.isArray(
          result.alternative_routes
        )
          ? result.alternative_routes
          : [];

      return [
        ...recommended,
        ...alternatives,
      ];

    }, [
      result,
    ]);


  const selectedRoute =
    allRoutes[
    selectedRouteIdx
    ]
    ?? null;


  const selectedCongestion =
    selectedRoute
      ? (
        congestionMeta[
        selectedRoute
          .congestion_level
        ]
        ?? congestionMeta.Medium
      )
      : null;


  const SelectedCongestionIcon =
    selectedCongestion?.icon
    ?? Info;


  const routeCount =
    allRoutes.length;


  const hasAlternatives =
    routeCount > 1;


  // ==========================================================
  // FIND ROUTES
  // ==========================================================

  const handleFindRoutes =
    useCallback(
      async () => {

        if (
          !source.trim()
          ||
          !destination.trim()
        ) {

          setError(
            "Please enter both source and destination."
          );

          return;
        }


        if (
          source.trim().toLowerCase()
          ===
          destination.trim().toLowerCase()
        ) {

          setError(
            "Source and destination should be different."
          );

          return;
        }


        setError("");

        setLoading(true);

        setResult(null);

        setSelectedRouteIdx(0);


        try {

          const response =
            await authFetch(
              "/route/traffic-recommendation",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    source:
                      source.trim(),

                    destination:
                      destination.trim(),
                  }),
              }
            );


          let data = null;

          try {

            data =
              await response.json();

          } catch {

            data = null;

          }


          if (!response.ok) {

            throw new Error(
              data?.detail
              ??
              "Routing failed."
            );
          }


          if (
            !data?.recommended_route
          ) {

            throw new Error(
              "The routing service returned an incomplete response."
            );
          }


          setResult(data);

        } catch (err) {

          setError(
            err?.message
            ??
            "Could not reach the routing service. Please check whether the backend is running."
          );

        } finally {

          setLoading(false);

        }

      },
      [
        source,
        destination,
      ]
    );


  // ==========================================================
  // SWAP
  // ==========================================================

  const handleSwap =
    () => {

      setSource(
        destination
      );

      setDestination(
        source
      );

      setResult(null);

      setError("");

      setSelectedRouteIdx(0);
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <Layout>

      <style>{`

        @keyframes routePing {

          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }

        }

        .route-fade-in {
          animation:
            routeFadeIn
            .4s ease both;
        }

        @keyframes routeFadeIn {

          from {
            opacity: 0;
            transform:
              translateY(8px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }

        }

      `}</style>


      <div
        className="
          flex
          flex-col
          gap-5
          animate-fade-in
          h-full
        "
      >

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            glass-panel
            p-4
            rounded-2xl
            flex
            flex-col
            md:flex-row
            md:items-center
            justify-between
            gap-3
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-bold
                text-white
                flex
                items-center
                gap-2
              "
            >

              <Navigation
                className="
                  h-5
                  w-5
                  text-blue-400
                "
              />

              AI Route Planner

            </h2>

            <p
              className="
                text-slate-400
                text-xs
                mt-0.5
              "
            >
              Smart route analysis,
              traffic-aware alternatives
              and explainable AI
              recommendations.
            </p>

          </div>


          {result &&
            selectedCongestion && (

              <div
                className={`
                flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-lg
                border
                text-xs
                font-medium
                ${selectedCongestion.badge}
              `}
              >

                <SelectedCongestionIcon
                  className="h-3.5 w-3.5"
                />

                {
                  selectedRoute?.congestion_level
                }

                {" "}
                Congestion

              </div>

            )}

        </div>


        {/* =====================================================
            MAIN GRID
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-12
            gap-5
            flex-1
          "
        >


          {/* ===================================================
              LEFT PANEL
          ==================================================== */}

          <div
            className="
              xl:col-span-3
              flex
              flex-col
              gap-4
            "
          >

            {/* INPUT */}

            <div
              className="
                glass-panel
                p-4
                rounded-2xl
                space-y-3
              "
            >

              <span
                className="
                  text-[10px]
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-widest
                  block
                "
              >
                Plan Your Route
              </span>


              <LocationInput
                id="route-source"
                label="Source"
                icon={MapPin}
                color="text-blue-400"
                value={source}
                onChange={setSource}
              />


              <div
                className="
                  flex
                  justify-center
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    items-center
                    gap-0.5
                  "
                >

                  <div
                    className="
                      h-2
                      w-px
                      bg-slate-700
                    "
                  />


                  <button
                    type="button"
                    onClick={handleSwap}
                    title="
                      Swap source and destination
                    "
                    className="
                      h-6
                      w-6
                      rounded-full
                      border
                      border-slate-700
                      bg-slate-800
                      hover:bg-slate-700
                      flex
                      items-center
                      justify-center
                      transition
                    "
                  >

                    <ArrowRight
                      className="
                        h-3.5
                        w-3.5
                        text-slate-400
                        rotate-90
                      "
                    />

                  </button>


                  <div
                    className="
                      h-2
                      w-px
                      bg-slate-700
                    "
                  />

                </div>

              </div>


              <LocationInput
                id="route-destination"
                label="Destination"
                icon={MapPin}
                color="text-red-400"
                value={destination}
                onChange={setDestination}
              />


              {error && (

                <p
                  className="
                    text-[11px]
                    text-red-400
                    bg-red-500/10
                    border
                    border-red-500/20
                    rounded-lg
                    px-3
                    py-2
                  "
                >
                  {error}
                </p>

              )}


              <button
                id="find-routes-btn"
                type="button"
                onClick={handleFindRoutes}
                disabled={loading}
                className="
                  w-full
                  py-2.5
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-600
                  to-blue-500
                  hover:from-blue-500
                  hover:to-blue-400
                  text-white
                  text-sm
                  font-semibold
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition-all
                  duration-200
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  shadow-lg
                  shadow-blue-600/25
                "
              >

                {loading ? (

                  <>

                    <RefreshCw
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />

                    Calculating Routes…

                  </>

                ) : (

                  <>

                    <Navigation
                      className="
                        h-4
                        w-4
                      "
                    />

                    Find Best Route

                  </>

                )}

              </button>

            </div>


            {/* AVAILABLE ROUTES */}

            {result && (

              <div
                className="
                  glass-panel
                  p-4
                  rounded-2xl
                  space-y-3
                  route-fade-in
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                  "
                >

                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-widest
                    "
                  >
                    Available Routes
                  </span>


                  <span
                    className="
                      text-[10px]
                      px-2
                      py-1
                      rounded-full
                      bg-blue-500/10
                      border
                      border-blue-500/20
                      text-blue-400
                      font-semibold
                    "
                  >
                    {routeCount}
                    {" "}
                    found
                  </span>

                </div>


                <div
                  className="
                    space-y-2
                  "
                >

                  {allRoutes.map(
                    (
                      route,
                      index
                    ) => (

                      <RouteBadge
                        key={
                          `${route.route_index}-${index}`
                        }

                        route={route}

                        index={index}

                        isSelected={
                          selectedRouteIdx
                          ===
                          index
                        }

                        onClick={() =>
                          setSelectedRouteIdx(
                            index
                          )
                        }
                      />

                    )
                  )}

                </div>


                {!hasAlternatives && (

                  <div
                    className="
                      text-[10px]
                      leading-relaxed
                      text-amber-400/90
                      bg-amber-500/5
                      border
                      border-amber-500/15
                      rounded-lg
                      p-2.5
                    "
                  >
                    OSRM returned only one
                    distinct road route for
                    this journey. The planner
                    will show alternatives
                    automatically when the road
                    network provides them.
                  </div>

                )}

              </div>

            )}


            {/* AI RECOMMENDATION */}

            {result && (

              <div
                className="
                  glass-panel
                  p-4
                  rounded-2xl
                  space-y-3
                  route-fade-in
                "
              >

                <span
                  className="
                    text-[10px]
                    font-bold
                    text-slate-400
                    uppercase
                    tracking-widest
                    flex
                    items-center
                    gap-1.5
                  "
                >

                  <Brain
                    className="
                      h-3.5
                      w-3.5
                      text-cyan-400
                    "
                  />

                  AI Route Recommendation

                </span>


                <p
                  className="
                    text-xs
                    text-slate-300
                    leading-relaxed
                  "
                >
                  {
                    result.recommendation_reason
                  }
                </p>


                {result.time_saved_minutes > 0 &&
                  result.distance_extra_km_vs_shortest > 0 && (

                    <div
                      className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                    >

                      <div
                        className="
                        rounded-lg
                        bg-emerald-500/5
                        border
                        border-emerald-500/15
                        p-2
                      "
                      >

                        <p
                          className="
                          text-[9px]
                          text-slate-500
                          uppercase
                        "
                        >
                          Time saved
                        </p>

                        <p
                          className="
                          text-sm
                          font-bold
                          text-emerald-400
                          mt-0.5
                        "
                        >
                          {
                            result.time_saved_minutes
                          }
                          {" "}
                          min
                        </p>

                      </div>


                      <div
                        className="
                        rounded-lg
                        bg-blue-500/5
                        border
                        border-blue-500/15
                        p-2
                      "
                      >

                        <p
                          className="
                          text-[9px]
                          text-slate-500
                          uppercase
                        "
                        >
                          Extra distance
                        </p>

                        <p
                          className="
                          text-sm
                          font-bold
                          text-blue-400
                          mt-0.5
                        "
                        >
                          +
                          {
                            result.distance_extra_km_vs_shortest
                          }
                          {" "}
                          km
                        </p>

                      </div>

                    </div>

                  )}


                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    text-slate-500
                  "
                >

                  <span>
                    Routing:
                  </span>

                  <span
                    className="
                      text-slate-300
                    "
                  >
                    {
                      result.route_generation_method
                    }
                  </span>

                </div>

              </div>

            )}


            {/* TRAFFIC PREDICTION */}

            {result && (

              <div
                className="
                  glass-panel
                  p-4
                  rounded-2xl
                  space-y-2
                  route-fade-in
                "
              >

                <span
                  className="
                    text-[10px]
                    font-bold
                    text-slate-400
                    uppercase
                    tracking-widest
                    flex
                    items-center
                    gap-1.5
                  "
                >

                  <Zap
                    className="
                      h-3.5
                      w-3.5
                      text-yellow-400
                    "
                  />

                  Traffic Prediction

                </span>


                <p
                  className="
                    text-xs
                    text-slate-300
                    leading-relaxed
                  "
                >
                  {
                    result.traffic_prediction
                  }
                </p>


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    text-[10px]
                    mt-1
                  "
                >

                  <span
                    className="text-slate-500"
                  >
                    Traffic records analyzed
                  </span>

                  <span
                    className="
                      font-bold
                      text-blue-400
                    "
                  >
                    {
                      result.db_junctions_analyzed
                    }
                  </span>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              CENTER MAP
          ================================================== */}

          <div
            className="
              xl:col-span-6
              rounded-2xl
              overflow-hidden
              border
              border-slate-800
              shadow-2xl
              relative
            "
            style={{
              minHeight: 520,
            }}
          >

            <MapContainer
              center={mapCenter}
              zoom={10}

              style={{
                height: "100%",
                width: "100%",
                minHeight: 520,
                background:
                  "#0B0F19",
              }}
            >

              <TileLayer
                url="
                  https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
                "
                attribution="
                  &copy;
                  OpenStreetMap contributors
                  &copy;
                  CARTO
                "
              />


              {/* ROUTES */}

              {allRoutes.map(
                (
                  route,
                  index
                ) => {

                  const selected =
                    index
                    ===
                    selectedRouteIdx;

                  const color =
                    routeColors[index]
                    ??
                    "#64748b";

                  const congestion =
                    congestionMeta[
                    route.congestion_level
                    ]
                    ??
                    congestionMeta.Medium;

                  return (

                    <Polyline

                      key={
                        `${route.route_index}-${index}`
                      }

                      positions={
                        route.geometry
                        ?? []
                      }

                      eventHandlers={{
                        click: () =>
                          setSelectedRouteIdx(
                            index
                          ),
                      }}

                      pathOptions={{

                        color,

                        weight:
                          selected
                            ? 7
                            : 3,

                        opacity:
                          selected
                            ? 0.98
                            : 0.45,

                        dashArray:
                          index === 0
                            ? undefined
                            : "8 6",
                      }}
                    >

                      <Popup>

                        <div
                          className="
                            text-xs
                            space-y-1
                            p-1
                            min-w-[170px]
                          "
                        >

                          <strong>

                            {
                              index === 0
                                ? "⭐ Recommended Route"
                                : `Alternative ${index}`
                            }

                          </strong>


                          <div>
                            📏{" "}
                            {
                              route.distance_km
                            }
                            {" "}
                            km
                          </div>


                          <div>
                            ⏱{" "}
                            {
                              route.duration_min
                            }
                            {" "}
                            min
                          </div>


                          <div>
                            🚦{" "}
                            {
                              route.congestion_level
                            }
                            {" "}
                            traffic
                          </div>


                          <div>
                            📊 Score:{" "}
                            {
                              route.traffic_score
                            }
                            /100
                          </div>


                          <div>
                            🕐 ETA:{" "}
                            {
                              route.estimated_arrival
                            }
                          </div>


                          {route.traffic_adjusted_duration_min != null && (

                            <div>
                              🧠 Adjusted:{" "}
                              {
                                route.traffic_adjusted_duration_min
                              }
                              {" "}
                              min
                            </div>

                          )}


                          <div
                            style={{
                              color:
                                congestion.color,
                            }}
                          >
                            {
                              route.vehicle_count
                              ?? 0
                            }{" "}
                            vehicles estimated
                          </div>

                        </div>

                      </Popup>

                    </Polyline>

                  );
                }
              )}


              {/* SOURCE */}

              {result && (

                <Marker
                  position={[
                    result.source.lat,
                    result.source.lon,
                  ]}
                  icon={srcIcon}
                >

                  <Popup>

                    <div
                      className="
                        text-xs
                        p-1
                      "
                    >

                      <strong>
                        🔵 Origin
                      </strong>

                      <div
                        className="
                          text-gray-600
                          mt-0.5
                          max-w-[230px]
                        "
                      >
                        {
                          result.source
                            .display_name
                        }
                      </div>

                    </div>

                  </Popup>

                </Marker>

              )}


              {/* DESTINATION */}

              {result && (

                <Marker
                  position={[
                    result.destination.lat,
                    result.destination.lon,
                  ]}
                  icon={dstIcon}
                >

                  <Popup>

                    <div
                      className="
                        text-xs
                        p-1
                      "
                    >

                      <strong>
                        🔴 Destination
                      </strong>

                      <div
                        className="
                          text-gray-600
                          mt-0.5
                          max-w-[230px]
                        "
                      >
                        {
                          result.destination
                            .display_name
                        }
                      </div>

                    </div>

                  </Popup>

                </Marker>

              )}


              {/* AUTO FIT */}

              {selectedRoute?.geometry?.length > 1 && (

                <FitBounds
                  geometry={
                    selectedRoute.geometry
                  }
                />

              )}

            </MapContainer>


            {/* MAP LEGEND */}

            <div
              className="
                absolute
                bottom-4
                left-4
                z-[500]
                bg-slate-900/90
                border
                border-slate-800
                rounded-xl
                p-3
                backdrop-blur-md
                space-y-1.5
              "
            >

              <p
                className="
                  text-[10px]
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-wider
                "
              >
                Route Legend
              </p>


              {allRoutes.length > 0 ? (

                allRoutes.map(
                  (
                    route,
                    index
                  ) => (

                    <div
                      key={
                        `legend-${route.route_index}-${index}`
                      }
                      className="
                        flex
                        items-center
                        gap-2
                        text-[11px]
                        text-slate-300
                      "
                    >

                      <span
                        className="
                          h-2
                          w-6
                          rounded-full
                        "
                        style={{
                          background:
                            routeColors[index]
                            ??
                            "#64748b",
                        }}
                      />

                      {
                        index === 0
                          ? "⭐ Recommended"
                          : `Alternative ${index}`
                      }

                    </div>

                  )
                )

              ) : (

                <div
                  className="
                    text-[10px]
                    text-slate-500
                  "
                >
                  Routes will appear here.
                </div>

              )}

            </div>


            {/* LOADING */}

            {loading && (

              <div
                className="
                  absolute
                  inset-0
                  z-[600]
                  flex
                  flex-col
                  items-center
                  justify-center
                  bg-slate-900/80
                  backdrop-blur-sm
                "
              >

                <div
                  className="
                    h-10
                    w-10
                    border-4
                    border-blue-500
                    border-t-transparent
                    rounded-full
                    animate-spin
                  "
                />

                <p
                  className="
                    text-xs
                    text-slate-400
                    mt-3
                  "
                >
                  Finding real road
                  alternatives +
                  analyzing traffic…
                </p>

              </div>

            )}


            {/* EMPTY MAP */}

            {!result &&
              !loading && (

                <div
                  className="
                  absolute
                  inset-0
                  z-[400]
                  flex
                  flex-col
                  items-center
                  justify-center
                  pointer-events-none
                "
                >

                  <div
                    className="
                    text-center
                    space-y-2
                  "
                  >

                    <Navigation
                      className="
                      h-10
                      w-10
                      text-slate-700
                      mx-auto
                    "
                    />

                    <p
                      className="
                      text-sm
                      text-slate-600
                    "
                    >
                      Enter source &
                      destination to see
                      routes
                    </p>

                  </div>

                </div>

              )}

          </div>


          {/* =================================================
              RIGHT PANEL
          ================================================== */}

          <div
            className="
              xl:col-span-3
              flex
              flex-col
              gap-4
            "
          >

            {result &&
              selectedRoute ? (

              <>

                {/* ROUTE SUMMARY */}

                <div
                  className="
                    glass-panel
                    p-4
                    rounded-2xl
                    route-fade-in
                  "
                >

                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-widest
                      block
                      mb-3
                    "
                  >

                    {
                      selectedRouteIdx === 0
                        ? "⭐ Recommended Route"
                        : `Alternative Route ${selectedRouteIdx}`
                    }

                  </span>


                  <div
                    className="
                      space-y-2.5
                    "
                  >

                    <InfoCard
                      icon={RouteIcon}
                      label="Distance"
                      value={
                        `${selectedRoute.distance_km} km`
                      }
                      sub="
                        Calculated from real road geometry
                      "
                      accent="
                        border-blue-500/20
                        text-blue-400
                      "
                    />


                    <InfoCard
                      icon={Clock}
                      label="Travel Time"
                      value={
                        `${selectedRoute.duration_min} min`
                      }
                      sub={
                        `Arrive at ${selectedRoute.estimated_arrival}`
                      }
                      accent="
                        border-purple-500/20
                        text-purple-400
                      "
                    />


                    <InfoCard
                      icon={Gauge}
                      label="Traffic Score"
                      value={
                        `${selectedRoute.traffic_score} / 100`
                      }
                      sub="
                        Deterministic AI route score
                      "
                      accent="
                        border-cyan-500/20
                        text-cyan-400
                      "
                    />


                    <InfoCard
                      icon={BarChart2}
                      label="Congestion"
                      value={
                        selectedRoute.congestion_level
                      }
                      sub={
                        `${selectedRoute.traffic_records_matched ?? 0
                        } nearby traffic records`
                      }
                      accent={
                        congestionMeta[
                          selectedRoute.congestion_level
                        ]?.badge
                        ??
                        "border-slate-600 text-slate-300"
                      }
                    />

                  </div>

                </div>


                {/* WHY THIS ROUTE */}

                <div
                  className="
                    glass-panel
                    p-4
                    rounded-2xl
                    space-y-3
                    route-fade-in
                  "
                >

                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-widest
                      flex
                      items-center
                      gap-1.5
                    "
                  >

                    <Brain
                      className="
                        h-3.5
                        w-3.5
                        text-cyan-400
                      "
                    />

                    Why This Route?

                  </span>


                  <p
                    className="
                      text-xs
                      text-slate-300
                      leading-relaxed
                    "
                  >
                    {
                      result.recommendation_reason
                    }
                  </p>


                  {selectedRoute.traffic_adjusted_duration_min != null && (

                    <div
                      className="
                        rounded-lg
                        border
                        border-cyan-500/15
                        bg-cyan-500/5
                        p-2.5
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <Timer
                          className="
                            h-3.5
                            w-3.5
                            text-cyan-400
                          "
                        />

                        <span
                          className="
                            text-[10px]
                            text-slate-400
                          "
                        >
                          Traffic-adjusted
                          travel estimate
                        </span>

                      </div>


                      <p
                        className="
                          text-sm
                          font-bold
                          text-cyan-400
                          mt-1
                        "
                      >
                        {
                          selectedRoute
                            .traffic_adjusted_duration_min
                        }
                        {" "}
                        min
                      </p>

                    </div>

                  )}

                </div>


                {/* JOURNEY DETAILS */}

                <div
                  className="
                    glass-panel
                    p-4
                    rounded-2xl
                    space-y-3
                    route-fade-in
                  "
                >

                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-widest
                      flex
                      items-center
                      gap-1.5
                    "
                  >

                    <Info
                      className="
                        h-3.5
                        w-3.5
                        text-slate-500
                      "
                    />

                    Journey Details

                  </span>


                  <div
                    className="
                      space-y-2
                    "
                  >

                    <div
                      className="
                        flex
                        items-start
                        gap-2
                      "
                    >

                      <div
                        className="
                          mt-1
                          h-2
                          w-2
                          rounded-full
                          bg-blue-500
                          flex-shrink-0
                        "
                      />

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <p
                          className="
                            text-[10px]
                            text-slate-500
                            uppercase
                            tracking-wider
                          "
                        >
                          From
                        </p>

                        <p
                          className="
                            text-xs
                            text-slate-300
                            leading-tight
                          "
                        >
                          {
                            result.source
                              .display_name
                              .split(",")
                              .slice(
                                0,
                                3
                              )
                              .join(", ")
                          }
                        </p>

                      </div>

                    </div>


                    <div
                      className="
                        ml-1
                        h-6
                        w-px
                        bg-slate-700
                      "
                    />


                    <div
                      className="
                        flex
                        items-start
                        gap-2
                      "
                    >

                      <div
                        className="
                          mt-1
                          h-2
                          w-2
                          rounded-full
                          bg-red-500
                          flex-shrink-0
                        "
                      />

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <p
                          className="
                            text-[10px]
                            text-slate-500
                            uppercase
                            tracking-wider
                          "
                        >
                          To
                        </p>

                        <p
                          className="
                            text-xs
                            text-slate-300
                            leading-tight
                          "
                        >
                          {
                            result.destination
                              .display_name
                              .split(",")
                              .slice(
                                0,
                                3
                              )
                              .join(", ")
                          }
                        </p>

                      </div>

                    </div>

                  </div>


                  <div
                    className="
                      border-t
                      border-slate-800
                      pt-2
                      flex
                      justify-between
                      text-[11px]
                    "
                  >

                    <span
                      className="text-slate-500"
                    >
                      Estimated Arrival
                    </span>

                    <span
                      className="
                        font-bold
                        text-blue-400
                        font-mono
                      "
                    >
                      {
                        selectedRoute
                          .estimated_arrival
                      }
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      justify-between
                      text-[11px]
                    "
                  >

                    <span
                      className="text-slate-500"
                    >
                      Routes Computed
                    </span>

                    <span
                      className="
                        font-bold
                        text-slate-300
                      "
                    >
                      {routeCount}
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      justify-between
                      text-[11px]
                    "
                  >

                    <span
                      className="text-slate-500"
                    >
                      Traffic Records
                    </span>

                    <span
                      className="
                        font-bold
                        text-cyan-400
                      "
                    >
                      {
                        result.db_junctions_analyzed
                      }
                    </span>

                  </div>

                </div>


                {/* TRAFFIC INTELLIGENCE */}

                <div
                  className="
                    glass-panel
                    p-4
                    rounded-2xl
                    space-y-3
                    route-fade-in
                  "
                >

                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-widest
                    "
                  >
                    Traffic Intelligence
                  </span>


                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-2
                    "
                  >

                    <div
                      className="
                        rounded-lg
                        border
                        border-slate-800
                        bg-slate-900/50
                        p-2.5
                      "
                    >

                      <Car
                        className="
                          h-3.5
                          w-3.5
                          text-blue-400
                        "
                      />

                      <p
                        className="
                          text-[9px]
                          text-slate-500
                          mt-1
                        "
                      >
                        Vehicles
                      </p>

                      <p
                        className="
                          text-sm
                          font-bold
                          text-white
                        "
                      >
                        {
                          selectedRoute
                            .vehicle_count
                          ?? "—"
                        }
                      </p>

                    </div>


                    <div
                      className="
                        rounded-lg
                        border
                        border-slate-800
                        bg-slate-900/50
                        p-2.5
                      "
                    >

                      <Gauge
                        className="
                          h-3.5
                          w-3.5
                          text-emerald-400
                        "
                      />

                      <p
                        className="
                          text-[9px]
                          text-slate-500
                          mt-1
                        "
                      >
                        Avg speed
                      </p>

                      <p
                        className="
                          text-sm
                          font-bold
                          text-white
                        "
                      >
                        {
                          selectedRoute
                            .average_speed_kmh
                          ?? "—"
                        }{" "}
                        km/h
                      </p>

                    </div>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      text-[11px]
                    "
                  >

                    <span
                      className="text-slate-500"
                    >
                      Accident risk
                    </span>

                    <span
                      className={
                        selectedRoute
                          .accident_risk_pct
                          > 10

                          ? `
                            text-red-400
                            font-semibold
                          `

                          : `
                            text-emerald-400
                            font-semibold
                          `
                      }
                    >
                      {
                        selectedRoute
                          .accident_risk_pct
                        ?? 0
                      }%
                    </span>

                  </div>

                </div>


                {/* TRAFFIC INDICATORS */}

                <div
                  className="
                    glass-panel
                    p-4
                    rounded-2xl
                    space-y-3
                    route-fade-in
                  "
                >

                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-widest
                    "
                  >
                    Traffic Indicators
                  </span>


                  {[
                    {
                      level: "Low",
                      desc:
                        "Free flow — ideal conditions",
                    },

                    {
                      level: "Medium",
                      desc:
                        "Moderate — allow buffer time",
                    },

                    {
                      level: "High",
                      desc:
                        "Heavy — consider alternatives",
                    },
                  ].map(
                    ({
                      level,
                      desc,
                    }) => {

                      const meta =
                        congestionMeta[
                        level
                        ];

                      const Icon =
                        meta.icon;

                      return (

                        <div
                          key={level}
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <span
                            className="
                              h-3
                              w-3
                              rounded-full
                              flex-shrink-0
                            "
                            style={{
                              background:
                                meta.color,

                              boxShadow:
                                `0 0 8px ${meta.color}60`,
                            }}
                          />


                          <div>

                            <p
                              className="
                                text-xs
                                font-semibold
                                text-slate-300
                              "
                            >
                              {level}
                            </p>

                            <p
                              className="
                                text-[10px]
                                text-slate-500
                              "
                            >
                              {desc}
                            </p>

                          </div>


                          {selectedRoute
                            .congestion_level
                            === level && (

                              <Icon
                                className="
                                h-3.5
                                w-3.5
                                ml-auto
                              "
                                style={{
                                  color:
                                    meta.color,
                                }}
                              />

                            )}

                        </div>

                      );
                    }
                  )}

                </div>

              </>

            ) : (

              <div
                className="
                  glass-panel
                  p-6
                  rounded-2xl
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  gap-3
                  flex-1
                "
              >

                <BarChart2
                  className="
                    h-10
                    w-10
                    text-slate-700
                  "
                />

                <div>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-500
                    "
                  >
                    Route Analysis
                  </p>

                  <p
                    className="
                      text-xs
                      text-slate-600
                      mt-1
                    "
                  >
                    Enter locations and
                    click
                    <br />
                    Find Best Route to see
                    metrics.
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </Layout>
  );
}