import { useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import PredictionForm from "../../components/prediction/PredictionForm";
import PredictionResult from "../../components/prediction/PredictionResult";
import RiskGauge from "../../components/prediction/RiskGauge";
import RecommendationCard from "../../components/prediction/RecommendationCard";

import PredictionService from "../../services/predictionService";

function Prediction() {

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    async function handlePrediction(formData) {

        try {

            setLoading(true);

            setError("");

            const response = await PredictionService.predict(formData);

            setResult(response);

        }

        catch (err) {

            console.error(err);

            setError("Prediction failed.");

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <DashboardLayout>

            <div className="mb-8">

                <h1 className="text-4xl font-bold">

                    AI Accident Prediction

                </h1>

                <p className="text-gray-500 mt-2">

                    Predict accident severity and traffic risk using Artificial Intelligence.

                </p>

            </div>

            {

                error && (

                    <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">

                        {error}

                    </div>

                )

            }

            <div className="grid xl:grid-cols-2 gap-8">

                <PredictionForm

                    onPredict={handlePrediction}

                />

                <PredictionResult

                    result={result}

                />

            </div>

            {

                loading && (

                    <div className="mt-8 text-center font-semibold">

                        Predicting...

                    </div>

                )

            }

            {

                result && (

                    <div className="grid lg:grid-cols-2 gap-8 mt-8">

                        <RiskGauge

                            riskScore={result.predicted_risk_score}

                        />

                        <RecommendationCard

                            recommendation={result.recommendation}

                        />

                    </div>

                )

            }

        </DashboardLayout>

    );

}

export default Prediction;