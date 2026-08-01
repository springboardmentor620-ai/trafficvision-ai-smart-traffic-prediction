import { useEffect, useState } from "react";

import PredictionHistoryService from "../../services/predictionHistoryService";

function RecentPredictions() {

    const [history, setHistory] = useState([]);

    useEffect(() => {

        async function loadHistory() {

            try {

                const response = await PredictionHistoryService.getHistory();

                setHistory(response.data);

            }

            catch (error) {

                console.error(error);

            }

        }

        loadHistory();

    }, []);

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Recent Predictions

            </h2>

            {

                history.length === 0 ?

                (

                    <div className="text-center text-gray-500 py-12">

                        No Prediction History Found

                    </div>

                )

                :

                (

                    <table className="w-full">

                        <thead>

                            <tr className="border-b">

                                <th className="text-left py-3">

                                    City

                                </th>

                                <th className="text-left py-3">

                                    Severity

                                </th>

                                <th className="text-left py-3">

                                    Risk

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                history.map((item) => (

                                    <tr

                                        key={item.id}

                                        className="border-b"

                                    >

                                        <td className="py-3">

                                            {item.city}

                                        </td>

                                        <td>

                                            {item.predicted_severity}

                                        </td>

                                        <td>

                                            {item.predicted_risk_score}

                                        </td>

                                    </tr>

                                ))

                            }

                        </tbody>

                    </table>

                )

            }

        </div>

    );

}

export default RecentPredictions;