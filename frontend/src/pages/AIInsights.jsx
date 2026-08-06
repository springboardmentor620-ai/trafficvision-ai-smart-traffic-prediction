import { useEffect, useState } from "react";
import {
  MdAccessTime,
  MdAutoAwesome,
  MdCloud,
  MdDirections,
  MdHealthAndSafety,
  MdSchedule,
  MdTraffic,
} from "react-icons/md";

import { getAiRecommendations } from "../services/trafficService";
import "../styles/AIInsights.css";

const insightIcons = {
  "traffic-prediction": MdTraffic,
  "delay-prediction": MdSchedule,
  "best-departure-time": MdAccessTime,
  "suggested-route": MdDirections,
  "risk-score": MdHealthAndSafety,
  "weather-recommendation": MdCloud,
  "travel-advice": MdAutoAwesome,
};

function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [methodology, setMethodology] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadInsights() {
      try {
        const data = await getAiRecommendations();
        if (active) {
          setInsights(Array.isArray(data.recommendations) ? data.recommendations : []);
          setMethodology(data.methodology ?? "");
        }
      } catch (requestError) {
        console.error("Unable to load AI insights:", requestError);
        if (active) setError("AI recommendations are temporarily unavailable.");
      }
    }

    loadInsights();
    return () => { active = false; };
  }, []);

  if (error) return <div className="ai-insights-state ai-insights-state--error">{error}</div>;
  if (!insights.length) return <div className="ai-insights-state">Generating rule-based travel insights...</div>;

  return (
    <main className="ai-insights-page" aria-labelledby="ai-insights-title">
      <header className="ai-insights-page__header">
        <div>
          <p className="ai-insights-page__eyebrow"><MdAutoAwesome /> Explainable intelligence</p>
          <h1 id="ai-insights-title">AI Travel Insights</h1>
          <p>Practical travel guidance generated from current traffic patterns and dataset signals.</p>
        </div>
        <div className="ai-insights-page__engine"><i /> Rule-based engine</div>
      </header>

      <section className="ai-insights-method" aria-label="Recommendation methodology">
        <MdAutoAwesome /><p>{methodology}</p>
      </section>

      <section className="ai-insights-grid" aria-label="AI travel recommendations">
        {insights.map((insight) => {
          const Icon = insightIcons[insight.id] ?? MdAutoAwesome;
          const priority = insight.priority.toLowerCase();
          return (
            <article className={`ai-insight-card ai-insight-card--${priority}`} key={insight.id}>
              <div className="ai-insight-card__heading">
                <span className="ai-insight-card__icon"><Icon /></span>
                <span className={`ai-insight-card__priority ai-insight-card__priority--${priority}`}>{insight.priority} priority</span>
              </div>
              <p className="ai-insight-card__label">{insight.title}</p>
              <h2>{insight.value}</h2>
              <p className="ai-insight-card__metric">{insight.metric}</p>
              <div className="ai-insight-card__advice"><strong>Recommendation</strong><span>{insight.recommendation}</span></div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default AIInsights;

