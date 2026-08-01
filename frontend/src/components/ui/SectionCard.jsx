function SectionCard({

    title,

    children

}) {

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8">

            <h2 className="text-2xl font-bold mb-8">

                {title}

            </h2>

            {children}

        </div>

    );

}

export default SectionCard;