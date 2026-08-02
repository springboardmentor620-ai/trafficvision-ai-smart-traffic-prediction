function SummaryCard({ title, value, color }) {

    return (

        <div

            style={{

                background: color,

                color: "white",

                padding: "25px",

                borderRadius: "15px",

                textAlign: "center",

                boxShadow: "0 10px 25px rgba(0,0,0,.15)"

            }}

        >

            <h3>{title}</h3>

            <h1>{value}</h1>

        </div>

    );

}

export default SummaryCard;