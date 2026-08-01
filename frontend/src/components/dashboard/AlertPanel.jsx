const alerts = [

    "Heavy congestion detected on NH-46",

    "High accident probability in Bhopal",

    "Rain may increase accident risk",

    "Traffic alert generated for Indore"

];

function AlertPanel() {

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Live Alerts

            </h2>

            <div className="space-y-4">

                {

                    alerts.map((alert, index) => (

                        <div

                            key={index}

                            className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg"

                        >

                            {alert}

                        </div>

                    ))

                }

            </div>

        </div>

    );

}

export default AlertPanel;