function EmptyState({

    title,

    message

}) {

    return (

        <div

            className="

                bg-white

                rounded-2xl

                border

                border-dashed

                border-slate-300

                p-16

                text-center

            "

        >

            <h2

                className="

                    text-2xl

                    font-bold

                "

            >

                {title}

            </h2>

            <p

                className="

                    mt-3

                    text-slate-500

                "

            >

                {message}

            </p>

        </div>

    );

}

export default EmptyState;