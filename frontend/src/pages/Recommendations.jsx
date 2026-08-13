import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Layout from "../components/Layout";
import api from "../api/axios";

import {
  Cpu,
  Zap,
  Radio,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Clock,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Route,
  Activity,
  CheckCircle,
  Gauge,
  BrainCircuit,
  Database,
  Timer,
  Siren,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";

// ================================================================
// CONSTANTS
// ================================================================

const URGENCY_CFG = {
  Critical: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-600",
    ring: "border-red-500/40",
    progress: "bg-red-500",
  },

  High: {
    bg: "bg-orange-500/10 border-orange-500/30",
    text: "text-orange-400",
    badge: "bg-orange-600",
    ring: "border-orange-500/40",
    progress: "bg-orange-500",
  },

  Medium: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-400",
    badge: "bg-yellow-600",
    ring: "border-yellow-500/40",
    progress: "bg-yellow-500",
  },

  Low: {
    bg: "bg-green-500/10 border-green-500/30",
    text: "text-green-400",
    badge: "bg-green-600",
    ring: "border-green-500/40",
    progress: "bg-green-500",
  },
};

// ================================================================
// SAFE HELPERS
// ================================================================

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function safeText(value, fallback = "--") {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
}

function formatNumber(value) {
  const number = safeNumber(value);

  return number.toLocaleString();
}

function formatPercentage(value) {
  const number = safeNumber(value);

  if (number === 0) {
    return "0%";
  }

  return `${number > 0 ? "+" : ""}${number.toFixed(1)}%`;
}

function getRiskColor(score) {
  const value = safeNumber(score);

  if (value >= 85) {
    return "text-red-400";
  }

  if (value >= 65) {
    return "text-orange-400";
  }

  if (value >= 40) {
    return "text-yellow-400";
  }

  return "text-green-400";
}

function getRiskLabel(score) {
  const value = safeNumber(score);

  if (value >= 85) {
    return "Critical";
  }

  if (value >= 65) {
    return "High";
  }

  if (value >= 40) {
    return "Moderate";
  }

  return "Low";
}

function getChangeConfig(change) {
  const value = safeNumber(change);

  if (value > 0) {
    return {
      icon: TrendingUp,
      className: "text-red-400",
      label: "Increasing",
    };
  }

  if (value < 0) {
    return {
      icon: TrendingDown,
      className: "text-green-400",
      label: "Decreasing",
    };
  }

  return {
    icon: Activity,
    className: "text-slate-400",
    label: "Stable",
  };
}

function formatGeneratedAt(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString();
}

function getRelativeFreshness(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const difference =
    Math.max(
      0,
      Date.now() - date.getTime()
    ) / 1000;

  if (difference < 10) {
    return "Just now";
  }

  if (difference < 60) {
    return `${Math.floor(difference)}s ago`;
  }

  if (difference < 3600) {
    return `${Math.floor(difference / 60)}m ago`;
  }

  return `${Math.floor(difference / 3600)}h ago`;
}

// ================================================================
// KPI CARD
// ================================================================

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = "text-purple-400",
  bgClass = "bg-slate-900/60 border-slate-800",
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        ${bgClass}
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">
          {title}
        </span>

        <Icon
          className={`w-5 h-5 ${iconClass}`}
        />
      </div>

      <p className="text-2xl font-bold text-white mt-3">
        {value}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        {subtitle}
      </p>
    </div>
  );
}

// ================================================================
// ENGINE STATUS
// ================================================================

function EngineStatus({ data }) {
  const status =
    data?.model_status ||
    data?.engine_status ||
    null;

  const available =
    status?.available !== false;

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-700/70
        bg-slate-950/40
        px-4
        py-3
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-9
            h-9
            rounded-xl
            flex
            items-center
            justify-center
            ${available
              ? "bg-emerald-500/10"
              : "bg-red-500/10"
            }
          `}
        >
          <BrainCircuit
            className={`
              w-5
              h-5
              ${available
                ? "text-emerald-400"
                : "text-red-400"
              }
            `}
          />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            AI Engine
          </p>

          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`
                w-2
                h-2
                rounded-full
                ${available
                  ? "bg-emerald-400"
                  : "bg-red-400"
                }
              `}
            />

            <span
              className={`
                text-sm
                font-bold
                ${available
                  ? "text-emerald-400"
                  : "text-red-400"
                }
              `}
            >
              {available
                ? "Active"
                : "Unavailable"}
            </span>
          </div>
        </div>
      </div>

      {status && (
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
          <div>
            <p className="text-[10px] text-slate-500">
              Model
            </p>

            <p className="text-xs font-semibold text-slate-300 truncate">
              {safeText(
                status.model_file,
                "Random Forest"
              )}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500">
              Features
            </p>

            <p className="text-xs font-semibold text-slate-300">
              {safeText(
                status.feature_count,
                "--"
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// LOADING SKELETON
// ================================================================

function RecommendationSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-4
      "
    >
      {[0, 1, 2, 3, 4, 5].map(
        (index) => (
          <div
            key={index}
            className="
              rounded-2xl
              bg-slate-900/60
              border
              border-slate-800
              p-5
              min-h-[430px]
              animate-pulse
            "
          >
            <div className="flex justify-between">
              <div className="w-2/5 h-4 bg-slate-800 rounded" />
              <div className="w-16 h-4 bg-slate-800 rounded" />
            </div>

            <div className="w-1/3 h-3 bg-slate-800 rounded mt-4" />

            <div className="grid grid-cols-2 gap-2 mt-6">
              <div className="h-20 bg-slate-800 rounded-xl" />
              <div className="h-20 bg-slate-800 rounded-xl" />
            </div>

            <div className="h-3 bg-slate-800 rounded mt-5" />

            <div className="h-2 bg-slate-800 rounded mt-2" />

            <div className="h-20 bg-slate-800 rounded-xl mt-5" />

            <div className="h-16 bg-slate-800 rounded-xl mt-3" />

            <div className="h-8 bg-slate-800 rounded-lg mt-3" />
          </div>
        )
      )}
    </div>
  );
}

// ================================================================
// RISK BAR
// ================================================================

function RiskBar({
  score,
  urgency,
}) {
  const value = Math.min(
    100,
    Math.max(
      0,
      safeNumber(score)
    )
  );

  const cfg =
    URGENCY_CFG[urgency] ||
    URGENCY_CFG.Low;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-slate-400">
          Operational Risk
        </span>

        <span
          className={`
            font-bold
            ${getRiskColor(value)}
          `}
        >
          {value}/100
        </span>
      </div>

      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`
            h-full
            rounded-full
            transition-all
            duration-700
            ${cfg.progress}
          `}
          style={{
            width: `${value}%`,
          }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-600">
          Low
        </span>

        <span
          className={`
            text-[10px]
            font-bold
            ${getRiskColor(value)}
          `}
        >
          {getRiskLabel(value)}
        </span>

        <span className="text-[10px] text-slate-600">
          Critical
        </span>
      </div>
    </div>
  );
}

// ================================================================
// CURRENT VS PREDICTED
// ================================================================

function TrafficComparison({ recommendation }) {
  const current = safeNumber(
    recommendation.current_vehicle_count
  );

  const predicted = safeNumber(
    recommendation.predicted_vehicle_count
  );

  const change = safeNumber(
    recommendation.traffic_change_percentage
  );

  const changeConfig =
    getChangeConfig(change);

  const ChangeIcon =
    changeConfig.icon;

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      <div
        className="
          rounded-xl
          bg-slate-950/60
          border
          border-slate-800
          p-3
        "
      >
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-blue-400" />

          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Current
          </p>
        </div>

        <p className="text-xl font-bold text-white mt-1">
          {formatNumber(current)}
        </p>

        <p className="text-[10px] text-slate-500">
          vehicles
        </p>
      </div>

      <div
        className="
          rounded-xl
          bg-slate-950/60
          border
          border-slate-800
          p-3
        "
      >
        <div className="flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />

          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Predicted
          </p>
        </div>

        <p className="text-xl font-bold text-purple-300 mt-1">
          {formatNumber(predicted)}
        </p>

        <p className="text-[10px] text-slate-500">
          next-hour estimate
        </p>
      </div>

      <div
        className="
          col-span-2
          rounded-xl
          bg-slate-950/40
          border
          border-slate-800
          p-3
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div className="flex items-center gap-2">
          <ChangeIcon
            className={`
              w-5
              h-5
              ${changeConfig.className}
            `}
          />

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Expected Traffic Change
            </p>

            <p
              className={`
                text-lg
                font-bold
                ${changeConfig.className}
              `}
            >
              {formatPercentage(change)}
            </p>
          </div>
        </div>

        <span
          className={`
            text-[10px]
            font-semibold
            px-2
            py-1
            rounded-full
            bg-slate-800
            ${changeConfig.className}
          `}
        >
          {changeConfig.label}
        </span>
      </div>
    </div>
  );
}

// ================================================================
// RECOMMENDATION CARD
// ================================================================

function RecommendationCard({
  recommendation,
}) {
  const urgency =
    safeText(
      recommendation.predicted_urgency,
      "Low"
    );

  const cfg =
    URGENCY_CFG[urgency] ||
    URGENCY_CFG.Low;

  const riskScore =
    safeNumber(
      recommendation.risk_score
    );



  const signal =
    recommendation.signal_optimization;

  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        ${cfg.bg}
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      `}
    >
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />

            <h3 className="text-sm font-bold text-white truncate">
              {safeText(
                recommendation.location,
                "Unknown Junction"
              )}
            </h3>
          </div>

          <p className="text-[10px] text-slate-500 mt-1 ml-6">
            Junction #
            {safeText(
              recommendation.junction_id,
              "--"
            )}
          </p>

          <span
            className={`
              inline-flex
              items-center
              gap-1
              mt-2
              text-[10px]
              font-bold
              px-2
              py-1
              rounded-full
              text-white
              ${cfg.badge}
            `}
          >
            <CircleDot className="w-3 h-3" />

            {urgency}

            {" "}
            Priority
          </span>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-slate-500">
            RF Prediction
          </p>

          <p className="text-xl font-bold text-purple-300">
            {formatNumber(
              recommendation.predicted_vehicle_count
            )}
          </p>

          <p className="text-[10px] text-slate-500">
            vehicles
          </p>
        </div>
      </div>

      {/* CURRENT VS PREDICTED */}

      <TrafficComparison
        recommendation={recommendation}
      />

      {/* RISK */}

      <RiskBar
        score={riskScore}
        urgency={urgency}
      />

      {/* AI RECOMMENDATION */}

      <div
        className="
          bg-slate-950/60
          rounded-xl
          p-3.5
          mt-4
          border
          border-slate-800
        "
      >
        <p
          className="
            text-xs
            font-semibold
            text-purple-400
            mb-1.5
            flex
            items-center
            gap-1.5
          "
        >
          <Zap className="w-3.5 h-3.5" />

          AI Recommendation
        </p>

        <p className="text-xs text-slate-300 leading-relaxed">
          {safeText(
            recommendation.ai_recommendation,
            "No AI recommendation available."
          )}
        </p>
      </div>

      {/* RECOMMENDED ACTION */}

      <div
        className="
          mt-3
          rounded-xl
          bg-blue-500/10
          border
          border-blue-500/20
          p-3
        "
      >
        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />

          <p
            className="
              text-[10px]
              uppercase
              tracking-wider
              font-bold
              text-blue-400
            "
          >
            Recommended Action
          </p>
        </div>

        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          {safeText(
            recommendation.recommended_action,
            "Continue monitoring traffic conditions."
          )}
        </p>
      </div>

      {/* SIGNAL */}

      {signal && (
        <div
          className="
            grid
            grid-cols-3
            gap-2
            mt-3
          "
        >
          <div className="rounded-lg bg-slate-950/40 p-2.5 text-center">
            <p className="text-[9px] uppercase text-slate-500">
              Green
            </p>

            <p className="text-sm font-bold text-emerald-400 mt-1">
              {safeNumber(
                signal.green_time
              )}
              s
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/40 p-2.5 text-center">
            <p className="text-[9px] uppercase text-slate-500">
              Red
            </p>

            <p className="text-sm font-bold text-red-400 mt-1">
              {safeNumber(
                signal.red_time
              )}
              s
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/40 p-2.5 text-center">
            <p className="text-[9px] uppercase text-slate-500">
              Cycle
            </p>

            <p className="text-sm font-bold text-slate-300 mt-1">
              {safeNumber(
                signal.cycle_length
              )}
              s
            </p>
          </div>
        </div>
      )}

      {/* ROUTE ADVISORY */}

      <div
        className="
          flex
          gap-2
          items-start
          mt-3
          rounded-lg
          bg-slate-800/40
          p-2.5
        "
      >
        <Route
          className="
            w-4
            h-4
            text-blue-400
            mt-0.5
            flex-shrink-0
          "
        />

        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
            Route Advisory
          </p>

          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            {safeText(
              recommendation.rerouting_advisory,
              "No rerouting required."
            )}
          </p>
        </div>
      </div>

      {/* POLICE */}

      {recommendation.deploy_police && (
        <div
          className="
            flex
            items-center
            gap-2
            mt-3
            text-xs
            text-red-400
            font-bold
            bg-red-500/10
            rounded-lg
            p-2.5
            border
            border-red-500/30
          "
        >
          <UserCheck className="w-4 h-4" />

          Police Deployment Advisory Active
        </div>
      )}

      {/* FOOTER */}

      <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/70">
        <span className="text-[10px] text-slate-500">
          Priority
        </span>

        <span
          className={`
            text-[10px]
            font-bold
            ${cfg.text}
          `}
        >
          {safeText(
            recommendation.priority,
            "Normal"
          )}
        </span>
      </div>
    </div>
  );
}

// ================================================================
// POLICE SUMMARY
// ================================================================

function PoliceDeploymentPanel({ police }) {
  if (!police) {
    return null;
  }

  const needed =
    safeNumber(
      police.junctions_needing_police
    );

  const immediate =
    Array.isArray(
      police.deploy_immediately
    )
      ? police.deploy_immediately
      : [];

  const standby =
    Array.isArray(
      police.deploy_standby
    )
      ? police.deploy_standby
      : [];

  return (
    <div
      className="
        rounded-2xl
        bg-slate-900/70
        border
        border-slate-800
        overflow-hidden
      "
    >
      <div
        className="
          p-4
          border-b
          border-slate-800
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
        "
      >
        <div className="flex items-center gap-2">
          <Siren className="w-4 h-4 text-red-400" />

          <div>
            <h3 className="text-sm font-bold text-white">
              Police Deployment Intelligence
            </h3>

            <p className="text-[10px] text-slate-500 mt-0.5">
              AI-generated operational advisory
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            px-3
            py-1.5
            rounded-lg
            bg-red-500/10
            border
            border-red-500/20
          "
        >
          <UserCheck className="w-3.5 h-3.5 text-red-400" />

          <span className="text-xs font-bold text-red-400">
            {needed} junction{needed === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500" />

            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Immediate
            </p>
          </div>

          {immediate.length === 0 ? (
            <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-4">
              <p className="text-xs text-slate-500">
                No immediate deployment required.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {immediate.map(
                (item) => (
                  <div
                    key={`${item.junction_id}-${item.location}`}
                    className="
                      rounded-xl
                      bg-red-500/5
                      border
                      border-red-500/20
                      p-3
                    "
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-white">
                        {safeText(
                          item.location,
                          "Unknown"
                        )}
                      </p>

                      <span className="text-xs font-bold text-red-400">
                        {safeNumber(
                          item.risk_score
                        )}
                        /100
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 mt-1">
                      Predicted{" "}
                      {formatNumber(
                        item.predicted_vehicle_count
                      )}{" "}
                      vehicles
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-orange-500" />

            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Standby
            </p>
          </div>

          {standby.length === 0 ? (
            <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-4">
              <p className="text-xs text-slate-500">
                No standby deployment required.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {standby.map(
                (item) => (
                  <div
                    key={`${item.junction_id}-${item.location}`}
                    className="
                      rounded-xl
                      bg-orange-500/5
                      border
                      border-orange-500/20
                      p-3
                    "
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-white">
                        {safeText(
                          item.location,
                          "Unknown"
                        )}
                      </p>

                      <span className="text-xs font-bold text-orange-400">
                        {safeNumber(
                          item.risk_score
                        )}
                        /100
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 mt-1">
                      Predicted{" "}
                      {formatNumber(
                        item.predicted_vehicle_count
                      )}{" "}
                      vehicles
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// SIGNAL TABLE
// ================================================================

function SignalOptimizationTable({
  signals,
}) {
  if (
    !Array.isArray(signals) ||
    signals.length === 0
  ) {
    return null;
  }

  return (
    <div
      className="
        rounded-2xl
        bg-slate-900/70
        border
        border-slate-800
        overflow-hidden
      "
    >
      <div
        className="
          p-4
          border-b
          border-slate-800
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-400" />

          <div>
            <h3 className="text-sm font-bold text-white">
              Traffic Signal Optimization
            </h3>

            <p className="text-[10px] text-slate-500 mt-0.5">
              Recommended timing based on predicted traffic volume
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          {signals.length} Junction
          {signals.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="
                border-b
                border-slate-800
                text-[10px]
                uppercase
                tracking-wider
                font-semibold
                text-slate-500
              "
            >
              <th className="px-4 py-3 text-left">
                Location
              </th>

              <th className="px-4 py-3 text-left">
                Volume
              </th>

              <th className="px-4 py-3 text-left">
                Congestion
              </th>

              <th className="px-4 py-3 text-left">
                Green
              </th>

              <th className="px-4 py-3 text-left">
                Red
              </th>

              <th className="px-4 py-3 text-left">
                Cycle
              </th>

              <th className="px-4 py-3 text-left">
                Strategy
              </th>
            </tr>
          </thead>

          <tbody>
            {signals.map(
              (signal) => (
                <tr
                  key={`${signal.junction_id}-${signal.location}`}
                  className="
                    border-b
                    border-slate-800/50
                    hover:bg-slate-800/30
                    transition
                  "
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />

                      <span className="font-semibold text-white">
                        {safeText(
                          signal.location,
                          "Unknown"
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-bold text-purple-300">
                    {formatNumber(
                      signal.predicted_volume
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-300">
                      {safeText(
                        signal.congestion_level,
                        "Low"
                      )}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-bold text-emerald-400">
                    {safeNumber(
                      signal.recommended_green_time_sec
                    )}
                    s
                  </td>

                  <td className="px-4 py-3 font-bold text-red-400">
                    {safeNumber(
                      signal.recommended_red_time_sec
                    )}
                    s
                  </td>

                  <td className="px-4 py-3 text-slate-300">
                    {safeNumber(
                      signal.cycle_length_sec
                    )}
                    s
                  </td>

                  <td className="px-4 py-3 text-xs text-slate-400 max-w-xs">
                    {safeText(
                      signal.strategy,
                      "Adaptive"
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

export default function Recommendations() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("all");

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadData = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        /*
         * IMPORTANT
         *
         * This page intentionally makes ONE request.
         *
         * We do NOT call:
         *
         * /recommendations/
         * /signal-optimization
         * /police-deployment
         * /hourly-forecast
         *
         * during initial loading.
         */

        const response =
          await api.get(
            "/recommendations/dashboard",
            {
              timeout: 15000,
            }
          );

        const responseData =
          response?.data;

        if (
          !responseData ||
          typeof responseData !== "object"
        ) {
          throw new Error(
            "Invalid AI recommendation response."
          );
        }

        setData(responseData);
      } catch (err) {
        console.error(
          "AI Recommendations loading error:",
          err
        );

        if (
          err?.code ===
          "ECONNABORTED"
        ) {
          setError(
            "AI recommendation request timed out. Please retry."
          );
        } else if (
          err?.response?.status === 404
        ) {
          setError(
            "AI recommendation endpoint was not found."
          );
        } else {
          setError(
            err?.response?.data?.detail ||
            err?.message ||
            "Unable to load AI recommendations."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // NORMALIZED DATA
  // ============================================================

  const recommendations =
    useMemo(() => {
      if (
        !Array.isArray(
          data?.recommendations
        )
      ) {
        return [];
      }

      return data.recommendations;
    }, [data]);

  const signals =
    useMemo(() => {
      if (
        !Array.isArray(
          data?.signal_optimizations
        )
      ) {
        return [];
      }

      return data.signal_optimizations;
    }, [data]);

  const police =
    data?.police || null;

  // ============================================================
  // FILTER
  // ============================================================

  const filteredRecommendations =
    useMemo(() => {
      if (
        activeTab ===
        "critical"
      ) {
        return recommendations.filter(
          (item) =>
            item?.predicted_urgency ===
            "Critical"
        );
      }

      if (
        activeTab ===
        "high"
      ) {
        return recommendations.filter(
          (item) =>
            item?.predicted_urgency ===
            "High"
        );
      }

      if (
        activeTab ===
        "police"
      ) {
        return recommendations.filter(
          (item) =>
            Boolean(
              item?.deploy_police
            )
        );
      }

      return recommendations;
    }, [
      activeTab,
      recommendations,
    ]);

  // ============================================================
  // TOP RISK
  // ============================================================

  const highestRisk =
    useMemo(() => {
      if (
        recommendations.length ===
        0
      ) {
        return null;
      }

      return [...recommendations].sort(
        (a, b) =>
          safeNumber(
            b?.risk_score
          ) -
          safeNumber(
            a?.risk_score
          )
      )[0];
    }, [recommendations]);

  // ============================================================
  // GENERATED TIME
  // ============================================================

  const generatedAt =
    data?.generated_at || null;

  const freshness =
    getRelativeFreshness(
      generatedAt
    );

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            rounded-3xl
            p-6
            lg:p-7
            bg-gradient-to-r
            from-purple-950
            via-slate-950
            to-blue-950
            border
            border-slate-700/70
            shadow-2xl
          "
        >
          <div
            className="
              flex
              flex-col
              xl:flex-row
              xl:items-center
              justify-between
              gap-6
            "
          >
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-11
                    h-11
                    rounded-2xl
                    bg-purple-500/10
                    border
                    border-purple-500/20
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Cpu className="w-6 h-6 text-purple-400" />
                </div>

                <div>
                  <h1
                    className="
                      text-2xl
                      lg:text-3xl
                      font-extrabold
                      text-white
                    "
                  >
                    AI Traffic Recommendations
                  </h1>

                  <p className="text-xs lg:text-sm text-slate-400 mt-1">
                    Predictive traffic intelligence and operational
                    decision support.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-5">
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-2.5
                    py-1
                    rounded-full
                    bg-purple-500/10
                    border
                    border-purple-500/20
                    text-[10px]
                    font-semibold
                    text-purple-300
                  "
                >
                  <BrainCircuit className="w-3 h-3" />
                  Random Forest
                </span>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-2.5
                    py-1
                    rounded-full
                    bg-blue-500/10
                    border
                    border-blue-500/20
                    text-[10px]
                    font-semibold
                    text-blue-300
                  "
                >
                  <Clock className="w-3 h-3" />
                  Next-Hour Prediction
                </span>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-2.5
                    py-1
                    rounded-full
                    bg-emerald-500/10
                    border
                    border-emerald-500/20
                    text-[10px]
                    font-semibold
                    text-emerald-300
                  "
                >
                  <ShieldAlert className="w-3 h-3" />
                  Decision Support
                </span>
              </div>
            </div>

            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-stretch
                sm:items-center
                gap-3
              "
            >
              <EngineStatus data={data} />

              <button
                onClick={loadData}
                disabled={loading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  rounded-xl
                  text-sm
                  font-semibold
                  bg-slate-800
                  text-slate-200
                  border
                  border-slate-700
                  hover:bg-slate-700
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  transition
                "
              >
                <RefreshCw
                  className={`
                    w-4
                    h-4
                    ${loading
                      ? "animate-spin"
                      : ""
                    }
                  `}
                />

                {loading
                  ? "Analyzing..."
                  : "Refresh Engine"}
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              rounded-xl
              bg-red-500/10
              border
              border-red-500/30
              p-4
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />

              <span className="text-sm text-red-400">
                {error}
              </span>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="
                text-sm
                text-red-300
                underline
                font-semibold
                disabled:opacity-50
              "
            >
              Retry
            </button>
          </div>
        )}

        {/* ====================================================
            KPI CARDS
        ==================================================== */}

        {data && (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-6
              gap-4
            "
          >
            <KpiCard
              title="Prediction Window"
              value={safeText(
                data.prediction_hour,
                "--"
              )}
              subtitle="Next-hour analysis"
              icon={Clock}
              iconClass="text-purple-400"
              bgClass="
                bg-purple-500/10
                border-purple-500/30
              "
            />

            <KpiCard
              title="Critical"
              value={safeNumber(
                data.critical_count
              )}
              subtitle="Immediate intervention"
              icon={AlertTriangle}
              iconClass="text-red-400"
              bgClass="
                bg-red-500/10
                border-red-500/30
              "
            />

            <KpiCard
              title="High Risk"
              value={safeNumber(
                data.high_count
              )}
              subtitle="Requires monitoring"
              icon={ShieldAlert}
              iconClass="text-orange-400"
              bgClass="
                bg-orange-500/10
                border-orange-500/30
              "
            />

            <KpiCard
              title="Police"
              value={safeNumber(
                police?.junctions_needing_police
              )}
              subtitle="Deployment required"
              icon={UserCheck}
              iconClass="text-orange-400"
              bgClass="
                bg-orange-500/10
                border-orange-500/30
              "
            />

            <KpiCard
              title="Avg Predicted"
              value={formatNumber(
                data.average_predicted_volume
              )}
              subtitle="Vehicles / junction"
              icon={Activity}
              iconClass="text-blue-400"
              bgClass="
                bg-blue-500/10
                border-blue-500/30
              "
            />

            <KpiCard
              title="Max Risk"
              value={`${safeNumber(
                data.highest_risk_score
              )}/100`}
              subtitle="Highest operational risk"
              icon={Gauge}
              iconClass="text-yellow-400"
              bgClass="
                bg-yellow-500/10
                border-yellow-500/30
              "
            />
          </div>
        )}

        {/* ====================================================
            TOP RISK
        ==================================================== */}

        {highestRisk && (
          <div
            className="
              rounded-2xl
              border
              border-red-500/30
              bg-gradient-to-r
              from-red-500/10
              via-slate-900/70
              to-orange-500/5
              p-5
            "
          >
            <div
              className="
                flex
                flex-col
                xl:flex-row
                xl:items-center
                justify-between
                gap-5
              "
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-red-500/10
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-widest
                      font-bold
                      text-red-400
                    "
                  >
                    Highest Risk Junction
                  </p>
                </div>

                <h2
                  className="
                    text-xl
                    lg:text-2xl
                    font-bold
                    text-white
                    mt-3
                  "
                >
                  {safeText(
                    highestRisk.location,
                    "Unknown Junction"
                  )}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Next prediction:{" "}
                  {safeText(
                    highestRisk.prediction_hour,
                    data?.prediction_hour || "--"
                  )}
                </p>

                <p
                  className="
                    text-sm
                    text-slate-300
                    mt-3
                    max-w-3xl
                    leading-relaxed
                  "
                >
                  {safeText(
                    highestRisk.recommended_action,
                    "Immediate traffic assessment recommended."
                  )}
                </p>
              </div>

              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-4
                  xl:grid-cols-4
                  gap-2
                  flex-shrink-0
                "
              >
                <div className="rounded-xl bg-slate-950/70 px-4 py-3">
                  <p className="text-[10px] text-slate-500">
                    Current
                  </p>

                  <p className="text-lg font-bold text-white mt-1">
                    {formatNumber(
                      highestRisk.current_vehicle_count
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950/70 px-4 py-3">
                  <p className="text-[10px] text-slate-500">
                    Predicted
                  </p>

                  <p className="text-lg font-bold text-purple-300 mt-1">
                    {formatNumber(
                      highestRisk.predicted_vehicle_count
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950/70 px-4 py-3">
                  <p className="text-[10px] text-slate-500">
                    Change
                  </p>

                  <p
                    className={`
                      text-lg
                      font-bold
                      mt-1
                      ${safeNumber(
                      highestRisk.traffic_change_percentage
                    ) > 0
                        ? "text-red-400"
                        : "text-green-400"
                      }
                    `}
                  >
                    {formatPercentage(
                      highestRisk.traffic_change_percentage
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950/70 px-4 py-3">
                  <p className="text-[10px] text-slate-500">
                    Risk
                  </p>

                  <p
                    className={`
                      text-lg
                      font-bold
                      mt-1
                      ${getRiskColor(
                      highestRisk.risk_score
                    )}
                    `}
                  >
                    {safeNumber(
                      highestRisk.risk_score
                    )}
                    /100
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            FILTERS
        ==================================================== */}

        {data && (
          <div
            className="
              rounded-2xl
              bg-slate-900/60
              border
              border-slate-800
              p-4
              flex
              flex-wrap
              gap-2
              items-center
            "
          >
            <span
              className="
                text-[10px]
                font-semibold
                text-slate-500
                uppercase
                tracking-wider
                mr-1
              "
            >
              View:
            </span>

            {[
              {
                id: "all",
                label: `All (${recommendations.length})`,
              },
              {
                id: "critical",
                label: `Critical (${safeNumber(
                  data.critical_count
                )})`,
              },
              {
                id: "high",
                label: `High (${safeNumber(
                  data.high_count
                )})`,
              },
              {
                id: "police",
                label: `Police (${safeNumber(
                  police?.junctions_needing_police
                )})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`
                  px-3
                  py-1.5
                  rounded-lg
                  text-xs
                  font-semibold
                  transition
                  ${activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ====================================================
            RECOMMENDATIONS
        ==================================================== */}

        {loading ? (
          <RecommendationSkeleton />
        ) : filteredRecommendations.length ===
          0 ? (
          <div
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/60
              p-10
              text-center
            "
          >
            <CheckCircle
              className="
                w-10
                h-10
                text-green-400
                mx-auto
              "
            />

            <p
              className="
                text-white
                font-semibold
                mt-3
              "
            >
              No locations match this filter.
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Try another risk category.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-4
            "
          >
            {filteredRecommendations.map(
              (recommendation) => (
                <RecommendationCard
                  key={`${recommendation.junction_id}-${recommendation.location}`}
                  recommendation={
                    recommendation
                  }
                />
              )
            )}
          </div>
        )}

        {/* ====================================================
            POLICE INTELLIGENCE
        ==================================================== */}

        {!loading && (
          <PoliceDeploymentPanel
            police={police}
          />
        )}

        {/* ====================================================
            SIGNAL OPTIMIZATION
        ==================================================== */}

        {!loading && (
          <SignalOptimizationTable
            signals={signals}
          />
        )}

        {/* ====================================================
            ENGINE FOOTER
        ==================================================== */}

        {data && (
          <div
            className="
              rounded-xl
              border
              border-slate-800
              bg-slate-950/40
              px-4
              py-3
              flex
              flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-3
            "
          >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Timer className="w-3.5 h-3.5" />

                Generated:
                {" "}
                {formatGeneratedAt(
                  generatedAt
                )}
              </span>

              <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Activity className="w-3.5 h-3.5" />

                Freshness:
                {" "}
                <span className="text-slate-400">
                  {freshness}
                </span>
              </span>

              <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <MapPin className="w-3.5 h-3.5" />

                Locations:
                {" "}
                {safeNumber(
                  data.total_locations
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />

              <span className="text-[10px] font-semibold text-emerald-400">
                AI decision engine ready
              </span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}