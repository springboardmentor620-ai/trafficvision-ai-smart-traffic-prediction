import { useEffect, useState } from "react";

import { getAIInsights } from "../../services/analytics";

function AIInsights() {

    const [insights, setInsights] = useState([]);

    useEffect(() => {

        let mounted = true;

        const loadInsights = async () => {

            try {

                const data = await getAIInsights();

                if (!mounted) return;

                setInsights(data);

            }

            catch (err) {

                console.error(err);

            }

        };

        loadInsights();

        const timer = setInterval(loadInsights, 5000);

        return () => {

            mounted = false;

            clearInterval(timer);

        };

    }, []);

    return (

        <div
            style={{
                background:"#fff",
                borderRadius:"12px",
                padding:"25px",
                boxShadow:"0 3px 12px rgba(0,0,0,.08)"
            }}
        >

            <h2>AI Insights</h2>

            <ul
                style={{
                    marginTop:"20px",
                    lineHeight:"2"
                }}
            >

                {insights.map((item,index)=>(

                    <li key={index}>
                        🤖 {item}
                    </li>

                ))}

            </ul>

        </div>

    );

}

export default AIInsights;