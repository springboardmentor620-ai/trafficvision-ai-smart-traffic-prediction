import Button from "../ui/Button";

function ExportButtons() {

    return (

        <div className="flex gap-4 flex-wrap">

            <Button>

                Export PDF

            </Button>

            <Button
                variant="success"
            >

                Export Excel

            </Button>

            <Button
                variant="secondary"
            >

                Export CSV

            </Button>

        </div>

    );

}

export default ExportButtons;