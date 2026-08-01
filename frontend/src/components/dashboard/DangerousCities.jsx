function DangerousCities({ data }) {

    if (!data || data.length === 0) {

        return (

            <div className="bg-white rounded-2xl shadow-lg p-6">

                <h2 className="text-2xl font-bold mb-6">

                    Dangerous Cities

                </h2>

                <p>No Data Available</p>

            </div>

        );

    }

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Top Dangerous Cities

            </h2>

            <table className="w-full">

                <thead>

                    <tr className="border-b">

                        <th className="text-left py-3">

                            City

                        </th>

                        <th className="text-left py-3">

                            Accidents

                        </th>

                        <th className="text-left py-3">

                            Avg Risk

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {

                        data.map((city, index) => (

                            <tr

                                key={index}

                                className="border-b hover:bg-slate-50"

                            >

                                <td className="py-3">

                                    {city.city}

                                </td>

                                <td>

                                    {city.total_accidents}

                                </td>

                                <td>

                                    {city.average_risk_score}

                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default DangerousCities;