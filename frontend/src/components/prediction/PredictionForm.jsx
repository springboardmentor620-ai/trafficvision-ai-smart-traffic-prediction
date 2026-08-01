import { useState } from "react";

import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import ToggleSwitch from "../ui/ToggleSwitch";
import SectionCard from "../ui/SectionCard";

import MasterDataService from "../../services/masterDataService";

function PredictionForm({ onPredict }) {

    const [formData, setFormData] = useState({

        city: "",

        state: "",

        hour: 12,

        day_of_week: "Monday",

        is_weekend: false,

        road_type: "City Road",

        lanes: 2,

        traffic_signal: true,

        weather: "Clear",

        visibility: "Good",

        temperature: 25,

        traffic_density: "Medium",

        cause: "Overspeeding",

        vehicles_involved: 2,

        casualties: 0,

        is_peak_hour: false,

        festival: "No"

    });

    function handleChange(event) {

        const {

            name,

            value,

            checked,

            type

        } = event.target;

        setFormData({

            ...formData,

            [name]:

                type === "checkbox"

                    ? checked

                    : type === "number"

                    ? Number(value)

                    : value

        });

    }

    function handleSubmit(event) {

        event.preventDefault();

        onPredict(formData);

    }

    return (

        <SectionCard

            title="Prediction Details"

        >

            <form

                onSubmit={handleSubmit}

                className="grid md:grid-cols-2 gap-6"

            >

                <FormInput

                    label="City"

                    name="city"

                    value={formData.city}

                    onChange={handleChange}

                />

                <FormInput

                    label="State"

                    name="state"

                    value={formData.state}

                    onChange={handleChange}

                />

                <FormInput

                    label="Hour"

                    type="number"

                    name="hour"

                    value={formData.hour}

                    onChange={handleChange}

                />

                <FormSelect

                    label="Day"

                    name="day_of_week"

                    value={formData.day_of_week}

                    options={MasterDataService.days}

                    onChange={handleChange}

                />

                <FormSelect

                    label="Weather"

                    name="weather"

                    value={formData.weather}

                    options={MasterDataService.weather}

                    onChange={handleChange}

                />

                <FormSelect

                    label="Road Type"

                    name="road_type"

                    value={formData.road_type}

                    options={MasterDataService.roadTypes}

                    onChange={handleChange}

                />

                <FormSelect

                    label="Traffic Density"

                    name="traffic_density"

                    value={formData.traffic_density}

                    options={MasterDataService.trafficDensity}

                    onChange={handleChange}

                />

                <FormSelect

                    label="Cause"

                    name="cause"

                    value={formData.cause}

                    options={MasterDataService.causes}

                    onChange={handleChange}

                />

                <FormInput

                    label="Visibility"

                    name="visibility"

                    value={formData.visibility}

                    onChange={handleChange}

                />

                <FormInput

                    label="Temperature"

                    type="number"

                    name="temperature"

                    value={formData.temperature}

                    onChange={handleChange}

                />

                <FormInput

                    label="Lanes"

                    type="number"

                    name="lanes"

                    value={formData.lanes}

                    onChange={handleChange}

                />

                <FormInput

                    label="Vehicles"

                    type="number"

                    name="vehicles_involved"

                    value={formData.vehicles_involved}

                    onChange={handleChange}

                />

                <FormInput

                    label="Casualties"

                    type="number"

                    name="casualties"

                    value={formData.casualties}

                    onChange={handleChange}

                />

                <FormSelect

                    label="Festival"

                    name="festival"

                    value={formData.festival}

                    options={MasterDataService.festivals}

                    onChange={handleChange}

                />

                <div className="md:col-span-2 grid md:grid-cols-3 gap-4">

                    <ToggleSwitch

                        label="Traffic Signal"

                        name="traffic_signal"

                        checked={formData.traffic_signal}

                        onChange={handleChange}

                    />

                    <ToggleSwitch

                        label="Weekend"

                        name="is_weekend"

                        checked={formData.is_weekend}

                        onChange={handleChange}

                    />

                    <ToggleSwitch

                        label="Peak Hour"

                        name="is_peak_hour"

                        checked={formData.is_peak_hour}

                        onChange={handleChange}

                    />

                </div>

                <button

                    type="submit"

                    className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-semibold transition"

                >

                    Predict Accident Risk

                </button>

            </form>

        </SectionCard>

    );

}

export default PredictionForm;