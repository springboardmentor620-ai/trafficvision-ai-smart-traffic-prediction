import { useEffect } from "react";
import { useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

function RoutingMachine({ source, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!source || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(source[0], source[1]),
        L.latLng(destination[0], destination[1]),
      ],

      routeWhileDragging: false,

      draggableWaypoints: false,

      addWaypoints: false,

      fitSelectedRoutes: true,

      show: false,

      collapsible: true,

      showAlternatives: false,

      lineOptions: {
        styles: [
          {
            color: "#2563eb",
            weight: 6,
            opacity: 0.9,
          },
        ],
      },

      createMarker: function (i, waypoint) {
        return L.marker(waypoint.latLng);
      },
    }).addTo(map);

    // Hide the default routing instructions panel
    const container = routingControl.getContainer();

    if (container) {
      container.style.display = "none";
    }

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, source, destination]);

  return null;
}

export default RoutingMachine;