    
function Loader() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f5f7fb",
                flexDirection: "column"
            }}
        >
            <div
                style={{
                    width: "70px",
                    height: "70px",
                    border: "8px solid #dbeafe",
                    borderTop: "8px solid #2563eb",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }}
            />

            <h2
                style={{
                    marginTop: "25px",
                    color: "#1e3a8a"
                }}
            >
                Loading Dashboard...
            </h2>

            <style>
                {`
                @keyframes spin{
                    0%{transform:rotate(0deg);}
                    100%{transform:rotate(360deg);}
                }
                `}
            </style>
        </div>
    );
}

export default Loader;