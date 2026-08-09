import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";

function PredictionResult({

    result,

    routeData

}) {

    const navigate = useNavigate();

    if (!result) return null;

    return (

        <div className="card mt-8">

            <h2 className="text-2xl font-bold mb-6">

                Prediction Result

            </h2>

            <div className="grid md:grid-cols-2 gap-6">

                <div>

                    <p>

                        <strong>

                            Severity

                        </strong>

                    </p>

                    <p>

                        {

                            result.predicted_severity

                        }

                    </p>

                </div>

                <div>

                    <p>

                        <strong>

                            Risk Score

                        </strong>

                    </p>

                    <p>

                        {

                            result.predicted_risk_score

                        }

                    </p>

                </div>

                <div>

                    <p>

                        <strong>

                            Alert

                        </strong>

                    </p>

                    <p>

                        {

                            result.traffic_alert

                        }

                    </p>

                </div>

                <div>

                    <p>

                        <strong>

                            Recommendation

                        </strong>

                    </p>

                    <p>

                        {

                            result.recommendation

                        }

                    </p>

                </div>

            </div>

            <div className="mt-8">

                <Button

                    onClick={() =>

                        navigate(

                            "/maps",

                            {

                                state: routeData

                            }

                        )

                    }

                >

                    Find Best Route

                </Button>

            </div>

        </div>

    );

}

export default PredictionResult; 