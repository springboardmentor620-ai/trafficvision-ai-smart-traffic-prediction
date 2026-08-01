function Modal({

    open,

    title,

    children,

    onClose

}) {

    if (!open) {

        return null;

    }

    return (

        <div

            className="

                fixed

                inset-0

                bg-black/50

                flex

                items-center

                justify-center

                z-50

            "

        >

            <div

                className="

                    bg-white

                    rounded-2xl

                    p-8

                    w-full

                    max-w-lg

                "

            >

                <div

                    className="

                        flex

                        justify-between

                        items-center

                        mb-6

                    "

                >

                    <h2

                        className="

                            text-2xl

                            font-bold

                        "

                    >

                        {title}

                    </h2>

                    <button

                        onClick={onClose}

                        className="text-2xl"

                    >

                        ×

                    </button>

                </div>

                {children}

            </div>

        </div>

    );

}

export default Modal;