function ToggleSwitch({

    label,

    name,

    checked,

    onChange

}) {

    return (

        <label className="flex items-center justify-between bg-slate-100 rounded-xl p-4 cursor-pointer">

            <span className="font-medium">

                {label}

            </span>

            <input

                type="checkbox"

                name={name}

                checked={checked}

                onChange={onChange}

                className="w-5 h-5 accent-blue-600"

            />

        </label>

    );

}

export default ToggleSwitch;