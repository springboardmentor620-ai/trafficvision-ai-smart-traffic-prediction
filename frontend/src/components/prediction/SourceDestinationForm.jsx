import {
    getStates,
    getCities,
    getLocations
} from "../../utils/locationUtils";

function SourceDestinationForm({
    formData,
    setFormData
}) {

    const states = getStates();

    const sourceCities = getCities(
        formData.sourceState
    );

    const destinationCities = getCities(
        formData.destinationState
    );

    const sourceLocations = getLocations(
        formData.sourceState,
        formData.sourceCity
    );

    const destinationLocations = getLocations(
        formData.destinationState,
        formData.destinationCity
    );

    function handleSourceStateChange(event) {

        setFormData((previous) => ({

            ...previous,

            sourceState: event.target.value,

            sourceCity: "",

            sourceLocation: ""

        }));

    }

    function handleSourceCityChange(event) {

        setFormData((previous) => ({

            ...previous,

            sourceCity: event.target.value,

            sourceLocation: ""

        }));

    }

    function handleDestinationStateChange(event) {

        setFormData((previous) => ({

            ...previous,

            destinationState:
                event.target.value,

            destinationCity: "",

            destinationLocation: ""

        }));

    }

    function handleDestinationCityChange(event) {

        setFormData((previous) => ({

            ...previous,

            destinationCity:
                event.target.value,

            destinationLocation: ""

        }));

    }

    return (

        <div>

            <h2 className="text-xl font-semibold text-slate-900">

                Route Information

            </h2>

            <p className="mt-1 text-sm text-slate-500">

                Select your starting point and destination.

            </p>

            <div className="grid lg:grid-cols-2 gap-8 mt-6">

                {/* SOURCE */}

                <div className="rounded-2xl border border-slate-200 p-6">

                    <div className="flex items-center gap-3 mb-5">

                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">

                            A

                        </div>

                        <div>

                            <h3 className="font-semibold">

                                Source

                            </h3>

                            <p className="text-xs text-slate-500">

                                Starting location

                            </p>

                        </div>

                    </div>

                    <label className="block text-sm font-medium mb-2">

                        State

                    </label>

                    <select

                        value={formData.sourceState}

                        onChange={handleSourceStateChange}

                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"

                    >

                        <option value="">

                            Select State

                        </option>

                        {states.map((state) => (

                            <option
                                key={state}
                                value={state}
                            >

                                {state}

                            </option>

                        ))}

                    </select>

                    <label className="block text-sm font-medium mb-2 mt-4">

                        City

                    </label>

                    <select

                        value={formData.sourceCity}

                        onChange={handleSourceCityChange}

                        disabled={!formData.sourceState}

                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"

                    >

                        <option value="">

                            Select City

                        </option>

                        {sourceCities.map((city) => (

                            <option
                                key={city}
                                value={city}
                            >

                                {city}

                            </option>

                        ))}

                    </select>

                    <label className="block text-sm font-medium mb-2 mt-4">

                        Location

                    </label>

                    <select

                        value={formData.sourceLocation}

                        onChange={(event) =>

                            setFormData((previous) => ({

                                ...previous,

                                sourceLocation:
                                    event.target.value

                            }))

                        }

                        disabled={!formData.sourceCity}

                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"

                    >

                        <option value="">

                            Select Location

                        </option>

                        {sourceLocations.map((location) => (

                            <option
                                key={location}
                                value={location}
                            >

                                {location}

                            </option>

                        ))}

                    </select>

                </div>

                {/* DESTINATION */}

                <div className="rounded-2xl border border-slate-200 p-6">

                    <div className="flex items-center gap-3 mb-5">

                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">

                            B

                        </div>

                        <div>

                            <h3 className="font-semibold">

                                Destination

                            </h3>

                            <p className="text-xs text-slate-500">

                                Where you want to go

                            </p>

                        </div>

                    </div>

                    <label className="block text-sm font-medium mb-2">

                        State

                    </label>

                    <select

                        value={formData.destinationState}

                        onChange={handleDestinationStateChange}

                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"

                    >

                        <option value="">

                            Select State

                        </option>

                        {states.map((state) => (

                            <option
                                key={state}
                                value={state}
                            >

                                {state}

                            </option>

                        ))}

                    </select>

                    <label className="block text-sm font-medium mb-2 mt-4">

                        City

                    </label>

                    <select

                        value={formData.destinationCity}

                        onChange={handleDestinationCityChange}

                        disabled={!formData.destinationState}

                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"

                    >

                        <option value="">

                            Select City

                        </option>

                        {destinationCities.map((city) => (

                            <option
                                key={city}
                                value={city}
                            >

                                {city}

                            </option>

                        ))}

                    </select>

                    <label className="block text-sm font-medium mb-2 mt-4">

                        Location

                    </label>

                    <select

                        value={formData.destinationLocation}

                        onChange={(event) =>

                            setFormData((previous) => ({

                                ...previous,

                                destinationLocation:
                                    event.target.value

                            }))

                        }

                        disabled={!formData.destinationCity}

                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"

                    >

                        <option value="">

                            Select Location

                        </option>

                        {destinationLocations.map((location) => (

                            <option
                                key={location}
                                value={location}
                            >

                                {location}

                            </option>

                        ))}

                    </select>

                </div>

            </div>

        </div>

    );

}

export default SourceDestinationForm;