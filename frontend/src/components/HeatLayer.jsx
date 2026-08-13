import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// ============================================================
// TrafficVisionAI
// HeatLayer.jsx
//
// Purpose:
// - Render traffic intensity over a LIGHT basemap.
// - Keep roads, names and places visible.
// - Low       -> Green
// - Moderate  -> Yellow
// - High      -> Orange
// - Critical  -> Red
// - Avoid huge overlapping blobs.
// - Use Canvas for better performance.
// - Compatible with:
//
//   <HeatLayer markers={points} />
//
// API point format:
//
// {
//   latitude: 17.385,
//   longitude: 78.486,
//   intensity: 0.75,
//   congestion_level: "High",
//   vehicle_count: 250,
//   speed: 32,
//   road_name: "NH 65",
//   datetime: "..."
// }
//
// ============================================================


// ============================================================
// CONGESTION NORMALIZATION
// ============================================================

function normalizeCongestion(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "Unknown";
    }

    const normalized = String(value)
        .trim()
        .toLowerCase();

    if (
        normalized === "low" ||
        normalized === "very low" ||
        normalized === "very_low"
    ) {
        return "Low";
    }

    if (
        normalized === "moderate" ||
        normalized === "medium"
    ) {
        return "Moderate";
    }

    if (normalized === "high") {
        return "High";
    }

    if (
        normalized === "severe" ||
        normalized === "critical"
    ) {
        return "Critical";
    }

    return "Unknown";
}


// ============================================================
// CONGESTION RANK
// ============================================================

function getCongestionRank(value) {
    switch (normalizeCongestion(value)) {
        case "Low":
            return 1;

        case "Moderate":
            return 2;

        case "High":
            return 3;

        case "Critical":
            return 4;

        default:
            return 0;
    }
}


// ============================================================
// SAFE INTENSITY
// ============================================================

function getIntensity(point) {
    const value = Number(point?.intensity);

    if (Number.isFinite(value)) {
        return Math.max(
            0.05,
            Math.min(1, value)
        );
    }

    switch (
    normalizeCongestion(
        point?.congestion_level
    )
    ) {
        case "Critical":
            return 1.0;

        case "High":
            return 0.80;

        case "Moderate":
            return 0.55;

        case "Low":
            return 0.25;

        default:
            return 0.15;
    }
}


// ============================================================
// COORDINATE VALIDATION
// ============================================================

function getCoordinates(point) {
    const latitude = Number(
        point?.latitude
    );

    const longitude = Number(
        point?.longitude
    );

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

    return {
        latitude,
        longitude,
    };
}


// ============================================================
// TRAFFIC COLOR
// ============================================================

function getTrafficColor(point) {
    const congestion =
        normalizeCongestion(
            point?.congestion_level
        );

    switch (congestion) {
        case "Low":
            return {
                r: 34,
                g: 197,
                b: 94,
            };

        case "Moderate":
            return {
                r: 234,
                g: 179,
                b: 8,
            };

        case "High":
            return {
                r: 249,
                g: 115,
                b: 22,
            };

        case "Critical":
            return {
                r: 239,
                g: 68,
                b: 68,
            };

        default: {
            const intensity =
                getIntensity(point);

            if (intensity >= 0.85) {
                return {
                    r: 239,
                    g: 68,
                    b: 68,
                };
            }

            if (intensity >= 0.65) {
                return {
                    r: 249,
                    g: 115,
                    b: 22,
                };
            }

            if (intensity >= 0.40) {
                return {
                    r: 234,
                    g: 179,
                    b: 8,
                };
            }

            return {
                r: 34,
                g: 197,
                b: 94,
            };
        }
    }
}


// ============================================================
// ZOOM-BASED RADIUS
// ============================================================

function getRadius(zoom) {
    if (zoom >= 17) {
        return 18;
    }

    if (zoom >= 15) {
        return 22;
    }

    if (zoom >= 13) {
        return 26;
    }

    if (zoom >= 11) {
        return 31;
    }

    if (zoom >= 9) {
        return 36;
    }

    return 42;
}


// ============================================================
// ZOOM-BASED GRID
// ============================================================

function getGridSize(zoom) {
    if (zoom >= 17) {
        return 12;
    }

    if (zoom >= 15) {
        return 14;
    }

    if (zoom >= 13) {
        return 16;
    }

    if (zoom >= 11) {
        return 18;
    }

    if (zoom >= 9) {
        return 21;
    }

    return 24;
}


// ============================================================
// CREATE GROUPS
//
// Nearby points are combined into one visual traffic zone.
//
// Important:
// We don't simply add intensity values together.
// Otherwise many normal points could become an artificial
// critical zone.
//
// Instead:
// - Keep strongest congestion.
// - Average location.
// - Keep point count.
// ============================================================

function groupVisiblePoints(
    points,
    map,
    size,
    radius,
    zoom
) {
    const gridSize =
        getGridSize(zoom);

    const groups = new Map();

    for (const point of points) {
        const coordinates =
            getCoordinates(point);

        if (!coordinates) {
            continue;
        }

        const latLng =
            L.latLng(
                coordinates.latitude,
                coordinates.longitude
            );

        const pixel =
            map.latLngToContainerPoint(
                latLng
            );

        // ----------------------------------------------------
        // Only render points around the visible map.
        // ----------------------------------------------------

        if (
            pixel.x < -radius ||
            pixel.x > size.x + radius ||
            pixel.y < -radius ||
            pixel.y > size.y + radius
        ) {
            continue;
        }

        const gridX =
            Math.floor(
                pixel.x / gridSize
            );

        const gridY =
            Math.floor(
                pixel.y / gridSize
            );

        const key =
            `${gridX}:${gridY}`;

        const intensity =
            getIntensity(point);

        const congestion =
            normalizeCongestion(
                point?.congestion_level
            );

        const rank =
            getCongestionRank(
                congestion
            );

        const color =
            getTrafficColor(point);

        const existing =
            groups.get(key);

        if (!existing) {
            groups.set(
                key,
                {
                    x: pixel.x,
                    y: pixel.y,

                    intensity,

                    color,

                    rank,

                    count: 1,

                    latitudeSum:
                        coordinates.latitude,

                    longitudeSum:
                        coordinates.longitude,

                    strongestPoint:
                        point,
                }
            );

            continue;
        }

        // ----------------------------------------------------
        // Update average location.
        // ----------------------------------------------------

        existing.latitudeSum +=
            coordinates.latitude;

        existing.longitudeSum +=
            coordinates.longitude;

        existing.count += 1;

        // ----------------------------------------------------
        // Keep strongest traffic condition.
        // ----------------------------------------------------

        if (
            rank > existing.rank ||
            (
                rank === existing.rank &&
                intensity > existing.intensity
            )
        ) {
            existing.rank = rank;

            existing.intensity =
                intensity;

            existing.color =
                color;

            existing.strongestPoint =
                point;
        }

        // ----------------------------------------------------
        // Keep latest visual position.
        // ----------------------------------------------------

        existing.x =
            pixel.x;

        existing.y =
            pixel.y;
    }

    return Array.from(
        groups.values()
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function HeatLayer({
    markers = [],
}) {
    const map = useMap();

    useEffect(() => {
        if (!map) {
            return undefined;
        }

        if (
            !Array.isArray(markers) ||
            markers.length === 0
        ) {
            return undefined;
        }

        // ====================================================
        // CANVAS
        // ====================================================

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.className =
            "traffic-heatmap-canvas";

        canvas.style.position =
            "absolute";

        canvas.style.pointerEvents =
            "none";

        canvas.style.zIndex =
            "350";

        // Important:
        // Keep base map readable.
        canvas.style.opacity =
            "0.86";

        // ====================================================
        // DRAW FUNCTION
        // ====================================================

        let animationFrame = null;

        const drawHeatmap = () => {
            if (!map) {
                return;
            }

            const ctx =
                canvas.getContext(
                    "2d"
                );

            if (!ctx) {
                return;
            }

            const size =
                map.getSize();

            if (
                !size ||
                size.x <= 0 ||
                size.y <= 0
            ) {
                return;
            }

            const dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            // ------------------------------------------------
            // Resize canvas.
            // ------------------------------------------------

            const width =
                Math.max(
                    1,
                    Math.floor(
                        size.x * dpr
                    )
                );

            const height =
                Math.max(
                    1,
                    Math.floor(
                        size.y * dpr
                    )
                );

            if (
                canvas.width !== width ||
                canvas.height !== height
            ) {
                canvas.width = width;
                canvas.height = height;

                canvas.style.width =
                    `${size.x}px`;

                canvas.style.height =
                    `${size.y}px`;
            }

            // ------------------------------------------------
            // Clear previous frame.
            // ------------------------------------------------

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.save();

            ctx.scale(
                dpr,
                dpr
            );

            // ------------------------------------------------
            // Current zoom.
            // ------------------------------------------------

            const zoom =
                map.getZoom();

            const radius =
                getRadius(zoom);

            // ------------------------------------------------
            // Group visible points.
            // ------------------------------------------------

            const groupedPoints =
                groupVisiblePoints(
                    markers,
                    map,
                    size,
                    radius,
                    zoom
                );

            // =================================================
            // DRAW TRAFFIC ZONES
            // =================================================

            for (const point of groupedPoints) {
                const {
                    x,
                    y,
                    intensity,
                    color,
                    count,
                } = point;

                // ------------------------------------------------
                // Keep intensity visually controlled.
                // ------------------------------------------------

                const normalizedIntensity =
                    Math.max(
                        0.05,
                        Math.min(
                            1,
                            intensity
                        )
                    );

                // ------------------------------------------------
                // Base opacity.
                //
                // Deliberately kept low so roads and labels
                // remain visible.
                // ------------------------------------------------

                let opacity =
                    0.13 +
                    normalizedIntensity *
                    0.18;

                // Many records in one area should NOT produce
                // an opaque blob.

                if (count > 5) {
                    opacity *= 0.92;
                }

                if (count > 15) {
                    opacity *= 0.88;
                }

                if (count > 30) {
                    opacity *= 0.84;
                }

                opacity =
                    Math.max(
                        0.10,
                        Math.min(
                            0.32,
                            opacity
                        )
                    );

                // =================================================
                // OUTER GLOW
                // =================================================

                const outerRadius =
                    radius * 1.30;

                const outerGradient =
                    ctx.createRadialGradient(
                        x,
                        y,
                        0,
                        x,
                        y,
                        outerRadius
                    );

                outerGradient.addColorStop(
                    0,
                    `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.62})`
                );

                outerGradient.addColorStop(
                    0.35,
                    `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.30})`
                );

                outerGradient.addColorStop(
                    0.70,
                    `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.08})`
                );

                outerGradient.addColorStop(
                    1,
                    `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
                );

                ctx.fillStyle =
                    outerGradient;

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    outerRadius,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                // =================================================
                // INNER ZONE
                // =================================================

                const innerRadius =
                    radius * 0.68;

                const innerGradient =
                    ctx.createRadialGradient(
                        x,
                        y,
                        0,
                        x,
                        y,
                        innerRadius
                    );

                innerGradient.addColorStop(
                    0,
                    `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.min(
                        0.44,
                        opacity + 0.10
                    )})`
                );

                innerGradient.addColorStop(
                    0.45,
                    `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.65})`
                );

                innerGradient.addColorStop(
                    0.78,
                    `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.20})`
                );

                innerGradient.addColorStop(
                    1,
                    `rgba(${color.r}, ${color.g}, ${color.b}, 0)`
                );

                ctx.fillStyle =
                    innerGradient;

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    innerRadius,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                // =================================================
                // CENTER INDICATOR
                // =================================================

                const centerRadius =
                    2.5 +
                    normalizedIntensity *
                    2.5;

                ctx.beginPath();

                ctx.arc(
                    x,
                    y,
                    centerRadius,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle =
                    `rgba(${color.r}, ${color.g}, ${color.b}, 0.70)`;

                ctx.fill();

                // ------------------------------------------------
                // Small white center highlight.
                //
                // Helps the point remain distinguishable on
                // light maps without creating a marker-like UI.
                // ------------------------------------------------

                if (
                    normalizedIntensity >=
                    0.65
                ) {
                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        1.4,
                        0,
                        Math.PI * 2
                    );

                    ctx.fillStyle =
                        "rgba(255,255,255,0.55)";

                    ctx.fill();
                }
            }

            ctx.restore();
        };

        // ====================================================
        // SCHEDULE DRAW
        //
        // Prevent multiple rapid redraws during map movement.
        // ====================================================

        const scheduleDraw = () => {
            if (
                animationFrame !== null
            ) {
                return;
            }

            animationFrame =
                window.requestAnimationFrame(
                    () => {
                        animationFrame =
                            null;

                        drawHeatmap();
                    }
                );
        };

        // ====================================================
        // LEAFLET LAYER
        // ====================================================

        const HeatCanvasLayer =
            L.Layer.extend({
                onAdd() {
                    const pane =
                        map.getPane(
                            "overlayPane"
                        );

                    if (!pane) {
                        return;
                    }

                    pane.appendChild(
                        canvas
                    );

                    this._draw =
                        scheduleDraw;

                    map.on(
                        "move",
                        this._draw,
                        this
                    );

                    map.on(
                        "zoom",
                        this._draw,
                        this
                    );

                    map.on(
                        "resize",
                        this._draw,
                        this
                    );

                    map.on(
                        "moveend",
                        this._draw,
                        this
                    );

                    map.on(
                        "zoomend",
                        this._draw,
                        this
                    );

                    drawHeatmap();
                },

                onRemove() {
                    if (
                        this._draw
                    ) {
                        map.off(
                            "move",
                            this._draw,
                            this
                        );

                        map.off(
                            "zoom",
                            this._draw,
                            this
                        );

                        map.off(
                            "resize",
                            this._draw,
                            this
                        );

                        map.off(
                            "moveend",
                            this._draw,
                            this
                        );

                        map.off(
                            "zoomend",
                            this._draw,
                            this
                        );
                    }

                    if (
                        canvas.parentNode
                    ) {
                        canvas.parentNode.removeChild(
                            canvas
                        );
                    }
                },
            });

        const layer =
            new HeatCanvasLayer();

        // ====================================================
        // ADD LAYER
        // ====================================================

        layer.addTo(map);

        // ====================================================
        // CLEANUP
        // ====================================================

        return () => {
            if (
                animationFrame !== null
            ) {
                window.cancelAnimationFrame(
                    animationFrame
                );

                animationFrame = null;
            }

            if (
                map.hasLayer(layer)
            ) {
                map.removeLayer(
                    layer
                );
            }
        };
    }, [map, markers]);

    return null;
}