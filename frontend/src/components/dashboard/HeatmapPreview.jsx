function HeatmapPreview({

    data

}) {

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Heatmap Preview

            </h2>

            <div className="overflow-auto max-h-[320px]">

                <table className="w-full">

                    <thead>

                        <tr className="border-b">

                            <th className="text-left py-3">

                                City

                            </th>

                            <th className="text-left py-3">

                                State

                            </th>

                            <th className="text-left py-3">

                                Risk

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            data.map((row, index) => (

                                <tr

                                    key={index}

                                    className="border-b"

                                >

                                    <td className="py-3">

                                        {row.city}

                                    </td>

                                    <td>

                                        {row.state}

                                    </td>

                                    <td>

                                        {row.risk_score}

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default HeatmapPreview;