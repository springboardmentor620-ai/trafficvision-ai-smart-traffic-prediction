function PageHeader({

    title,

    subtitle,

    action

}) {

    return (

        <div

            className="

                flex

                justify-between

                items-center

                mb-8

            "

        >

            <div>

                <h1

                    className="

                        text-4xl

                        font-bold

                        text-slate-900

                    "

                >

                    {title}

                </h1>

                <p

                    className="

                        mt-2

                        text-slate-500

                    "

                >

                    {subtitle}

                </p>

            </div>

            {action}

        </div>

    );

}

export default PageHeader;