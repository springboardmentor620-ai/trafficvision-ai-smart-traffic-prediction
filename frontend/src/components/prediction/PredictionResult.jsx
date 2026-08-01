function PredictionResult({ result }) {

    if (!result) {

        return (

            <div className="bg-white rounded-2xl shadow-lg p-8">

                <h2 className="text-2xl font-bold">

                    Prediction Result

                </h2>

                <p className="mt-8 text-gray-500">

                    Make a prediction to view the results.

                </p>

            </div>

        );

    }

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8">

            <h2 className="text-2xl font-bold mb-8">

                Prediction Result

            </h2>

            <div className="space-y-5">

                <div>

                    <strong>Predicted Severity</strong>

                    <p>{result.predicted_severity}</p>

                </div>

                <div>

                    <strong>Risk Score</strong>

                    <p>{result.predicted_risk_score}</p>

                </div>

                <div>

                    <strong>Traffic Alert</strong>

                    <p>{result.traffic_alert}</p>

                </div>

                <div>

                    <strong>Emergency Level</strong>

                    <p>{result.emergency_level}</p>

                </div>

                <div>

                    <strong>Recommendation</strong>

                    <p>{result.recommendation}</p>

                </div>

            </div>

        </div>

    );

}

export default PredictionResult;