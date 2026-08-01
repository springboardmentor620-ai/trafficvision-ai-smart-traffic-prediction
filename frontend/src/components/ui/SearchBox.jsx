import { FaSearch } from "react-icons/fa";

function SearchBox({

    value,

    onChange,

    placeholder = "Search..."

}) {

    return (

        <div className="relative w-full">

            <FaSearch

                className="absolute left-4 top-4 text-slate-400"

            />

            <input

                value={value}

                onChange={onChange}

                placeholder={placeholder}

                className="

                    w-full

                    pl-11

                    pr-4

                    py-3

                    rounded-xl

                    border

                    border-slate-300

                    focus:outline-none

                    focus:ring-2

                    focus:ring-blue-500

                "

            />

        </div>

    );

}

export default SearchBox;