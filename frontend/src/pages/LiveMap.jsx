import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, Polyline, ScaleControl, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { FiMaximize, FiNavigation } from "react-icons/fi";
import "leaflet/dist/leaflet.css";
import RouteForm from "../components/RouteForm";
import RouteCard from "../components/RouteCard";
import { recommendRoute } from "../services/trafficService";
import "../styles/LiveMap.css";
import "../styles/NavigationMap.css";

const sourceIcon = L.divIcon({ className: "navigation-marker", html: '<span class="source-pin"></span>', iconSize: [24, 24], iconAnchor: [12, 12] });
const destinationIcon = L.divIcon({ className: "navigation-marker", html: '<span class="destination-pin"></span>', iconSize: [24, 24], iconAnchor: [12, 12] });

function MapAutoFit({ route }) {
  const map = useMap();
  useEffect(() => {
    if (route?.geometry?.length > 1) map.flyToBounds(route.geometry, { padding: [46, 46], duration: 0.8, maxZoom: 14 });
  }, [map, route]);
  return null;
}

function LiveMap() {
  const [routeData, setRouteData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const mapWrapper = useRef(null);
  const selectedRoute = routeData?.routes.find((route) => route.id === selectedRouteId) || routeData?.best_route;
  const routes = routeData?.routes || [];

  async function handleFindRoute(data) {
    const response = await recommendRoute(data.sourceArea, data.sourceRoad, data.destinationArea, data.destinationRoad, data.vehicle);
    if (!response.best_route) throw new Error(response.detail || response.message || "Route recommendation failed");
    setRouteData(response);
    setSelectedRouteId(response.best_route.id);
    return response;
  }

  const trafficOverlay = useMemo(() => selectedRoute?.traffic || "Unknown", [selectedRoute]);

  return <div className="map-page">
    <div className="page-header"><div><span className="eyebrow">LIVE NAVIGATION</span><h1>Smart route intelligence</h1><p>Compare real road-network alternatives, then select the route that works best for you.</p></div></div>
    <RouteForm onFindRoute={handleFindRoute} onUseCurrentLocation={setCurrentPosition} />
    <div ref={mapWrapper} className="navigation-map-shell">
      <button type="button" className="map-fullscreen" onClick={() => mapWrapper.current?.requestFullscreen?.()}><FiMaximize /> Fullscreen</button>
      {selectedRoute && <div className="traffic-overlay"><FiNavigation /><span>Traffic context: <b>{trafficOverlay}</b></span></div>}
      <MapContainer center={[12.9716, 77.5946]} zoom={12} zoomControl={false} className="leaflet-map">
        <ZoomControl position="bottomright" /><ScaleControl position="bottomleft" />
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {routes.map((route) => <Polyline key={route.id} positions={route.geometry} pathOptions={{ color: route.id === selectedRoute?.id ? "#38bdf8" : route.color, weight: route.id === selectedRoute?.id ? 8 : 5, opacity: route.id === selectedRoute?.id ? 1 : 0.72, lineCap: "round" }} eventHandlers={{ click: () => setSelectedRouteId(route.id) }} />)}
        {routeData && <><Marker position={[routeData.source_location.lat, routeData.source_location.lng]} icon={sourceIcon}><Popup><div className="nav-popup"><b>Starting point</b><span>{routeData.source_road}</span><small>{routeData.source_area}</small></div></Popup></Marker><Marker position={[routeData.destination_location.lat, routeData.destination_location.lng]} icon={destinationIcon}><Popup><div className="nav-popup"><b>Destination</b><span>{routeData.destination_road}</span><small>{routeData.destination_area}</small></div></Popup></Marker></>}
        {currentPosition && <Marker position={currentPosition}><Popup><div className="nav-popup"><b>Your current location</b><small>Location from this device</small></div></Popup></Marker>}
        <MapAutoFit route={selectedRoute} />
      </MapContainer>
      <div className="map-legend"><span><i className="legend-recommended" />Recommended</span><span><i className="legend-alternate" />Alternate</span><span><i className="legend-backup" />Backup</span></div>
    </div>
    {routeData?.warnings?.map((warning) => <p key={warning} className="route-warning">{warning}</p>)}
    <RouteCard routes={routes} selectedRouteId={selectedRouteId} onSelectRoute={setSelectedRouteId} />
  </div>;
}

export default LiveMap;
