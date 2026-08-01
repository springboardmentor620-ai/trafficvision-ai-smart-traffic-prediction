function Button({

    children,

    type = "button",

    variant = "primary",

    onClick,

    className = "",

    disabled = false

}) {

    const styles = {

        primary:

            "bg-blue-600 hover:bg-blue-700 text-white",

        secondary:

            "bg-slate-100 hover:bg-slate-200 text-slate-800",

        success:

            "bg-green-600 hover:bg-green-700 text-white",

        danger:

            "bg-red-600 hover:bg-red-700 text-white"

    };

    return (

        <button

            type={type}

            disabled={disabled}

            onClick={onClick}

            className={`

                px-6

                py-3

                rounded-xl

                font-semibold

                transition-all

                duration-300

                shadow-sm

                ${styles[variant]}

                ${className}

            `}

        >

            {children}

        </button>

    );

}

export default Button;