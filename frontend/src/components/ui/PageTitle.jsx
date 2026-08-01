function PageTitle({

    title,

    subtitle

}) {

    return (

        <div className="mb-10">

            <h1 className="text-4xl font-bold text-slate-900">

                {title}

            </h1>

            <p className="mt-3 text-gray-500">

                {subtitle}

            </p>

        </div>

    );

}

export default PageTitle;