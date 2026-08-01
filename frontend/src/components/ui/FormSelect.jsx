function FormSelect({

    label,

    name,

    value,

    options,

    onChange

}) {

    return (

        <div>

            <label className="block mb-2 font-medium">

                {label}

            </label>

            <select

                name={name}

                value={value}

                onChange={onChange}

                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

            >

                {

                    options.map((item) => (

                        <option

                            key={item}

                            value={item}

                        >

                            {item}

                        </option>

                    ))

                }

            </select>

        </div>

    );

}

export default FormSelect;