function Table({

    columns,

    data

}) {

    return (

        <div className="overflow-x-auto">

            <table className="w-full">

                <thead>

                    <tr className="border-b bg-slate-50">

                        {

                            columns.map((column) => (

                                <th

                                    key={column.key}

                                    className="

                                        px-5

                                        py-4

                                        text-left

                                        font-semibold

                                    "

                                >

                                    {column.title}

                                </th>

                            ))

                        }

                    </tr>

                </thead>

                <tbody>

                    {

                        data.map((row, index) => (

                            <tr

                                key={index}

                                className="border-b hover:bg-slate-50"

                            >

                                {

                                    columns.map((column) => (

                                        <td

                                            key={column.key}

                                            className="px-5 py-4"

                                        >

                                            {

                                                row[column.key]

                                            }

                                        </td>

                                    ))

                                }

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default Table;