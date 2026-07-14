import { ClipLoader } from "react-spinners";

function Loader() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh"
            }}
        >
            <ClipLoader
                size={60}
                color="#2563eb"
            />
        </div>
    );
}

export default Loader;