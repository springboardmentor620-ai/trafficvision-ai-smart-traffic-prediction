function SectionTitle({

    title,

    subtitle

}) {

    return (

        <div className="text-center mb-16">

            <h2 className="text-5xl font-bold text-slate-900">

                {title}

            </h2>

            <p className="mt-5 text-lg text-gray-600 max-w-3xl mx-auto">

                {subtitle}

            </p>

        </div>

    );

}

export default SectionTitle;