import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  ZoomControl,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./MapPage.css";

import api from "../api/axios";
import Layout from "../components/Layout";

// ============================================================
// CONSTANTS
// ============================================================

const HYDERABAD_CENTER = [17.385044, 78.486671];

const DEFAULT_ZOOM = 11;
const SOURCE_ZOOM = 14;
const INCIDENT_ZOOM = 17;

// ============================================================
// LEAFLET ICONS
// ============================================================

const locationIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const incidentIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -40],
  shadowSize: [41, 41],
});

// ============================================================
// HELPERS
// ============================================================

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function cleanValue(value, fallback = "Not available") {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
}

function isValidLocation(location) {
  if (!location) {
    return false;
  }

  const lat = toNumber(location.lat ?? location.latitude);

  const lon = toNumber(
    location.lon ??
    location.lng ??
    location.longitude
  );

  if (lat === null || lon === null) {
    return false;
  }

  if (
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return false;
  }

  if (lat === 0 && lon === 0) {
    return false;
  }

  return true;
}

function normalizeLocation(
  location,
  displayName = "Location"
) {
  if (!location) {
    return null;
  }

  const lat = toNumber(
    location.lat ?? location.latitude
  );

  const lon = toNumber(
    location.lon ??
    location.lng ??
    location.longitude
  );

  if (lat === null || lon === null) {
    return null;
  }

  if (lat === 0 && lon === 0) {
    return null;
  }

  if (
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return null;
  }

  return {
    lat,
    lon,
    displayName:
      location.displayName ||
      location.display_name ||
      displayName,
  };
}

// ============================================================
// GEOJSON → LEAFLET
// ============================================================

function getRouteCoordinates(geometry) {
  if (
    !geometry ||
    !Array.isArray(geometry.coordinates)
  ) {
    return [];
  }

  return geometry.coordinates
    .map((coordinate) => {
      if (
        !Array.isArray(coordinate) ||
        coordinate.length < 2
      ) {
        return null;
      }

      const longitude = Number(coordinate[0]);
      const latitude = Number(coordinate[1]);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return null;
      }

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return null;
      }

      return [latitude, longitude];
    })
    .filter(Boolean);
}

// ============================================================
// URL HELPERS
// ============================================================

function getFirstParam(params, keys) {
  for (const key of keys) {
    const value = params.get(key);

    if (
      value !== null &&
      value !== undefined &&
      value.trim() !== ""
    ) {
      return value;
    }
  }

  return null;
}

function safeDecode(value) {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// ============================================================
// INCIDENT FROM URL
// ============================================================

function getIncidentFromUrl() {
  const params = new URLSearchParams(
    window.location.search
  );

  const rawLat = getFirstParam(params, [
    "lat",
    "latitude",
    "incidentLat",
    "incidentLatitude",
    "source_lat",
    "sourceLatitude",
  ]);

  const rawLon = getFirstParam(params, [
    "lon",
    "lng",
    "longitude",
    "incidentLon",
    "incidentLng",
    "incidentLongitude",
    "source_lon",
    "sourceLongitude",
  ]);

  const lat = toNumber(rawLat);
  const lon = toNumber(rawLon);

  const notificationId = getFirstParam(params, [
    "notificationId",
    "notification_id",
    "id",
  ]);

  const alertType =
    getFirstParam(params, [
      "alertType",
      "alert_type",
      "type",
      "category",
    ]) || "system";

  const priority =
    getFirstParam(params, [
      "priority",
      "severity",
    ]) || "normal";

  const title =
    safeDecode(
      getFirstParam(params, [
        "title",
        "name",
        "notificationTitle",
      ])
    ) || "Traffic Incident";

  const locationText = safeDecode(
    getFirstParam(params, [
      "location",
      "locationName",
      "location_name",
      "address",
      "place",
      "road",
      "roadName",
      "road_name",
      "junction",
      "area",
      "incidentLocation",
      "incident_location",
    ])
  );

  // ----------------------------------------------------------
  // ADDITIONAL TRAFFIC DETAILS
  // ----------------------------------------------------------

  const roadName = safeDecode(
    getFirstParam(params, [
      "road",
      "roadName",
      "road_name",
    ])
  );

  const congestionLevel = safeDecode(
    getFirstParam(params, [
      "congestion",
      "congestionLevel",
      "congestion_level",
    ])
  );

  const vehicleCount = safeDecode(
    getFirstParam(params, [
      "vehicleCount",
      "vehicle_count",
      "vehicles",
    ])
  );

  const speed = safeDecode(
    getFirstParam(params, [
      "speed",
      "vehicleSpeed",
    ])
  );

  const weather = safeDecode(
    getFirstParam(params, [
      "weather",
    ])
  );

  const accident = safeDecode(
    getFirstParam(params, [
      "accident",
      "isAccident",
    ])
  );

  const trafficSignal = safeDecode(
    getFirstParam(params, [
      "trafficSignal",
      "traffic_signal",
      "signal",
    ])
  );

  const lastUpdated = safeDecode(
    getFirstParam(params, [
      "lastUpdated",
      "last_updated",
      "updatedAt",
      "updated_at",
    ])
  );

  const hasCoordinates =
    lat !== null &&
    lon !== null &&
    lat !== 0 &&
    lon !== 0 &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180;

  return {
    hasCoordinates,

    lat: hasCoordinates ? lat : null,
    lon: hasCoordinates ? lon : null,

    notificationId,

    alertType,
    priority,
    title,

    locationText,

    roadName,
    congestionLevel,
    vehicleCount,
    speed,
    weather,
    accident,
    trafficSignal,
    lastUpdated,
  };
}

// ============================================================
// MAP VIEW CONTROLLER
// ============================================================

function MapViewController({
  source,
  destination,
  routeCoordinates,
  incidentLocation,
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return undefined;
    }

    const invalidateMap = () => {
      map.invalidateSize({
        animate: false,
      });
    };

    invalidateMap();

    const timer1 = setTimeout(
      invalidateMap,
      50
    );

    const timer2 = setTimeout(
      invalidateMap,
      250
    );

    const timer3 = setTimeout(
      invalidateMap,
      500
    );

    // ROUTE
    if (
      Array.isArray(routeCoordinates) &&
      routeCoordinates.length > 1
    ) {
      const bounds =
        L.latLngBounds(routeCoordinates);

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: true,
        });
      }
    }

    // INCIDENT
    else if (
      incidentLocation &&
      isValidLocation(incidentLocation)
    ) {
      map.setView(
        [
          Number(incidentLocation.lat),
          Number(incidentLocation.lon),
        ],
        INCIDENT_ZOOM,
        {
          animate: true,
        }
      );
    }

    // SOURCE + DESTINATION
    else if (
      source &&
      destination &&
      isValidLocation(source) &&
      isValidLocation(destination)
    ) {
      const sourcePoint = [
        Number(source.lat),
        Number(source.lon),
      ];

      const destinationPoint = [
        Number(destination.lat),
        Number(destination.lon),
      ];

      const bounds = L.latLngBounds([
        sourcePoint,
        destinationPoint,
      ]);

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 14,
          animate: true,
        });
      }
    }

    // SOURCE ONLY
    else if (
      source &&
      isValidLocation(source)
    ) {
      map.setView(
        [
          Number(source.lat),
          Number(source.lon),
        ],
        SOURCE_ZOOM,
        {
          animate: true,
        }
      );
    }

    // DESTINATION ONLY
    else if (
      destination &&
      isValidLocation(destination)
    ) {
      map.setView(
        [
          Number(destination.lat),
          Number(destination.lon),
        ],
        SOURCE_ZOOM,
        {
          animate: true,
        }
      );
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [
    map,
    source,
    destination,
    routeCoordinates,
    incidentLocation,
  ]);

  return null;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MapPage() {
  // ==========================================================
  // INPUTS
  // ==========================================================

  const [sourceText, setSourceText] =
    useState("");

  const [destinationText, setDestinationText] =
    useState("");

  // ==========================================================
  // LOCATIONS
  // ==========================================================

  const [source, setSource] =
    useState(null);

  const [destination, setDestination] =
    useState(null);

  // ==========================================================
  // INCIDENT
  // ==========================================================

  const [incidentLocation, setIncidentLocation] =
    useState(null);

  const [incidentError, setIncidentError] =
    useState("");

  // ==========================================================
  // AUTOCOMPLETE
  // ==========================================================

  const [sourceSuggestions, setSourceSuggestions] =
    useState([]);

  const [
    destinationSuggestions,
    setDestinationSuggestions,
  ] = useState([]);

  const [activeSearch, setActiveSearch] =
    useState(null);

  const [searchingSource, setSearchingSource] =
    useState(false);

  const [
    searchingDestination,
    setSearchingDestination,
  ] = useState(false);

  // ==========================================================
  // ROUTE
  // ==========================================================

  const [routeCoordinates, setRouteCoordinates] =
    useState([]);

  const [routeInfo, setRouteInfo] =
    useState(null);

  // ==========================================================
  // UI
  // ==========================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // REFS
  // ==========================================================

  const sourceTimer =
    useRef(null);

  const destinationTimer =
    useRef(null);

  const sourceRequestId =
    useRef(0);

  const destinationRequestId =
    useRef(0);

  // ==========================================================
  // LOAD INCIDENT
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const incident =
      getIncidentFromUrl();

    if (!incident) {
      return undefined;
    }

    if (!incident.hasCoordinates) {
      if (cancelled) {
        return undefined;
      }

      setIncidentLocation(null);

      setIncidentError(
        incident.locationText
          ? `This notification did not contain exact coordinates. Location provided: "${incident.locationText}".`
          : "This notification did not contain latitude and longitude coordinates."
      );

      return undefined;
    }

    const normalized =
      normalizeLocation(
        incident,
        incident.title
      );

    if (!normalized) {
      setIncidentError(
        "The notification contained invalid coordinates."
      );

      return undefined;
    }

    if (cancelled) {
      return undefined;
    }

    setIncidentError("");

    setIncidentLocation({
      ...normalized,

      notificationId:
        incident.notificationId,

      alertType:
        incident.alertType,

      priority:
        incident.priority,

      title:
        incident.title,

      locationText:
        incident.locationText,

      roadName:
        incident.roadName,

      congestionLevel:
        incident.congestionLevel,

      vehicleCount:
        incident.vehicleCount,

      speed:
        incident.speed,

      weather:
        incident.weather,

      accident:
        incident.accident,

      trafficSignal:
        incident.trafficSignal,

      lastUpdated:
        incident.lastUpdated,

      resolvedFromText: false,
    });

    setSource(null);
    setSourceText("");

    setDestination(null);
    setDestinationText("");

    setRouteCoordinates([]);
    setRouteInfo(null);
    setError("");

    const timer = setTimeout(() => {
      window.dispatchEvent(
        new Event("resize")
      );
    }, 300);

    return () => {
      clearTimeout(timer);
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // SEARCH LOCATION
  // ==========================================================

  const searchLocation = useCallback(
    async (text, type) => {
      const query = text.trim();

      if (query.length < 2) {
        if (type === "source") {
          setSourceSuggestions([]);
        } else {
          setDestinationSuggestions([]);
        }

        return;
      }

      const requestId =
        type === "source"
          ? ++sourceRequestId.current
          : ++destinationRequestId.current;

      try {
        if (type === "source") {
          setSearchingSource(true);
        } else {
          setSearchingDestination(true);
        }

        const response =
          await api.get(
            "/api/map-monitoring/search-location",
            {
              params: {
                query,
              },
            }
          );

        const locations =
          Array.isArray(
            response.data?.locations
          )
            ? response.data.locations
            : [];

        if (
          type === "source" &&
          requestId !==
          sourceRequestId.current
        ) {
          return;
        }

        if (
          type === "destination" &&
          requestId !==
          destinationRequestId.current
        ) {
          return;
        }

        if (type === "source") {
          setSourceSuggestions(
            locations
          );
        } else {
          setDestinationSuggestions(
            locations
          );
        }
      } catch (err) {
        console.error(
          "Location search failed:",
          err
        );

        if (type === "source") {
          setSourceSuggestions([]);
        } else {
          setDestinationSuggestions([]);
        }
      } finally {
        if (type === "source") {
          setSearchingSource(false);
        } else {
          setSearchingDestination(false);
        }
      }
    },
    []
  );

  // ==========================================================
  // SOURCE INPUT
  // ==========================================================

  const handleSourceChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSourceText(value);
    setSource(null);

    setIncidentLocation(null);
    setIncidentError("");

    setRouteCoordinates([]);
    setRouteInfo(null);
    setError("");

    setActiveSearch("source");
    setSourceSuggestions([]);

    clearTimeout(
      sourceTimer.current
    );

    sourceTimer.current =
      setTimeout(() => {
        searchLocation(
          value,
          "source"
        );
      }, 350);
  };

  // ==========================================================
  // DESTINATION INPUT
  // ==========================================================

  const handleDestinationChange = (
    event
  ) => {
    const value =
      event.target.value;

    setDestinationText(value);
    setDestination(null);

    setRouteCoordinates([]);
    setRouteInfo(null);
    setError("");

    setActiveSearch(
      "destination"
    );

    setDestinationSuggestions([]);

    clearTimeout(
      destinationTimer.current
    );

    destinationTimer.current =
      setTimeout(() => {
        searchLocation(
          value,
          "destination"
        );
      }, 350);
  };

  // ==========================================================
  // SELECT SOURCE
  // ==========================================================

  const handleSelectSource = (
    location
  ) => {
    const selected =
      normalizeLocation(
        location,
        "Selected source"
      );

    if (!selected) {
      setError(
        "Selected source has invalid coordinates."
      );

      return;
    }

    setSource(selected);
    setSourceText(
      selected.displayName
    );

    setSourceSuggestions([]);
    setActiveSearch(null);

    setRouteCoordinates([]);
    setRouteInfo(null);
    setError("");

    setIncidentLocation(null);
    setIncidentError("");
  };

  // ==========================================================
  // SELECT DESTINATION
  // ==========================================================

  const handleSelectDestination = (
    location
  ) => {
    const selected =
      normalizeLocation(
        location,
        "Selected destination"
      );

    if (!selected) {
      setError(
        "Selected destination has invalid coordinates."
      );

      return;
    }

    setDestination(selected);

    setDestinationText(
      selected.displayName
    );

    setDestinationSuggestions([]);
    setActiveSearch(null);

    setRouteCoordinates([]);
    setRouteInfo(null);
    setError("");
  };

  // ==========================================================
  // USE INCIDENT AS SOURCE
  // ==========================================================

  const handleUseIncidentAsSource =
    () => {
      if (
        !incidentLocation ||
        !isValidLocation(
          incidentLocation
        )
      ) {
        setError(
          "This incident does not have valid coordinates, so it cannot be used as a route source."
        );

        return;
      }

      const incidentSource = {
        lat: Number(
          incidentLocation.lat
        ),

        lon: Number(
          incidentLocation.lon
        ),

        displayName:
          incidentLocation.title ||
          "Traffic Incident",
      };

      setSource(incidentSource);

      setSourceText(
        incidentSource.displayName
      );

      setRouteCoordinates([]);
      setRouteInfo(null);
      setError("");

      const params =
        new URLSearchParams(
          window.location.search
        );

      [
        "notificationId",
        "notification_id",
        "lat",
        "lon",
        "latitude",
        "longitude",
        "lng",
        "incidentLat",
        "incidentLon",
        "incidentLatitude",
        "incidentLongitude",
        "title",
        "name",
        "alertType",
        "alert_type",
        "type",
        "category",
        "priority",
        "severity",
      ].forEach((key) => {
        params.delete(key);
      });

      const newQuery =
        params.toString();

      const newUrl = newQuery
        ? `${window.location.pathname}?${newQuery}`
        : window.location.pathname;

      window.history.replaceState(
        {},
        "",
        newUrl
      );

      setIncidentLocation(null);
      setIncidentError("");
    };

  // ==========================================================
  // FIND ROUTE
  // ==========================================================

  const handleFindRoute =
    useCallback(async () => {
      setError("");

      if (!source) {
        setError(
          "Please select a source location from the suggestions."
        );

        return;
      }

      if (!destination) {
        setError(
          "Please select a destination location from the suggestions."
        );

        return;
      }

      if (!isValidLocation(source)) {
        setError(
          "Invalid source coordinates."
        );

        return;
      }

      if (
        !isValidLocation(destination)
      ) {
        setError(
          "Invalid destination coordinates."
        );

        return;
      }

      try {
        setLoading(true);

        setRouteCoordinates([]);
        setRouteInfo(null);

        const response =
          await api.get(
            "/api/map-monitoring/route",
            {
              params: {
                source_lat:
                  Number(source.lat),

                source_lon:
                  Number(source.lon),

                dest_lat:
                  Number(
                    destination.lat
                  ),

                dest_lon:
                  Number(
                    destination.lon
                  ),
              },
            }
          );

        const data =
          response.data;

        console.log(
          "Route API response:",
          data
        );

        const coordinates =
          getRouteCoordinates(
            data?.geometry
          );

        if (
          coordinates.length < 2
        ) {
          throw new Error(
            "Route was found but route geometry is unavailable."
          );
        }

        const distance =
          Number(
            data?.distance_km
          );

        const duration =
          Number(
            data?.estimated_time_minutes
          );

        setRouteCoordinates(
          coordinates
        );

        setRouteInfo({
          distance:
            Number.isFinite(
              distance
            )
              ? distance.toFixed(2)
              : "0.00",

          duration:
            Number.isFinite(
              duration
            )
              ? duration.toFixed(1)
              : "0.0",

          status:
            data?.status ||
            "Route Found",
        });
      } catch (err) {
        console.error(
          "Route planning error:",
          err
        );

        const message =
          err.response?.data?.detail ||
          err.message ||
          "Unable to find route.";

        setError(message);

        setRouteCoordinates([]);
        setRouteInfo(null);
      } finally {
        setLoading(false);
      }
    }, [
      source,
      destination,
    ]);

  // ==========================================================
  // SWAP
  // ==========================================================

  const handleSwap = () => {
    const oldSourceText =
      sourceText;

    const oldSource = source;

    setSourceText(
      destinationText
    );

    setDestinationText(
      oldSourceText
    );

    setSource(destination);
    setDestination(oldSource);

    setSourceSuggestions([]);
    setDestinationSuggestions([]);

    setRouteCoordinates([]);
    setRouteInfo(null);

    setActiveSearch(null);
    setError("");

    setIncidentLocation(null);
    setIncidentError("");
  };

  // ==========================================================
  // CLEAR
  // ==========================================================

  const handleClear = () => {
    setSourceText("");
    setDestinationText("");

    setSource(null);
    setDestination(null);

    setSourceSuggestions([]);
    setDestinationSuggestions([]);

    setRouteCoordinates([]);
    setRouteInfo(null);

    setError("");
    setActiveSearch(null);

    setIncidentLocation(null);
    setIncidentError("");

    clearTimeout(
      sourceTimer.current
    );

    clearTimeout(
      destinationTimer.current
    );

    const params =
      new URLSearchParams(
        window.location.search
      );

    [
      "notificationId",
      "notification_id",
      "id",
      "lat",
      "lon",
      "latitude",
      "longitude",
      "lng",
      "incidentLat",
      "incidentLon",
      "incidentLatitude",
      "incidentLongitude",
      "source_lat",
      "source_lon",
      "sourceLatitude",
      "sourceLongitude",
      "title",
      "name",
      "notificationTitle",
      "alertType",
      "alert_type",
      "type",
      "category",
      "priority",
      "severity",
      "location",
      "locationName",
      "location_name",
      "address",
      "place",
      "road",
      "roadName",
      "road_name",
      "junction",
      "area",
      "incidentLocation",
      "incident_location",
      "congestion",
      "congestionLevel",
      "congestion_level",
      "vehicleCount",
      "vehicle_count",
      "vehicles",
      "speed",
      "vehicleSpeed",
      "weather",
      "accident",
      "isAccident",
      "trafficSignal",
      "traffic_signal",
      "signal",
      "lastUpdated",
      "last_updated",
      "updatedAt",
      "updated_at",
    ].forEach((key) => {
      params.delete(key);
    });

    const newQuery =
      params.toString();

    const newUrl = newQuery
      ? `${window.location.pathname}?${newQuery}`
      : window.location.pathname;

    window.history.replaceState(
      {},
      "",
      newUrl
    );
  };

  // ==========================================================
  // ENTER KEY
  // ==========================================================

  const handleKeyDown = (
    event
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (
      source &&
      destination &&
      !loading
    ) {
      handleFindRoute();
    }
  };

  // ==========================================================
  // CLICK OUTSIDE
  // ==========================================================

  useEffect(() => {
    const handleDocumentClick = (
      event
    ) => {
      if (
        !event.target.closest(
          ".autocomplete-wrapper"
        )
      ) {
        setActiveSearch(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleDocumentClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDocumentClick
      );
    };
  }, []);

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      clearTimeout(
        sourceTimer.current
      );

      clearTimeout(
        destinationTimer.current
      );
    };
  }, []);

  // ==========================================================
  // URL INCIDENT FALLBACK
  // ==========================================================

  const urlIncident =
    incidentLocation ||
    getIncidentFromUrl();

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Layout>
      <main className="map-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="map-page-header">
          <div>
            <div className="map-page-eyebrow">
              TRAFFICVISION AI
            </div>

            <h1>Map Monitoring</h1>

            <p>
              Plan routes, check travel
              distance and monitor traffic
              incidents.
            </p>
          </div>

          <div className="map-header-status">
            <span className="status-indicator" />
            Map Online
          </div>
        </header>

        {/* ==================================================
            INCIDENT CARD
        ================================================== */}

        {incidentLocation &&
          isValidLocation(
            incidentLocation
          ) && (
            <section className="incident-card">

              <div className="incident-card-header">

                <div>
                  <div className="section-eyebrow incident-eyebrow">
                    INCIDENT
                  </div>

                  <h2>
                    🚨 Incident Location
                  </h2>

                  <p>
                    Exact coordinates received
                    from the notification.
                  </p>
                </div>

                <div className="incident-badges">
                  <span className="incident-type-badge">
                    {cleanValue(
                      incidentLocation.alertType,
                      "SYSTEM"
                    ).toUpperCase()}
                  </span>

                  <span>•</span>

                  <span className="incident-priority-badge">
                    {cleanValue(
                      incidentLocation.priority,
                      "NORMAL"
                    ).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="incident-main-info">

                <div className="incident-coordinate">
                  <span>LATITUDE</span>

                  <strong>
                    {Number(
                      incidentLocation.lat
                    ).toFixed(6)}
                  </strong>
                </div>

                <div className="incident-coordinate">
                  <span>LONGITUDE</span>

                  <strong>
                    {Number(
                      incidentLocation.lon
                    ).toFixed(6)}
                  </strong>
                </div>

                <div className="incident-title-box">
                  📍{" "}
                  {cleanValue(
                    incidentLocation.title,
                    "Traffic Incident"
                  )}
                </div>

                <button
                  type="button"
                  className="incident-source-button"
                  onClick={
                    handleUseIncidentAsSource
                  }
                  disabled={loading}
                >
                  🧭 Use Incident as Route Source
                </button>

              </div>
            </section>
          )}

        {/* ==================================================
            LOCATION DETAILS
        ================================================== */}

        {incidentLocation &&
          isValidLocation(
            incidentLocation
          ) && (
            <section className="location-details-card">

              <div className="location-details-header">

                <div>
                  <div className="section-eyebrow">
                    LOCATION DETAILS
                  </div>

                  <h2>
                    📍{" "}
                    {cleanValue(
                      incidentLocation.title,
                      "Traffic Incident"
                    )}
                  </h2>

                  <p>
                    Exact incident information
                    received from the notification.
                  </p>
                </div>

                <div className="details-status">
                  🚨 Incident
                </div>
              </div>

              <div className="location-details-grid">

                <div className="detail-item">
                  <span className="detail-icon">
                    📍
                  </span>

                  <div>
                    <label>Location</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.locationText ||
                        incidentLocation.title
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🛣️
                  </span>

                  <div>
                    <label>Road</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.roadName
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🚦
                  </span>

                  <div>
                    <label>Congestion</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.congestionLevel
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🚗
                  </span>

                  <div>
                    <label>Vehicle Count</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.vehicleCount
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🏎️
                  </span>

                  <div>
                    <label>Speed</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.speed
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🌤️
                  </span>

                  <div>
                    <label>Weather</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.weather
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🚨
                  </span>

                  <div>
                    <label>Accident</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.accident
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🚦
                  </span>

                  <div>
                    <label>Traffic Signal</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.trafficSignal
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🌐
                  </span>

                  <div>
                    <label>Latitude</label>
                    <strong>
                      {Number(
                        incidentLocation.lat
                      ).toFixed(6)}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🌐
                  </span>

                  <div>
                    <label>Longitude</label>
                    <strong>
                      {Number(
                        incidentLocation.lon
                      ).toFixed(6)}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🕒
                  </span>

                  <div>
                    <label>Last Updated</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.lastUpdated
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    ⚠️
                  </span>

                  <div>
                    <label>Alert Type</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.alertType,
                        "System"
                      )}
                    </strong>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">
                    🔴
                  </span>

                  <div>
                    <label>Priority</label>
                    <strong>
                      {cleanValue(
                        incidentLocation.priority,
                        "Normal"
                      )}
                    </strong>
                  </div>
                </div>

              </div>
            </section>
          )}

        {/* ==================================================
            INCIDENT ERROR
        ================================================== */}

        {incidentError && (
          <section className="incident-unavailable-card">

            <div className="incident-unavailable-header">

              <div>
                <div className="section-eyebrow warning-eyebrow">
                  INCIDENT
                </div>

                <h2>
                  ⚠ Incident Location Unavailable
                </h2>

                <p>
                  The notification reached Map
                  Monitoring, but it did not
                  contain usable coordinates.
                </p>
              </div>

              {urlIncident?.priority && (
                <div className="warning-meta">
                  {cleanValue(
                    urlIncident.alertType,
                    "SYSTEM"
                  ).toUpperCase()}
                  {" • "}
                  {cleanValue(
                    urlIncident.priority,
                    "NORMAL"
                  ).toUpperCase()}
                </div>
              )}
            </div>

            <div className="incident-warning-box">

              <strong>
                Exact location was not supplied
                by the notification.
              </strong>

              <p>
                {incidentError}
              </p>

              <p className="warning-note">
                The notification must provide
                latitude and longitude for an
                exact incident location.
              </p>

            </div>
          </section>
        )}

        {/* ==================================================
            ROUTE PLANNER
        ================================================== */}

        <section className="route-planner-card">

          <div className="route-planner-header">

            <div>
              <div className="section-eyebrow">
                ROUTING
              </div>

              <h2>
                🧭 Route Planner
              </h2>

              <p>
                Start typing a place name and
                select a location from the
                suggestions.
              </p>
            </div>

            {routeInfo && (
              <div className="route-found-badge">
                ✓ Route Found
              </div>
            )}

          </div>

          {/* LOCATION ROW */}

          <div className="route-location-row">

            {/* SOURCE */}

            <div className="location-input-group">

              <label>
                <span className="location-dot source-dot" />
                Source Location
              </label>

              <div className="autocomplete-wrapper">

                <input
                  type="text"
                  value={sourceText}
                  onChange={
                    handleSourceChange
                  }
                  onFocus={() =>
                    setActiveSearch(
                      "source"
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="e.g. Tanuku"
                  disabled={loading}
                  autoComplete="off"
                />

                {activeSearch ===
                  "source" &&
                  sourceSuggestions.length >
                  0 && (
                    <div className="location-suggestions">

                      {sourceSuggestions.map(
                        (
                          location,
                          index
                        ) => (
                          <button
                            type="button"
                            className="location-suggestion"
                            key={`${location.latitude}-${location.longitude}-${index}`}
                            onMouseDown={(
                              event
                            ) => {
                              event.preventDefault();

                              handleSelectSource(
                                location
                              );
                            }}
                          >
                            <span className="suggestion-icon">
                              📍
                            </span>

                            <span className="suggestion-content">

                              <strong>
                                {location.display_name
                                  ?.split(
                                    ","
                                  )
                                  .slice(
                                    0,
                                    2
                                  )
                                  .join(
                                    ","
                                  ) ||
                                  "Location"}
                              </strong>

                              <small>
                                {
                                  location.display_name
                                }
                              </small>

                            </span>
                          </button>
                        )
                      )}

                    </div>
                  )}

              </div>

              {searchingSource && (
                <small className="searching-text">
                  Searching locations...
                </small>
              )}

              {source && (
                <small className="selected-location">
                  ✓ Location selected
                </small>
              )}

            </div>

            {/* SWAP */}

            <button
              type="button"
              className="swap-location-button"
              onClick={
                handleSwap
              }
              disabled={loading}
              title="Swap locations"
            >
              ⇅
            </button>

            {/* DESTINATION */}

            <div className="location-input-group">

              <label>
                <span className="location-dot destination-dot" />
                Destination
              </label>

              <div className="autocomplete-wrapper">

                <input
                  type="text"
                  value={
                    destinationText
                  }
                  onChange={
                    handleDestinationChange
                  }
                  onFocus={() =>
                    setActiveSearch(
                      "destination"
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="e.g. Charminar, Hyderabad"
                  disabled={loading}
                  autoComplete="off"
                />

                {activeSearch ===
                  "destination" &&
                  destinationSuggestions.length >
                  0 && (
                    <div className="location-suggestions">

                      {destinationSuggestions.map(
                        (
                          location,
                          index
                        ) => (
                          <button
                            type="button"
                            className="location-suggestion"
                            key={`${location.latitude}-${location.longitude}-${index}`}
                            onMouseDown={(
                              event
                            ) => {
                              event.preventDefault();

                              handleSelectDestination(
                                location
                              );
                            }}
                          >
                            <span className="suggestion-icon">
                              📍
                            </span>

                            <span className="suggestion-content">

                              <strong>
                                {location.display_name
                                  ?.split(
                                    ","
                                  )
                                  .slice(
                                    0,
                                    2
                                  )
                                  .join(
                                    ","
                                  ) ||
                                  "Location"}
                              </strong>

                              <small>
                                {
                                  location.display_name
                                }
                              </small>

                            </span>
                          </button>
                        )
                      )}

                    </div>
                  )}

              </div>

              {searchingDestination && (
                <small className="searching-text">
                  Searching locations...
                </small>
              )}

              {destination && (
                <small className="selected-location">
                  ✓ Location selected
                </small>
              )}

            </div>

          </div>

          {/* ACTIONS */}

          <div className="route-actions">

            <button
              type="button"
              className="find-route-button"
              onClick={
                handleFindRoute
              }
              disabled={
                loading ||
                !source ||
                !destination
              }
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Finding Route...
                </>
              ) : (
                <>
                  🛣️ Find Best Route
                </>
              )}
            </button>

            <button
              type="button"
              className="clear-route-button"
              onClick={
                handleClear
              }
              disabled={loading}
            >
              Clear
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="route-error">

              <span className="route-error-icon">
                !
              </span>

              <div>
                <strong>
                  Route Planning Error
                </strong>

                <p>{error}</p>
              </div>

            </div>
          )}

        </section>

        {/* ==================================================
            ROUTE RESULT
        ================================================== */}

        {routeInfo && (
          <div className="route-result-grid">

            <div className="route-result-card">

              <span className="route-result-icon">
                📍
              </span>

              <div>
                <span>From</span>

                <strong>
                  {sourceText}
                </strong>
              </div>

            </div>

            <div className="route-result-card">

              <span className="route-result-icon">
                🏁
              </span>

              <div>
                <span>To</span>

                <strong>
                  {destinationText}
                </strong>
              </div>

            </div>

            <div className="route-result-card highlight">

              <span className="route-result-icon">
                🛣️
              </span>

              <div>
                <span>
                  Distance
                </span>

                <strong>
                  {routeInfo.distance} km
                </strong>
              </div>

            </div>

            <div className="route-result-card highlight">

              <span className="route-result-icon">
                ⏱️
              </span>

              <div>
                <span>
                  Estimated Time
                </span>

                <strong>
                  {routeInfo.duration} min
                </strong>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            MAP
        ================================================== */}

        <section className="map-section">

          <div className="map-section-header">

            <div>
              <div className="section-eyebrow">
                LIVE MONITORING
              </div>

              <h2>
                Live Map
              </h2>

              <p>
                {incidentLocation &&
                  isValidLocation(
                    incidentLocation
                  )
                  ? "Showing the exact notification incident location."
                  : routeCoordinates.length >
                    1
                    ? "Showing the selected driving route."
                    : source &&
                      !destination
                      ? "Showing the selected source location."
                      : destination &&
                        !source
                        ? "Showing the selected destination location."
                        : "Explore selected locations, traffic incidents and driving routes."}
              </p>
            </div>

            <div className="map-controls-info">

              <span>
                + / − Zoom
              </span>

              <span>
                🖱️ Scroll to zoom
              </span>

            </div>

          </div>

          <div className="map-wrapper">

            <MapContainer
              center={HYDERABAD_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={true}
              zoomControl={false}
              className="traffic-map"
              whenReady={(event) => {
                setTimeout(() => {
                  event.target.invalidateSize();
                }, 100);

                setTimeout(() => {
                  event.target.invalidateSize();
                }, 500);
              }}
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <ZoomControl position="topleft" />

              <MapViewController
                source={source}
                destination={
                  destination
                }
                routeCoordinates={
                  routeCoordinates
                }
                incidentLocation={
                  incidentLocation
                }
              />

              {/* INCIDENT MARKER */}

              {incidentLocation &&
                isValidLocation(
                  incidentLocation
                ) && (
                  <Marker
                    position={[
                      Number(
                        incidentLocation.lat
                      ),
                      Number(
                        incidentLocation.lon
                      ),
                    ]}
                    icon={incidentIcon}
                  >
                    <Popup>

                      <div className="map-popup">

                        <strong>
                          🚨{" "}
                          {
                            incidentLocation.title
                          }
                        </strong>

                        <p>
                          <b>Type:</b>{" "}
                          {
                            incidentLocation.alertType
                          }
                        </p>

                        <p>
                          <b>Priority:</b>{" "}
                          {
                            incidentLocation.priority
                          }
                        </p>

                        <p>
                          <b>Latitude:</b>{" "}
                          {Number(
                            incidentLocation.lat
                          ).toFixed(6)}
                        </p>

                        <p>
                          <b>Longitude:</b>{" "}
                          {Number(
                            incidentLocation.lon
                          ).toFixed(6)}
                        </p>

                      </div>

                    </Popup>
                  </Marker>
                )}

              {/* SOURCE MARKER */}

              {source &&
                isValidLocation(
                  source
                ) && (
                  <Marker
                    position={[
                      Number(
                        source.lat
                      ),
                      Number(
                        source.lon
                      ),
                    ]}
                    icon={locationIcon}
                  >
                    <Popup>

                      <div className="map-popup">

                        <strong>
                          📍 Source
                        </strong>

                        <p>
                          {
                            source.displayName
                          }
                        </p>

                        <p>
                          {Number(
                            source.lat
                          ).toFixed(6)}
                          ,{" "}
                          {Number(
                            source.lon
                          ).toFixed(6)}
                        </p>

                      </div>

                    </Popup>
                  </Marker>
                )}

              {/* DESTINATION MARKER */}

              {destination &&
                isValidLocation(
                  destination
                ) && (
                  <Marker
                    position={[
                      Number(
                        destination.lat
                      ),
                      Number(
                        destination.lon
                      ),
                    ]}
                    icon={locationIcon}
                  >
                    <Popup>

                      <div className="map-popup">

                        <strong>
                          🏁 Destination
                        </strong>

                        <p>
                          {
                            destination.displayName
                          }
                        </p>

                        <p>
                          {Number(
                            destination.lat
                          ).toFixed(6)}
                          ,{" "}
                          {Number(
                            destination.lon
                          ).toFixed(6)}
                        </p>

                      </div>

                    </Popup>
                  </Marker>
                )}

              {/* ROUTE */}

              {routeCoordinates.length >
                1 && (
                  <Polyline
                    positions={
                      routeCoordinates
                    }
                    pathOptions={{
                      color: "#2563eb",
                      weight: 6,
                      opacity: 0.9,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                )}

            </MapContainer>

            {/* EMPTY MAP */}

            {!source &&
              !destination &&
              !incidentLocation &&
              !incidentError &&
              !loading && (
                <div className="map-empty-overlay">

                  <div className="map-empty-icon">
                    🗺️
                  </div>

                  <strong>
                    Plan your journey
                  </strong>

                  <span>
                    Select source and
                    destination locations
                    above.
                  </span>

                </div>
              )}

            {/* INCIDENT LABEL */}

            {incidentLocation &&
              isValidLocation(
                incidentLocation
              ) && (
                <div className="map-incident-label">

                  <div className="map-incident-label-inner">

                    <span className="map-incident-dot" />

                    <span>
                      Exact Incident Location
                    </span>

                  </div>

                </div>
              )}

          </div>

        </section>

        {/* ==================================================
            HELP
        ================================================== */}

        <section className="map-help-card">

          <div className="map-help-icon">
            💡
          </div>

          <div>

            <h3>
              How to use Map Monitoring
            </h3>

            <p>
              Start typing a place name such
              as{" "}
              <strong>Tanuku</strong>,{" "}
              <strong>Hitech City</strong>,{" "}
              <strong>Charminar</strong> or{" "}
              <strong>
                Hyderabad Airport
              </strong>
              . Select a suggestion and
              click{" "}
              <strong>
                Find Best Route
              </strong>
              .
            </p>

            <p>
              Notifications containing
              latitude and longitude
              automatically focus the map on
              the exact incident location.
            </p>

            <p>
              The Location Details section
              shows all traffic information
              available in the notification.
              Fields that are not supplied are
              shown as{" "}
              <strong>
                Not available
              </strong>
              .
            </p>

          </div>

        </section>

      </main>
    </Layout>
  );
}