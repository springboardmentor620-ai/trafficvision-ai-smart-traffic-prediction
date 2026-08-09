import {
    FaTrafficLight,
    FaRoute,
    FaShieldAlt,
    FaMapMarkedAlt,
    FaChartLine
} from "react-icons/fa";

function AuthBranding() {

    const trafficData = [
        42,
        58,
        48,
        76,
        61,
        82,
        68,
        88,
        72,
        94
    ];

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct"
    ];

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                minHeight: "700px",
                overflow: "hidden",
                background: "#061536",
                color: "#ffffff"
            }}
        >

            {/* =====================================================
                BACKGROUND DECORATION
            ====================================================== */}

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    overflow: "hidden"
                }}
            >

                <div
                    style={{
                        position: "absolute",
                        width: "680px",
                        height: "680px",
                        right: "-300px",
                        top: "-180px",
                        borderRadius: "50%",
                        border: "1px solid rgba(96,165,250,0.07)"
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        width: "620px",
                        height: "620px",
                        right: "-250px",
                        top: "80px",
                        borderRadius: "50%",
                        border: "1px solid rgba(96,165,250,0.05)"
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        width: "1px",
                        height: "150%",
                        left: "35%",
                        top: "-25%",
                        transform: "rotate(28deg)",
                        background: "rgba(96,165,250,0.06)"
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        width: "1px",
                        height: "150%",
                        left: "75%",
                        top: "-25%",
                        transform: "rotate(28deg)",
                        background: "rgba(96,165,250,0.04)"
                    }}
                />

            </div>


            {/* =====================================================
                MAIN CONTENT

                THIS IS THE IMPORTANT PART.
                Everything is vertically centered.
            ====================================================== */}

            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    width: "100%",
                    height: "100%",
                    padding: "34px 58px 38px",
                    display: "flex",
                    flexDirection: "column"
                }}
            >

                {/* =================================================
                    LOGO
                ================================================== */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        flexShrink: 0
                    }}
                >

                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "#1769ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 10px 30px rgba(23,105,255,0.22)"
                        }}
                    >

                        <FaTrafficLight size={23} />

                    </div>


                    <div>

                        <div
                            style={{
                                fontSize: "20px",
                                lineHeight: "1.1",
                                fontWeight: 700,
                                letterSpacing: "-0.3px"
                            }}
                        >
                            TrafficVision
                        </div>

                        <div
                            style={{
                                marginTop: "4px",
                                fontSize: "12px",
                                color: "rgba(147,197,253,0.7)"
                            }}
                        >
                            AI Traffic Intelligence
                        </div>

                    </div>

                </div>


                {/* =================================================
                    CENTER CONTENT

                    Instead of mt-auto, this entire block is
                    centered vertically.
                ================================================== */}

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        paddingBottom: "20px"
                    }}
                >

                    <div
                        style={{
                            width: "100%",
                            maxWidth: "760px",
                            margin: "0 auto"
                        }}
                    >

                        {/* PLATFORM BADGE */}

                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "7px 13px",
                                borderRadius: "999px",
                                border: "1px solid rgba(96,165,250,0.18)",
                                background: "rgba(59,130,246,0.06)",
                                color: "#bfdbfe",
                                fontSize: "12px"
                            }}
                        >

                            <span
                                style={{
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    background: "#10b981"
                                }}
                            />

                            Traffic Intelligence Platform

                        </div>


                        {/* HERO HEADING */}

                        <h1
                            style={{
                                margin: "20px 0 0",
                                fontSize: "clamp(42px, 4vw, 58px)",
                                lineHeight: "1.06",
                                letterSpacing: "-2px",
                                fontWeight: 750,
                                color: "#ffffff"
                            }}
                        >

                            Smarter roads.

                            <br />

                            <span
                                style={{
                                    color: "#3182ff"
                                }}
                            >
                                Safer journeys.
                            </span>

                        </h1>


                        {/* DESCRIPTION */}

                        <p
                            style={{
                                margin: "18px 0 0",
                                maxWidth: "650px",
                                fontSize: "16px",
                                lineHeight: "1.75",
                                color: "rgba(191,219,254,0.65)"
                            }}
                        >
                            Monitor traffic risk, predict accident severity
                            and find intelligent alternative routes from one
                            centralized platform.
                        </p>


                        {/* =================================================
                            TRAFFIC CARD
                        ================================================== */}

                        <div
                            style={{
                                width: "100%",
                                marginTop: "28px",
                                borderRadius: "18px",
                                overflow: "hidden",
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.065)",
                                boxShadow:
                                    "0 25px 60px rgba(0,0,0,0.25)",
                                backdropFilter: "blur(16px)"
                            }}
                        >

                            {/* CARD HEADER */}

                            <div
                                style={{
                                    padding: "15px 20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderBottom:
                                        "1px solid rgba(255,255,255,0.08)"
                                }}
                            >

                                <div>

                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 600
                                        }}
                                    >
                                        Traffic Overview
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "3px",
                                            fontSize: "11px",
                                            color: "rgba(191,219,254,0.45)"
                                        }}
                                    >
                                        City traffic intelligence
                                    </div>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "7px",
                                        fontSize: "11px",
                                        color: "#6ee7b7"
                                    }}
                                >

                                    <span
                                        style={{
                                            width: "7px",
                                            height: "7px",
                                            borderRadius: "50%",
                                            background: "#10b981"
                                        }}
                                    />

                                    Online

                                </div>

                            </div>


                            {/* =================================================
                                STATS
                            ================================================== */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(3, minmax(0, 1fr))",
                                    gap: "10px",
                                    padding: "12px"
                                }}
                            >

                                {/* Risk */}

                                <div
                                    style={{
                                        padding: "13px",
                                        borderRadius: "12px",
                                        background:
                                            "rgba(255,255,255,0.055)",
                                        border:
                                            "1px solid rgba(255,255,255,0.07)"
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize: "11px",
                                            color:
                                                "rgba(191,219,254,0.45)"
                                        }}
                                    >
                                        Traffic Risk
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "5px",
                                            fontSize: "23px",
                                            fontWeight: 650,
                                            color: "#fb923c"
                                        }}
                                    >
                                        0.44
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "8px",
                                            height: "3px",
                                            borderRadius: "5px",
                                            background:
                                                "rgba(255,255,255,0.08)"
                                        }}
                                    >

                                        <div
                                            style={{
                                                width: "44%",
                                                height: "100%",
                                                borderRadius: "5px",
                                                background: "#fb923c"
                                            }}
                                        />

                                    </div>

                                </div>


                                {/* Cities */}

                                <div
                                    style={{
                                        padding: "13px",
                                        borderRadius: "12px",
                                        background:
                                            "rgba(255,255,255,0.055)",
                                        border:
                                            "1px solid rgba(255,255,255,0.07)"
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize: "11px",
                                            color:
                                                "rgba(191,219,254,0.45)"
                                        }}
                                    >
                                        Cities
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "5px",
                                            fontSize: "23px",
                                            fontWeight: 650
                                        }}
                                    >
                                        08
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "2px",
                                            fontSize: "10px",
                                            color: "#34d399"
                                        }}
                                    >
                                        Monitoring
                                    </div>

                                </div>


                                {/* Alerts */}

                                <div
                                    style={{
                                        padding: "13px",
                                        borderRadius: "12px",
                                        background:
                                            "rgba(255,255,255,0.055)",
                                        border:
                                            "1px solid rgba(255,255,255,0.07)"
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize: "11px",
                                            color:
                                                "rgba(191,219,254,0.45)"
                                        }}
                                    >
                                        Alerts
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "5px",
                                            fontSize: "23px",
                                            fontWeight: 650,
                                            color: "#34d399"
                                        }}
                                    >
                                        00
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "2px",
                                            fontSize: "10px",
                                            color: "#34d399"
                                        }}
                                    >
                                        All clear
                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                TRAFFIC ACTIVITY
                            ================================================== */}

                            <div
                                style={{
                                    padding: "2px 16px 14px"
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "10px"
                                    }}
                                >

                                    <div>

                                        <div
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 500
                                            }}
                                        >
                                            Traffic Activity
                                        </div>

                                        <div
                                            style={{
                                                marginTop: "2px",
                                                fontSize: "10px",
                                                color:
                                                    "rgba(191,219,254,0.4)"
                                            }}
                                        >
                                            Recent traffic intensity
                                        </div>

                                    </div>

                                    <FaChartLine
                                        size={14}
                                        color="#60a5fa"
                                    />

                                </div>


                                {/* BAR GRAPH */}

                                <div
                                    style={{
                                        height: "145px",
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: "9px",
                                        borderBottom:
                                            "1px solid rgba(255,255,255,0.08)"
                                    }}
                                >

                                    {trafficData.map((value, index) => (

                                        <div
                                            key={index}
                                            style={{
                                                flex: 1,
                                                height: "100%",
                                                display: "flex",
                                                alignItems: "flex-end"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: `${value}%`,
                                                    borderRadius:
                                                        "5px 5px 0 0",
                                                    background:
                                                        "linear-gradient(to top, #2459d9, #4b9af0)"
                                                }}
                                            />

                                        </div>

                                    ))}

                                </div>


                                {/* MONTH LABELS */}

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(10, 1fr)",
                                        gap: "9px",
                                        marginTop: "5px"
                                    }}
                                >

                                    {months.map((month) => (

                                        <div
                                            key={month}
                                            style={{
                                                textAlign: "center",
                                                fontSize: "9px",
                                                color:
                                                    "rgba(191,219,254,0.38)"
                                            }}
                                        >
                                            {month}
                                        </div>

                                    ))}

                                </div>

                            </div>


                            {/* =================================================
                                ROUTES / RISK / MAPS
                            ================================================== */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(3, 1fr)",
                                    borderTop:
                                        "1px solid rgba(255,255,255,0.08)"
                                }}
                            >

                                <div
                                    style={{
                                        padding: "10px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "7px",
                                        color: "#60a5fa",
                                        fontSize: "12px"
                                    }}
                                >

                                    <FaRoute />

                                    Routes

                                </div>


                                <div
                                    style={{
                                        padding: "10px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "7px",
                                        color: "#60a5fa",
                                        fontSize: "12px",
                                        borderLeft:
                                            "1px solid rgba(255,255,255,0.08)",
                                        borderRight:
                                            "1px solid rgba(255,255,255,0.08)"
                                    }}
                                >

                                    <FaShieldAlt />

                                    Risk

                                </div>


                                <div
                                    style={{
                                        padding: "10px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "7px",
                                        color: "#60a5fa",
                                        fontSize: "12px"
                                    }}
                                >

                                    <FaMapMarkedAlt />

                                    Maps

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================== */}

                <div
                    style={{
                        flexShrink: 0,
                        display: "flex",
                        justifyContent: "flex-end"
                    }}
                >

                    <span
                        style={{
                            fontSize: "11px",
                            color: "rgba(191,219,254,0.28)"
                        }}
                    >
                        Intelligent traffic decision support
                    </span>

                </div>

            </div>

        </div>
    );
}

export default AuthBranding;