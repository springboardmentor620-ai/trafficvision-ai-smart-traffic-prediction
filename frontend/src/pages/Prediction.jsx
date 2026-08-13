import React, { useEffect, useState } from "react";
import api from "../api/axios";

import {
    MapPin,
    Cloud,
    TrafficCone,
    Car,
    Clock3,
    CalendarDays,
    AlertTriangle,
    Zap,
    Gauge,
    Timer,
    Route,
    Sparkles,
    ArrowRight,
    Activity,
    CheckCircle2,
    Navigation,
    Download,
    History,
    RefreshCw,
    X,
    Info,
    Calculator
} from "lucide-react";

const Prediction = () => {
    // ============================================================
    // FORM STATE
    // ============================================================

    const [formData, setFormData] = useState({
        Road_Name: "Hitech City",
        Weather: "Clear",
        Traffic_Signal: "Green",
        Accident: "No",
        Hour: 9,
        Minute: 30,
        Day: 8,
        Month: 8,
        Weekday: 5,
        IsWeekend: 1,
        PeakHour: "Morning Peak",
        TimeSlot: "Morning"
    });

    // ============================================================
    // PREDICTION STATE
    // ============================================================

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ============================================================
    // RECENT PREDICTIONS
    // ============================================================

    const [recentPredictions, setRecentPredictions] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    // ============================================================
    // DEPARTURE TIME STATE
    // ============================================================

    const [arrivalTime, setArrivalTime] = useState("10:00");
    const [travelTime, setTravelTime] = useState(30);
    const [departureResult, setDepartureResult] = useState(null);
    const [departureLoading, setDepartureLoading] = useState(false);
    const [departureError, setDepartureError] = useState("");

    // ============================================================
    // UI STATE
    // ============================================================

    const [showRecent, setShowRecent] = useState(true);

    // ============================================================
    // OPTIONS
    // ============================================================

    const roadOptions = [
        "Banjara Hills",
        "Gachibowli",
        "Hitech City",
        "Kukatpally",
        "Miyapur"
    ];

    const weatherOptions = [
        "Clear",
        "Cloudy",
        "Rainy",
        "Foggy"
    ];

    const signalOptions = [
        "Red",
        "Yellow",
        "Green"
    ];

    const accidentOptions = [
        "No",
        "Yes"
    ];

    const peakOptions = [
        "Morning Peak",
        "Evening Peak",
        "Non-Peak"
    ];

    const timeSlotOptions = [
        "Morning",
        "Afternoon",
        "Evening",
        "Night"
    ];

    const weekdayOptions = [
        [0, "Monday"],
        [1, "Tuesday"],
        [2, "Wednesday"],
        [3, "Thursday"],
        [4, "Friday"],
        [5, "Saturday"],
        [6, "Sunday"]
    ];

    // ============================================================
    // LOAD RECENT PREDICTIONS
    // IMPORTANT:
    // This replaces the incorrect useRecentPrediction() hook.
    // ============================================================

    useEffect(() => {
        fetchRecentPredictions();
    }, []);

    // ============================================================
    // FETCH RECENT PREDICTIONS
    // ============================================================

    const fetchRecentPredictions = async () => {
        try {
            setHistoryLoading(true);
            setHistoryError("");

            const response = await api.get("/prediction/recent?limit=10");

            console.log("Recent predictions:", response.data);

            if (
                response.data &&
                Array.isArray(response.data.predictions)
            ) {
                setRecentPredictions(response.data.predictions);
            } else {
                setRecentPredictions([]);
            }
        } catch (err) {
            console.error("Recent prediction error:", err);

            setHistoryError(
                err.response?.data?.detail ||
                "Unable to load recent predictions."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    // ============================================================
    // HANDLE FORM CHANGE
    // ============================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        const numericFields = [
            "Hour",
            "Minute",
            "Day",
            "Month",
            "Weekday",
            "IsWeekend"
        ];

        setFormData((previous) => ({
            ...previous,
            [name]: numericFields.includes(name)
                ? Number(value)
                : value
        }));
    };

    // ============================================================
    // FORMAT API ERROR
    // ============================================================

    const formatApiError = (data) => {
        if (!data) {
            return "Prediction failed.";
        }

        if (Array.isArray(data.detail)) {
            return data.detail
                .map((item) => {
                    const location = Array.isArray(item.loc)
                        ? item.loc.join(" → ")
                        : "Request";

                    return `${location}: ${item.msg || "Invalid value"
                        }`;
                })
                .join("\n");
        }

        if (typeof data.detail === "string") {
            return data.detail;
        }

        if (
            data.detail &&
            typeof data.detail === "object"
        ) {
            return JSON.stringify(
                data.detail,
                null,
                2
            );
        }

        return "Prediction failed.";
    };

    // ============================================================
    // PREDICT TRAFFIC
    // ============================================================

    const handlePredict = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setPrediction(null);
        setDepartureResult(null);
        setDepartureError("");

        try {
            // Backend expects INTEGER.
            const peakHourValue =
                formData.PeakHour === "Non-Peak"
                    ? 0
                    : 1;

            const payload = {
                Road_Name: formData.Road_Name,

                Weather: formData.Weather,

                Traffic_Signal:
                    formData.Traffic_Signal,

                Accident: formData.Accident,

                Hour: Number(formData.Hour),

                Minute: Number(formData.Minute),

                Day: Number(formData.Day),

                Month: Number(formData.Month),

                Weekday: Number(formData.Weekday),

                IsWeekend: Number(formData.IsWeekend),

                PeakHour: peakHourValue,

                TimeSlot: formData.TimeSlot
            };

            console.log(
                "Prediction Request:",
                payload
            );

            const response = await api.post(
                "/prediction/predict",
                payload
            );

            console.log(
                "Prediction Response:",
                response.data
            );

            if (!response.data?.prediction) {
                throw new Error(
                    "Backend returned no prediction data."
                );
            }

            if (
                response.data.status === "error"
            ) {
                throw new Error(
                    response.data.prediction?.message ||
                    "ML model prediction failed."
                );
            }

            setPrediction(
                response.data.prediction
            );

            // Refresh recent predictions after
            // successful prediction.
            await fetchRecentPredictions();

        } catch (err) {
            console.error(
                "Prediction error:",
                err
            );

            setError(
                err.response?.data
                    ? formatApiError(
                        err.response.data
                    )
                    : err.message ||
                    "Unable to generate prediction."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // DOWNLOAD REPORT
    // ============================================================

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(
                "/prediction/report",
                {
                    responseType: "blob"
                }
            );

            const blob = new Blob(
                [response.data],
                {
                    type: "text/csv"
                }
            );

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `traffic_prediction_report_${new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace(/[:T]/g, "_")}.csv`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(
                "Report download error:",
                err
            );

            setError(
                "Unable to download prediction report."
            );
        }
    };

    // ============================================================
    // DEPARTURE TIME CALCULATOR
    // ============================================================

    const handleDepartureCalculation = async () => {
        if (!prediction?.id) {
            setDepartureError(
                "Please generate a prediction first."
            );

            return;
        }

        if (!arrivalTime) {
            setDepartureError(
                "Please select an arrival time."
            );

            return;
        }

        if (
            !travelTime ||
            Number(travelTime) <= 0
        ) {
            setDepartureError(
                "Travel time must be greater than 0."
            );

            return;
        }

        try {
            setDepartureLoading(true);
            setDepartureError("");
            setDepartureResult(null);

            const response = await api.get(
                `/prediction/${prediction.id}/departure-time`,
                {
                    params: {
                        arrival_time:
                            arrivalTime,

                        travel_time:
                            Number(travelTime)
                    }
                }
            );

            console.log(
                "Departure calculation:",
                response.data
            );

            setDepartureResult(
                response.data
            );

        } catch (err) {
            console.error(
                "Departure calculation error:",
                err
            );

            setDepartureError(
                err.response?.data?.detail ||
                "Unable to calculate departure time."
            );
        } finally {
            setDepartureLoading(false);
        }
    };

    // ============================================================
    // SELECT FIELD
    // ============================================================

    const SelectField = ({
        label,
        name,
        value,
        options,
        icon: Icon
    }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                {Icon && (
                    <Icon className="h-3.5 w-3.5 text-blue-400" />
                )}

                {label}
            </label>

            <select
                name={name}
                value={value}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
                {options.map((option) => {
                    const valueOption =
                        Array.isArray(option)
                            ? option[0]
                            : option;

                    const labelOption =
                        Array.isArray(option)
                            ? option[1]
                            : option;

                    return (
                        <option
                            key={`${name}-${valueOption}`}
                            value={valueOption}
                        >
                            {labelOption}
                        </option>
                    );
                })}
            </select>
        </div>
    );

    // ============================================================
    // NUMBER FIELD
    // ============================================================

    const NumberField = ({
        label,
        name,
        value,
        icon: Icon,
        min,
        max
    }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                {Icon && (
                    <Icon className="h-3.5 w-3.5 text-blue-400" />
                )}

                {label}
            </label>

            <input
                type="number"
                name={name}
                value={value}
                min={min}
                max={max}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
        </div>
    );

    // ============================================================
    // CONGESTION STYLE
    // ============================================================

    const congestionStyle = {
        Low:
            "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",

        Moderate:
            "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",

        High:
            "text-orange-400 border-orange-500/30 bg-orange-500/10",

        Severe:
            "text-red-400 border-red-500/30 bg-red-500/10"
    }[
        prediction?.congestion_level
    ] ||
        "text-slate-400 border-slate-500/30 bg-slate-500/10";

    // ============================================================
    // RECENT CONGESTION STYLE
    // ============================================================

    const getRecentCongestionStyle = (
        level
    ) => {
        if (level === "Low") {
            return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        }

        if (level === "Moderate") {
            return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
        }

        if (level === "High") {
            return "text-orange-400 bg-orange-500/10 border-orange-500/20";
        }

        if (level === "Severe") {
            return "text-red-400 bg-red-500/10 border-red-500/20";
        }

        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="min-h-screen bg-[#020617] text-white">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-slate-900 via-[#0b1224] to-[#020617]">

                <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div>

                            <div className="mb-3 flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">

                                    <Sparkles className="h-4 w-4 text-blue-400" />

                                </div>

                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                                    AI Traffic Intelligence
                                </span>

                            </div>

                            <h1 className="text-3xl font-bold md:text-4xl">
                                Traffic Prediction
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                Predict traffic volume, congestion,
                                estimated speed, delay and alternate
                                routes using the trained Random Forest
                                model.
                            </p>

                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-3">

                            <Activity className="h-5 w-5 text-blue-400" />

                            <div>
                                <p className="text-xs text-slate-500">
                                    Prediction Engine
                                </p>

                                <p className="text-sm font-semibold text-emerald-400">
                                    ● Online
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </header>

            {/* ====================================================
                MAIN
            ==================================================== */}

            <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

                {/* ==================================================
                    TOP ACTIONS
                ================================================== */}

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2 text-sm text-slate-400">

                        <History className="h-4 w-4 text-blue-400" />

                        <span>
                            {recentPredictions.length}
                            {" "}
                            recent prediction
                            {recentPredictions.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>

                    <div className="flex gap-3">

                        <button
                            type="button"
                            onClick={
                                fetchRecentPredictions
                            }
                            disabled={historyLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-blue-500/40 hover:text-white disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${historyLoading
                                        ? "animate-spin"
                                        : ""
                                    }`}
                            />

                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleDownloadReport
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20"
                        >
                            <Download className="h-4 w-4" />

                            Download Report
                        </button>

                    </div>

                </div>

                {/* ==================================================
                    PREDICTION + INPUT
                ================================================== */}

                <div className="grid grid-cols-1 gap-7 xl:grid-cols-5">

                    {/* =================================================
                        INPUT FORM
                    ================================================= */}

                    <div className="xl:col-span-3">

                        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl">

                            <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">

                                <Gauge className="h-5 w-5 text-blue-400" />

                                <div>

                                    <h2 className="font-semibold">
                                        Prediction Inputs
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Configure current traffic
                                        conditions
                                    </p>

                                </div>

                            </div>

                            <form
                                onSubmit={
                                    handlePredict
                                }
                                className="space-y-7 p-6"
                            >

                                {/* LOCATION */}

                                <section>

                                    <div className="mb-4 flex items-center gap-2">

                                        <MapPin className="h-4 w-4 text-blue-400" />

                                        <h3 className="text-sm font-semibold">
                                            Location
                                        </h3>

                                        <div className="h-px flex-1 bg-slate-800" />

                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">

                                        <SelectField
                                            label="Road Name"
                                            name="Road_Name"
                                            value={
                                                formData.Road_Name
                                            }
                                            options={
                                                roadOptions
                                            }
                                            icon={
                                                Navigation
                                            }
                                        />

                                        <SelectField
                                            label="Weather Condition"
                                            name="Weather"
                                            value={
                                                formData.Weather
                                            }
                                            options={
                                                weatherOptions
                                            }
                                            icon={
                                                Cloud
                                            }
                                        />

                                    </div>

                                </section>

                                {/* TRAFFIC */}

                                <section>

                                    <div className="mb-4 flex items-center gap-2">

                                        <TrafficCone className="h-4 w-4 text-blue-400" />

                                        <h3 className="text-sm font-semibold">
                                            Traffic Conditions
                                        </h3>

                                        <div className="h-px flex-1 bg-slate-800" />

                                    </div>

                                    <div className="grid gap-5 md:grid-cols-3">

                                        <SelectField
                                            label="Traffic Signal"
                                            name="Traffic_Signal"
                                            value={
                                                formData.Traffic_Signal
                                            }
                                            options={
                                                signalOptions
                                            }
                                            icon={
                                                TrafficCone
                                            }
                                        />

                                        <SelectField
                                            label="Accident"
                                            name="Accident"
                                            value={
                                                formData.Accident
                                            }
                                            options={
                                                accidentOptions
                                            }
                                            icon={
                                                AlertTriangle
                                            }
                                        />

                                        <SelectField
                                            label="Peak Hour"
                                            name="PeakHour"
                                            value={
                                                formData.PeakHour
                                            }
                                            options={
                                                peakOptions
                                            }
                                            icon={
                                                Zap
                                            }
                                        />

                                    </div>

                                </section>

                                {/* DATE TIME */}

                                <section>

                                    <div className="mb-4 flex items-center gap-2">

                                        <CalendarDays className="h-4 w-4 text-blue-400" />

                                        <h3 className="text-sm font-semibold">
                                            Date & Time
                                        </h3>

                                        <div className="h-px flex-1 bg-slate-800" />

                                    </div>

                                    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">

                                        <NumberField
                                            label="Hour"
                                            name="Hour"
                                            value={
                                                formData.Hour
                                            }
                                            min={0}
                                            max={23}
                                            icon={
                                                Clock3
                                            }
                                        />

                                        <NumberField
                                            label="Minute"
                                            name="Minute"
                                            value={
                                                formData.Minute
                                            }
                                            min={0}
                                            max={59}
                                            icon={
                                                Clock3
                                            }
                                        />

                                        <NumberField
                                            label="Day"
                                            name="Day"
                                            value={
                                                formData.Day
                                            }
                                            min={1}
                                            max={31}
                                            icon={
                                                CalendarDays
                                            }
                                        />

                                        <NumberField
                                            label="Month"
                                            name="Month"
                                            value={
                                                formData.Month
                                            }
                                            min={1}
                                            max={12}
                                            icon={
                                                CalendarDays
                                            }
                                        />

                                    </div>

                                </section>

                                {/* EXTRA */}

                                <section>

                                    <div className="grid gap-5 md:grid-cols-3">

                                        <SelectField
                                            label="Day of Week"
                                            name="Weekday"
                                            value={
                                                formData.Weekday
                                            }
                                            options={
                                                weekdayOptions
                                            }
                                            icon={
                                                CalendarDays
                                            }
                                        />

                                        <SelectField
                                            label="Weekend"
                                            name="IsWeekend"
                                            value={
                                                formData.IsWeekend
                                            }
                                            options={[
                                                [0, "No"],
                                                [1, "Yes"]
                                            ]}
                                            icon={
                                                CalendarDays
                                            }
                                        />

                                        <SelectField
                                            label="Time Slot"
                                            name="TimeSlot"
                                            value={
                                                formData.TimeSlot
                                            }
                                            options={
                                                timeSlotOptions
                                            }
                                            icon={
                                                Clock3
                                            }
                                        />

                                    </div>

                                </section>

                                {/* ERROR */}

                                {error && (
                                    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

                                        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />

                                        <div className="flex-1">

                                            <p className="text-sm font-semibold text-red-300">
                                                Prediction Failed
                                            </p>

                                            <p className="mt-1 whitespace-pre-line text-xs text-red-400">
                                                {error}
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setError("")
                                            }
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                    </div>
                                )}

                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    disabled={
                                        loading
                                    }
                                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 text-sm font-bold shadow-lg transition-all hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {loading ? (
                                        <>
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                            Analyzing Traffic...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />

                                            Predict Traffic

                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}

                                </button>

                            </form>

                        </div>

                    </div>

                    {/* =================================================
                        RESULT
                    ================================================= */}

                    <div className="xl:col-span-2">

                        {!prediction ? (

                            <div className="flex min-h-[500px] h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">

                                <Gauge className="mb-5 h-12 w-12 text-blue-400" />

                                <h3 className="text-lg font-semibold">
                                    Ready for Prediction
                                </h3>

                                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">

                                    Configure traffic conditions
                                    and click{" "}

                                    <span className="text-blue-400">
                                        Predict Traffic
                                    </span>

                                    {" "}
                                    to generate AI-powered
                                    insights.

                                </p>

                                <div className="mt-6 flex items-center gap-2 text-xs text-slate-600">

                                    <CheckCircle2 className="h-4 w-4" />

                                    Random Forest Model

                                </div>

                            </div>

                        ) : (

                            <div className="space-y-5">

                                {/* RESULT HEADER */}

                                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">

                                    <div className="flex items-start justify-between">

                                        <div>

                                            <div className="flex items-center gap-2">

                                                <Sparkles className="h-4 w-4 text-blue-400" />

                                                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                                                    AI Prediction
                                                </span>

                                            </div>

                                            <h2 className="mt-2 text-xl font-bold">
                                                Traffic Forecast
                                            </h2>

                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">

                                                <MapPin className="h-3.5 w-3.5" />

                                                {formData.Road_Name}

                                                <span>
                                                    •
                                                </span>

                                                {String(
                                                    formData.Hour
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                                :
                                                {String(
                                                    formData.Minute
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}

                                            </div>

                                        </div>

                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                                    </div>

                                </div>

                                {/* VEHICLES */}

                                <div className="rounded-2xl border border-blue-500/20 bg-blue-600/10 p-6">

                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">

                                        <Car className="h-4 w-4 text-blue-400" />

                                        Predicted Vehicles

                                    </div>

                                    <div className="mt-3">

                                        <span className="text-4xl font-bold">

                                            {Number(
                                                prediction.predicted_vehicle_count
                                            ).toFixed(2)}

                                        </span>

                                        <span className="ml-2 text-xs text-slate-500">
                                            vehicles
                                        </span>

                                    </div>

                                </div>

                                {/* METRICS */}

                                <div className="grid grid-cols-2 gap-4">

                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">

                                        <div className="flex items-center gap-2 text-xs text-slate-500">

                                            <TrafficCone className="h-4 w-4" />

                                            Congestion

                                        </div>

                                        <div
                                            className={`mt-4 inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${congestionStyle}`}
                                        >
                                            {
                                                prediction.congestion_level
                                            }
                                        </div>

                                    </div>

                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">

                                        <div className="flex items-center gap-2 text-xs text-slate-500">

                                            <Gauge className="h-4 w-4" />

                                            Estimated Speed

                                        </div>

                                        <p className="mt-3 text-2xl font-bold">

                                            {
                                                prediction.estimated_speed
                                            }

                                            <span className="text-xs text-slate-500">
                                                {" "}km/h
                                            </span>

                                        </p>

                                    </div>

                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">

                                        <div className="flex items-center gap-2 text-xs text-slate-500">

                                            <Timer className="h-4 w-4" />

                                            Estimated Delay

                                        </div>

                                        <p className="mt-3 text-2xl font-bold">

                                            {
                                                prediction.estimated_delay
                                            }

                                            <span className="text-xs text-slate-500">
                                                {" "}minutes
                                            </span>

                                        </p>

                                    </div>

                                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">

                                        <div className="flex items-center gap-2 text-xs text-slate-500">

                                            <MapPin className="h-4 w-4" />

                                            Selected Road

                                        </div>

                                        <p className="mt-3 truncate text-sm font-bold">

                                            {
                                                formData.Road_Name
                                            }

                                        </p>

                                    </div>

                                </div>

                                {/* ROUTE */}

                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">

                                    <div className="flex items-center gap-3">

                                        <Route className="h-5 w-5 text-blue-400" />

                                        <div>

                                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                                Route Recommendation
                                            </p>

                                            <p className="mt-1 text-sm font-bold">
                                                {
                                                    prediction.recommendation
                                                }
                                            </p>

                                        </div>

                                    </div>

                                    {prediction.alternate_route && (
                                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">

                                            <Navigation className="h-4 w-4 text-emerald-400" />

                                            <div>

                                                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                    Alternate Route
                                                </p>

                                                <p className="text-sm font-semibold text-emerald-400">
                                                    {
                                                        prediction.alternate_route
                                                    }
                                                </p>

                                            </div>

                                        </div>
                                    )}

                                </div>

                            </div>

                        )}

                    </div>

                </div>

                {/* ==================================================
                    DEPARTURE TIME PLANNER
                ================================================== */}

                {prediction && (
                    <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">

                        <div className="mb-5 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">

                                <Calculator className="h-5 w-5 text-blue-400" />

                            </div>

                            <div>

                                <h2 className="font-semibold">
                                    Smart Departure Planner
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Calculate when you should leave
                                    to arrive on time.
                                </p>

                            </div>

                        </div>

                        <div className="grid gap-5 md:grid-cols-3">

                            <div>

                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Desired Arrival Time
                                </label>

                                <input
                                    type="time"
                                    value={
                                        arrivalTime
                                    }
                                    onChange={(e) =>
                                        setArrivalTime(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                                />

                            </div>

                            <div>

                                <label className="mb-2 block text-xs font-semibold text-slate-400">
                                    Normal Travel Time
                                    (minutes)
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        travelTime
                                    }
                                    onChange={(e) =>
                                        setTravelTime(
                                            Number(
                                                e.target.value
                                            )
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                                />

                            </div>

                            <div className="flex items-end">

                                <button
                                    type="button"
                                    onClick={
                                        handleDepartureCalculation
                                    }
                                    disabled={
                                        departureLoading
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-60"
                                >

                                    {departureLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />

                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <Clock3 className="h-4 w-4" />

                                            Calculate Departure
                                        </>
                                    )}

                                </button>

                            </div>

                        </div>

                        {departureError && (
                            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                                {departureError}
                            </div>
                        )}

                        {departureResult && (
                            <div className="mt-5 grid gap-4 md:grid-cols-3">

                                <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">

                                    <p className="text-xs text-slate-500">
                                        Normal Travel
                                    </p>

                                    <p className="mt-2 text-xl font-bold">
                                        {
                                            departureResult.normal_travel_time
                                        }
                                        {" "}min
                                    </p>

                                </div>

                                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">

                                    <p className="text-xs text-slate-500">
                                        Traffic Delay
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-orange-400">
                                        +
                                        {
                                            departureResult.estimated_delay
                                        }
                                        {" "}min
                                    </p>

                                </div>

                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">

                                    <p className="text-xs text-slate-500">
                                        Recommended Departure
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-emerald-400">

                                        {
                                            departureResult.recommended_departure_time_formatted
                                        }

                                    </p>

                                </div>

                                <div className="md:col-span-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">

                                    <div className="flex items-center gap-3">

                                        <Info className="h-5 w-5 text-blue-400" />

                                        <p className="text-sm font-semibold text-blue-300">

                                            {
                                                departureResult.message
                                            }

                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}

                    </div>
                )}

                {/* ==================================================
                    RECENT PREDICTIONS
                ================================================== */}

                <div className="mt-7 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">

                    <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <History className="h-5 w-5 text-blue-400" />

                            <div>

                                <h2 className="font-semibold">
                                    Recent Predictions
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Your latest traffic prediction
                                    records
                                </p>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setShowRecent(
                                    (previous) =>
                                        !previous
                                )
                            }
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                        >
                            {showRecent
                                ? "Hide"
                                : "Show"}
                        </button>

                    </div>

                    {showRecent && (
                        <div className="p-6">

                            {historyError && (
                                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                                    {historyError}
                                </div>
                            )}

                            {historyLoading ? (
                                <div className="flex items-center justify-center py-10 text-sm text-slate-500">

                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />

                                    Loading recent predictions...

                                </div>
                            ) : recentPredictions.length === 0 ? (

                                <div className="py-10 text-center">

                                    <History className="mx-auto h-10 w-10 text-slate-700" />

                                    <p className="mt-3 text-sm text-slate-500">
                                        No recent predictions found.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-3">

                                    {recentPredictions.map(
                                        (item) => (
                                            <div
                                                key={
                                                    item.id
                                                }
                                                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-700"
                                            >

                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                                    <div className="flex items-center gap-4">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">

                                                            <Car className="h-5 w-5 text-blue-400" />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-semibold text-white">

                                                                {
                                                                    item.road_name ||
                                                                    "Unknown Road"
                                                                }

                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">

                                                                {item.prediction_date ||
                                                                    "--"}

                                                                {" • "}

                                                                {String(
                                                                    item.hour ??
                                                                    0
                                                                ).padStart(
                                                                    2,
                                                                    "0"
                                                                )}
                                                                :00

                                                            </p>

                                                        </div>

                                                    </div>

                                                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">

                                                        <div>

                                                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                                Vehicles
                                                            </p>

                                                            <p className="mt-1 text-sm font-bold">

                                                                {Number(
                                                                    item.predicted_vehicle_count ||
                                                                    0
                                                                ).toFixed(
                                                                    0
                                                                )}

                                                            </p>

                                                        </div>

                                                        <div>

                                                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                                Congestion
                                                            </p>

                                                            <span
                                                                className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${getRecentCongestionStyle(
                                                                    item.congestion_level
                                                                )}`}
                                                            >
                                                                {
                                                                    item.congestion_level
                                                                }
                                                            </span>

                                                        </div>

                                                        <div>

                                                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                                Speed
                                                            </p>

                                                            <p className="mt-1 text-sm font-bold">

                                                                {
                                                                    item.estimated_speed
                                                                }

                                                                <span className="ml-1 text-[10px] text-slate-600">
                                                                    km/h
                                                                </span>

                                                            </p>

                                                        </div>

                                                        <div>

                                                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                                                Delay
                                                            </p>

                                                            <p className="mt-1 text-sm font-bold">

                                                                {
                                                                    item.estimated_delay
                                                                }

                                                                <span className="ml-1 text-[10px] text-slate-600">
                                                                    min
                                                                </span>

                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                                {item.alternate_route && (
                                                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2">

                                                        <Navigation className="h-3.5 w-3.5 text-emerald-400" />

                                                        <span className="text-xs text-slate-500">
                                                            Alternate:
                                                        </span>

                                                        <span className="text-xs font-semibold text-emerald-400">
                                                            {
                                                                item.alternate_route
                                                            }
                                                        </span>

                                                    </div>
                                                )}

                                            </div>
                                        )
                                    )}

                                </div>

                            )}

                        </div>
                    )}

                </div>

            </main>

        </div>
    );
};

export default Prediction;
