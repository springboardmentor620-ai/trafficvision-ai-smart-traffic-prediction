function RecommendationCard({ recommendation }) {

    if (!recommendation) {

        return null;

    }

    return (

        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-xl p-6">

            <h2 className="text-2xl font-bold">

                AI Recommendation

            </h2>

            <p className="mt-4 leading-8 text-gray-700">

                {recommendation}

            </p>

        </div>

    );

}

export default RecommendationCard;