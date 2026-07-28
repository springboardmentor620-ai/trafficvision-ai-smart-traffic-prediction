import { useEffect, useState } from "react";
import Select from "react-select";
import { FiClock, FiHeart, FiMapPin, FiNavigation, FiRepeat, FiStar } from "react-icons/fi";
import { getAreas, getRoads } from "../services/trafficService";
import { useToast } from "../context/toast";
import "../styles/RouteForm.css";

const RECENT_ROUTES_KEY = "trafficvision-recent-routes";
const FAVORITE_ROUTES_KEY = "trafficvision-favorite-routes";

const optionFromValue = (value) => (value ? { value, label: value } : null);
const toOptions = (items) => items.map(optionFromValue);

function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const saved = previous[column];
      previous[column] = Math.min(
        previous[column] + 1,
        previous[column - 1] + 1,
        diagonal + (left[row - 1] === right[column - 1] ? 0 : 1)
      );
      diagonal = saved;
    }
  }
  return previous[right.length];
}

function isFuzzyMatch(label, input) {
  const query = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  const candidate = label.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!query || candidate.includes(query)) return true;
  return editDistance(candidate, query) <= Math.max(1, Math.floor(query.length / 4));
}

function readStoredRoutes(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function RouteForm({ onFindRoute, onUseCurrentLocation }) {
  const { showToast } = useToast();
  const [areas, setAreas] = useState([]);
  const [sourceArea, setSourceArea] = useState(null);
  const [destinationArea, setDestinationArea] = useState(null);
  const [sourceRoads, setSourceRoads] = useState([]);
  const [destinationRoads, setDestinationRoads] = useState([]);
  const [sourceRoad, setSourceRoad] = useState(null);
  const [destinationRoad, setDestinationRoad] = useState(null);
  const [vehicle, setVehicle] = useState("Car");
  const [loading, setLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(true);
  const [sourceRoadsLoading, setSourceRoadsLoading] = useState(false);
  const [destinationRoadsLoading, setDestinationRoadsLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [recentRoutes, setRecentRoutes] = useState(() => readStoredRoutes(RECENT_ROUTES_KEY));
  const [favoriteRoutes, setFavoriteRoutes] = useState(() => readStoredRoutes(FAVORITE_ROUTES_KEY));

  useEffect(() => {
    async function loadAreas() {
      try {
        const data = await getAreas();
        if (!Array.isArray(data)) throw new Error("Invalid areas response");
        setAreas(toOptions(data));
      } catch (error) {
        console.error("Error loading areas:", error);
        showToast("Areas could not be loaded. Please try again.", "error");
      } finally {
        setAreasLoading(false);
      }
    }
    loadAreas();
  }, [showToast]);

  useEffect(() => {
    async function loadRoads() {
      if (!sourceArea) {
        setSourceRoads([]);
        setSourceRoad(null);
        return;
      }
      setSourceRoadsLoading(true);
      try {
        const data = await getRoads(sourceArea.value);
        setSourceRoads(toOptions(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Error loading source roads:", error);
        showToast("Source roads could not be loaded.", "error");
      } finally {
        setSourceRoadsLoading(false);
      }
    }
    loadRoads();
  }, [sourceArea, showToast]);

  useEffect(() => {
    async function loadRoads() {
      if (!destinationArea) {
        setDestinationRoads([]);
        setDestinationRoad(null);
        return;
      }
      setDestinationRoadsLoading(true);
      try {
        const data = await getRoads(destinationArea.value);
        setDestinationRoads(toOptions(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Error loading destination roads:", error);
        showToast("Destination roads could not be loaded.", "error");
      } finally {
        setDestinationRoadsLoading(false);
      }
    }
    loadRoads();
  }, [destinationArea, showToast]);

  const route = sourceArea && sourceRoad && destinationArea && destinationRoad
    ? { sourceArea: sourceArea.value, sourceRoad: sourceRoad.value, destinationArea: destinationArea.value, destinationRoad: destinationRoad.value, vehicle }
    : null;

  function applyRoute(savedRoute) {
    setSourceArea(optionFromValue(savedRoute.sourceArea));
    setSourceRoad(optionFromValue(savedRoute.sourceRoad));
    setDestinationArea(optionFromValue(savedRoute.destinationArea));
    setDestinationRoad(optionFromValue(savedRoute.destinationRoad));
    setVehicle(savedRoute.vehicle || "Car");
    showToast("Route details restored.", "success");
  }

  function persistRoute(key, routeToStore, setter) {
    const current = readStoredRoutes(key);
    const unique = current.filter((item) => `${item.sourceArea}-${item.sourceRoad}-${item.destinationArea}-${item.destinationRoad}` !== `${routeToStore.sourceArea}-${routeToStore.sourceRoad}-${routeToStore.destinationArea}-${routeToStore.destinationRoad}`);
    const next = [routeToStore, ...unique].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(next));
    setter(next);
  }

  async function handleFindRoute() {
    if (!route) {
      showToast("Select a source and destination before finding a route.", "info");
      return;
    }
    setLoading(true);
    try {
      await onFindRoute(route);
      persistRoute(RECENT_ROUTES_KEY, route, setRecentRoutes);
      showToast("Your route recommendation is ready.", "success");
    } catch (error) {
      console.error("Route error:", error);
      showToast("Unable to find a route right now.", "error");
    } finally {
      setLoading(false);
    }
  }

  function swapRoute() {
    setSourceArea(destinationArea);
    setSourceRoad(destinationRoad);
    setDestinationArea(sourceArea);
    setDestinationRoad(sourceRoad);
  }

  function saveFavorite() {
    if (!route) return showToast("Select a complete route before saving it.", "info");
    persistRoute(FAVORITE_ROUTES_KEY, route, setFavoriteRoutes);
    showToast("Route saved to favorites.", "success");
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return showToast("Location services are unavailable in this browser.", "error");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onUseCurrentLocation([coords.latitude, coords.longitude]);
        setLocating(false);
        showToast("Current location added to the map.", "success");
      },
      () => {
        setLocating(false);
        showToast("Location permission was not granted.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const selectProps = { isSearchable: true, filterOption: (option, input) => isFuzzyMatch(option.label, input), classNamePrefix: "route-select" };

  return (
    <section className="route-form glass-panel">
      <div className="route-form-heading">
        <div><span className="eyebrow">INTELLIGENT PLANNER</span><h2>Plan a smarter journey</h2><p>Search with partial names or minor typos to find the right location faster.</p></div>
        <button type="button" className="icon-action" onClick={useCurrentLocation} disabled={locating} title="Use current location"><FiNavigation />{locating ? "Locating…" : "My location"}</button>
      </div>

      <div className="route-grid">
        <label className="field"><span><FiMapPin /> Source area</span><Select {...selectProps} options={areas} value={sourceArea} onChange={setSourceArea} isLoading={areasLoading} placeholder="Search area, e.g. koramngala" noOptionsMessage={() => "No matching area"} /></label>
        <label className="field"><span>Source road</span><Select {...selectProps} options={sourceRoads} value={sourceRoad} onChange={setSourceRoad} isDisabled={!sourceArea} isLoading={sourceRoadsLoading} placeholder="Search source road" noOptionsMessage={() => "No matching road"} /></label>
        <button type="button" className="swap-button" onClick={swapRoute} title="Swap source and destination" aria-label="Swap source and destination"><FiRepeat /></button>
        <label className="field"><span><FiMapPin /> Destination area</span><Select {...selectProps} options={areas} value={destinationArea} onChange={setDestinationArea} isLoading={areasLoading} placeholder="Search destination area" noOptionsMessage={() => "No matching area"} /></label>
        <label className="field"><span>Destination road</span><Select {...selectProps} options={destinationRoads} value={destinationRoad} onChange={setDestinationRoad} isDisabled={!destinationArea} isLoading={destinationRoadsLoading} placeholder="Search destination road" noOptionsMessage={() => "No matching road"} /></label>
      </div>

      <div className="route-actions-row">
        <label className="field vehicle-field"><span>Vehicle type</span><select value={vehicle} onChange={(event) => setVehicle(event.target.value)}><option value="Car">Car</option><option value="Bike">Bike</option><option value="Bus">Bus</option><option value="Truck">Truck</option><option value="Emergency Vehicle">Emergency Vehicle</option></select></label>
        <button type="button" className="secondary-button" onClick={saveFavorite}><FiHeart /> Save favorite</button>
        <button type="button" className="find-btn" onClick={handleFindRoute} disabled={loading}>{loading ? "Finding your best route…" : "Find best route"}</button>
      </div>

      <div className="saved-routes">
        <SavedRouteList title="Recent routes" icon={FiClock} routes={recentRoutes} onSelect={applyRoute} empty="Routes you plan will appear here." />
        <SavedRouteList title="Favorites" icon={FiStar} routes={favoriteRoutes} onSelect={applyRoute} empty="Save frequently used routes here." />
      </div>
    </section>
  );
}

function SavedRouteList({ title, icon: Icon, routes, onSelect, empty }) {
  return <div className="saved-route-list"><h3><Icon /> {title}</h3>{routes.length ? <div>{routes.map((item, index) => <button type="button" key={`${item.sourceArea}-${item.destinationArea}-${index}`} onClick={() => onSelect(item)}><span>{item.sourceArea} <b>→</b> {item.destinationArea}</span><small>{item.sourceRoad} · {item.destinationRoad}</small></button>)}</div> : <p>{empty}</p>}</div>;
}

export default RouteForm;
