function FormInput({

    label,

    ...props

}) {

    return (

        <div>

            <label className="block mb-2 font-medium">

                {label}

            </label>

            <input

                {...props}

                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"

            />

        </div>

    );

}

export default FormInput;