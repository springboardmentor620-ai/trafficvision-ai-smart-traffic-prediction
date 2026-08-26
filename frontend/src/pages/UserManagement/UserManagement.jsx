import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    FaUsers,
    FaUserShield,
    FaUserCheck,
    FaSyncAlt
} from "react-icons/fa";

import DashboardLayout
    from "../../components/layout/DashboardLayout";

import api from "../../services/api";


function UserManagement() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] =
        useState(null);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // =====================================================
    // LOAD USERS — REFRESH BUTTON
    // =====================================================

    const loadUsers = useCallback(async () => {

        setLoading(true);

        setError("");

        try {

            const response = await api.get(
                "/users"
            );

            setUsers(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        }
        catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to load users."
            );

        }
        finally {

            setLoading(false);

        }

    }, []);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        let cancelled = false;


        api.get("/users")
            .then((response) => {

                if (cancelled) {
                    return;
                }

                setUsers(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            })
            .catch((err) => {

                if (cancelled) {
                    return;
                }

                console.error(err);

                setError(
                    err?.response?.data?.detail ||
                    "Unable to load users."
                );

            })
            .finally(() => {

                if (!cancelled) {

                    setLoading(false);

                }

            });


        return () => {

            cancelled = true;

        };

    }, []);


    // =====================================================
    // CHANGE ROLE
    // =====================================================

    async function changeRole(
        userId,
        currentRole
    ) {

        const newRole =
            currentRole === "admin"
                ? "operator"
                : "admin";


        setActionLoading(
            `role-${userId}`
        );

        setError("");

        setSuccess("");


        try {

            const response =
                await api.patch(
                    `/users/${userId}/role`,
                    null,
                    {
                        params: {
                            role: newRole
                        }
                    }
                );


            const updatedUser =
                response.data?.user;


            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            ...updatedUser
                        }
                        : user
                )
            );


            setSuccess(
                "User role updated successfully."
            );

        }
        catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to change user role."
            );

        }
        finally {

            setActionLoading(null);

        }

    }


    // =====================================================
    // ACTIVATE USER
    // =====================================================

    async function activateUser(userId) {

        setActionLoading(
            `activate-${userId}`
        );

        setError("");

        setSuccess("");


        try {

            const response =
                await api.patch(
                    `/users/${userId}/activate`
                );


            const updatedUser =
                response.data?.user;


            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            ...updatedUser
                        }
                        : user
                )
            );


            setSuccess(
                "User activated successfully."
            );

        }
        catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to activate user."
            );

        }
        finally {

            setActionLoading(null);

        }

    }


    // =====================================================
    // DEACTIVATE USER
    // =====================================================

    async function deactivateUser(userId) {

        setActionLoading(
            `deactivate-${userId}`
        );

        setError("");

        setSuccess("");


        try {

            const response =
                await api.patch(
                    `/users/${userId}/deactivate`
                );


            const updatedUser =
                response.data?.user;


            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            ...updatedUser
                        }
                        : user
                )
            );


            setSuccess(
                "User deactivated successfully."
            );

        }
        catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to deactivate user."
            );

        }
        finally {

            setActionLoading(null);

        }

    }


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalUsers =
        users.length;


    const activeUsers =
        users.filter(
            (user) => user.is_active
        ).length;


    const adminUsers =
        users.filter(
            (user) => user.role === "admin"
        ).length;


    const operatorUsers =
        users.filter(
            (user) => user.role === "operator"
        ).length;


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <DashboardLayout>

            <div
                className="
                    mx-auto
                    w-full
                    max-w-7xl

                    px-5
                    py-8

                    sm:px-7

                    lg:px-10
                    lg:py-10
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    className="
                        mb-9

                        flex
                        flex-col
                        gap-5

                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    "
                >

                    <div>

                        <p
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.18em]

                                text-blue-600

                                dark:text-blue-400
                            "
                        >
                            Administration
                        </p>


                        <h1
                            className="
                                mt-2

                                text-3xl
                                font-bold
                                tracking-tight

                                text-slate-900

                                dark:text-white
                            "
                        >
                            User Management
                        </h1>


                        <p
                            className="
                                mt-2
                                max-w-2xl

                                text-sm
                                leading-6

                                text-slate-500

                                dark:text-slate-400
                            "
                        >
                            Manage platform users, roles and
                            account access.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={loadUsers}
                        disabled={loading}

                        className="
                            inline-flex
                            w-fit

                            items-center
                            gap-2

                            rounded-xl

                            border
                            border-slate-200

                            bg-white

                            px-4
                            py-2.5

                            text-sm
                            font-medium

                            text-slate-600

                            shadow-sm

                            transition

                            hover:border-blue-300
                            hover:text-blue-600

                            disabled:opacity-50

                            dark:border-slate-800
                            dark:bg-slate-900
                            dark:text-slate-300
                        "
                    >

                        <FaSyncAlt
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </header>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (

                    <div
                        className="
                            mb-5

                            rounded-xl

                            border
                            border-red-200

                            bg-red-50

                            px-4
                            py-3

                            text-sm
                            text-red-700

                            dark:border-red-900/50
                            dark:bg-red-950/20
                            dark:text-red-400
                        "
                    >
                        {error}
                    </div>

                )}


                {success && (

                    <div
                        className="
                            mb-5

                            rounded-xl

                            border
                            border-emerald-200

                            bg-emerald-50

                            px-4
                            py-3

                            text-sm
                            text-emerald-700

                            dark:border-emerald-900/50
                            dark:bg-emerald-950/20
                            dark:text-emerald-400
                        "
                    >
                        {success}
                    </div>

                )}


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <section
                    className="
                        mb-8

                        grid
                        grid-cols-1
                        gap-4

                        sm:grid-cols-2

                        xl:grid-cols-4
                    "
                >

                    <StatCard
                        icon={<FaUsers />}
                        label="Total Users"
                        value={totalUsers}
                    />


                    <StatCard
                        icon={<FaUserCheck />}
                        label="Active Users"
                        value={activeUsers}
                    />


                    <StatCard
                        icon={<FaUserShield />}
                        label="Administrators"
                        value={adminUsers}
                    />


                    <StatCard
                        icon={<FaUsers />}
                        label="Operators"
                        value={operatorUsers}
                    />

                </section>


                {/* =================================================
                    USER TABLE
                ================================================= */}

                <section
                    className="
                        overflow-hidden

                        rounded-2xl

                        border
                        border-slate-200

                        bg-white

                        shadow-sm

                        dark:border-slate-800
                        dark:bg-slate-900
                    "
                >

                    <div
                        className="
                            border-b
                            border-slate-200

                            px-6
                            py-5

                            dark:border-slate-800
                        "
                    >

                        <h2
                            className="
                                text-sm
                                font-semibold

                                text-slate-900

                                dark:text-white
                            "
                        >
                            Platform Users
                        </h2>


                        <p
                            className="
                                mt-1

                                text-xs

                                text-slate-500

                                dark:text-slate-400
                            "
                        >
                            Review accounts and manage access.
                        </p>

                    </div>


                    {loading ? (

                        <div
                            className="
                                flex
                                min-h-[300px]
                                items-center
                                justify-center
                            "
                        >

                            <div
                                className="
                                    h-8
                                    w-8

                                    animate-spin

                                    rounded-full

                                    border-2
                                    border-slate-200
                                    border-t-blue-600
                                "
                            />

                        </div>

                    ) : users.length === 0 ? (

                        <div
                            className="
                                flex
                                min-h-[300px]

                                flex-col
                                items-center
                                justify-center

                                px-6

                                text-center
                            "
                        >

                            <FaUsers
                                className="
                                    text-3xl
                                    text-slate-300

                                    dark:text-slate-700
                                "
                            />


                            <p
                                className="
                                    mt-4

                                    text-sm
                                    font-medium

                                    text-slate-700

                                    dark:text-slate-300
                                "
                            >
                                No users found
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table
                                className="
                                    w-full
                                    min-w-[850px]
                                    text-left
                                "
                            >

                                <thead>

                                    <tr
                                        className="
                                            border-b
                                            border-slate-200

                                            bg-slate-50

                                            dark:border-slate-800
                                            dark:bg-slate-950/50
                                        "
                                    >

                                        <th className={headerClass}>
                                            User
                                        </th>

                                        <th className={headerClass}>
                                            Role
                                        </th>

                                        <th className={headerClass}>
                                            Status
                                        </th>

                                        <th className={headerClass}>
                                            Joined
                                        </th>

                                        <th
                                            className={`
                                                ${headerClass}
                                                text-right
                                            `}
                                        >
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {users.map(
                                        (user) => (

                                            <tr
                                                key={user.id}
                                                className="
                                                    border-b
                                                    border-slate-100

                                                    last:border-0

                                                    dark:border-slate-800
                                                "
                                            >

                                                <td className="px-6 py-5">

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                h-10
                                                                w-10
                                                                shrink-0

                                                                items-center
                                                                justify-center

                                                                rounded-full

                                                                bg-blue-50

                                                                text-sm
                                                                font-semibold

                                                                text-blue-600

                                                                dark:bg-blue-500/10
                                                                dark:text-blue-400
                                                            "
                                                        >
                                                            {getInitial(
                                                                user.name
                                                            )}
                                                        </div>


                                                        <div>

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    font-semibold

                                                                    text-slate-900

                                                                    dark:text-white
                                                                "
                                                            >
                                                                {user.name}
                                                            </p>


                                                            <p
                                                                className="
                                                                    mt-0.5

                                                                    text-xs

                                                                    text-slate-500

                                                                    dark:text-slate-400
                                                                "
                                                            >
                                                                {user.email}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td className="px-6 py-5">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            rounded-full

                                                            px-2.5
                                                            py-1

                                                            text-xs
                                                            font-semibold

                                                            ${
                                                                user.role ===
                                                                "admin"
                                                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                                            }
                                                        `}
                                                    >
                                                        {capitalize(
                                                            user.role
                                                        )}
                                                    </span>

                                                </td>


                                                <td className="px-6 py-5">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            items-center
                                                            gap-2

                                                            text-xs
                                                            font-medium

                                                            ${
                                                                user.is_active
                                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                                    : "text-red-500 dark:text-red-400"
                                                            }
                                                        `}
                                                    >

                                                        <span
                                                            className={`
                                                                h-2
                                                                w-2
                                                                rounded-full

                                                                ${
                                                                    user.is_active
                                                                        ? "bg-emerald-500"
                                                                        : "bg-red-500"
                                                                }
                                                            `}
                                                        />

                                                        {user.is_active
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </td>


                                                <td className="px-6 py-5">

                                                    <span
                                                        className="
                                                            text-xs

                                                            text-slate-500

                                                            dark:text-slate-400
                                                        "
                                                    >
                                                        {formatDate(
                                                            user.created_at
                                                        )}
                                                    </span>

                                                </td>


                                                <td className="px-6 py-5">

                                                    <div
                                                        className="
                                                            flex
                                                            justify-end
                                                            gap-2
                                                        "
                                                    >

                                                        <button
                                                            type="button"

                                                            disabled={
                                                                actionLoading !==
                                                                null
                                                            }

                                                            onClick={() =>
                                                                changeRole(
                                                                    user.id,
                                                                    user.role
                                                                )
                                                            }

                                                            className="
                                                                rounded-lg

                                                                border
                                                                border-slate-200

                                                                px-3
                                                                py-2

                                                                text-xs
                                                                font-medium

                                                                text-slate-600

                                                                transition

                                                                hover:border-blue-300
                                                                hover:text-blue-600

                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-40

                                                                dark:border-slate-700
                                                                dark:text-slate-300
                                                            "
                                                        >

                                                            {actionLoading ===
                                                            `role-${user.id}`
                                                                ? "Saving..."
                                                                : "Change Role"}

                                                        </button>


                                                        {user.is_active ? (

                                                            <button
                                                                type="button"

                                                                disabled={
                                                                    actionLoading !==
                                                                    null
                                                                }

                                                                onClick={() =>
                                                                    deactivateUser(
                                                                        user.id
                                                                    )
                                                                }

                                                                className="
                                                                    rounded-lg

                                                                    border
                                                                    border-red-200

                                                                    px-3
                                                                    py-2

                                                                    text-xs
                                                                    font-medium

                                                                    text-red-600

                                                                    transition

                                                                    hover:bg-red-50

                                                                    disabled:cursor-not-allowed
                                                                    disabled:opacity-40

                                                                    dark:border-red-900/50
                                                                    dark:text-red-400
                                                                    dark:hover:bg-red-950/20
                                                                "
                                                            >

                                                                {actionLoading ===
                                                                `deactivate-${user.id}`
                                                                    ? "Saving..."
                                                                    : "Deactivate"}

                                                            </button>

                                                        ) : (

                                                            <button
                                                                type="button"

                                                                disabled={
                                                                    actionLoading !==
                                                                    null
                                                                }

                                                                onClick={() =>
                                                                    activateUser(
                                                                        user.id
                                                                    )
                                                                }

                                                                className="
                                                                    rounded-lg

                                                                    border
                                                                    border-emerald-200

                                                                    px-3
                                                                    py-2

                                                                    text-xs
                                                                    font-medium

                                                                    text-emerald-600

                                                                    transition

                                                                    hover:bg-emerald-50

                                                                    disabled:cursor-not-allowed
                                                                    disabled:opacity-40

                                                                    dark:border-emerald-900/50
                                                                    dark:text-emerald-400
                                                                "
                                                            >

                                                                {actionLoading ===
                                                                `activate-${user.id}`
                                                                    ? "Saving..."
                                                                    : "Activate"}

                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>

        </DashboardLayout>

    );

}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
    icon,
    label,
    value
}) {

    return (

        <div
            className="
                rounded-2xl

                border
                border-slate-200

                bg-white

                p-5

                shadow-sm

                dark:border-slate-800
                dark:bg-slate-900
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                "
            >

                <div>

                    <p
                        className="
                            text-xs
                            font-medium

                            text-slate-500

                            dark:text-slate-400
                        "
                    >
                        {label}
                    </p>


                    <p
                        className="
                            mt-2

                            text-2xl
                            font-bold

                            text-slate-900

                            dark:text-white
                        "
                    >
                        {value}
                    </p>

                </div>


                <div
                    className="
                        flex
                        h-10
                        w-10

                        items-center
                        justify-center

                        rounded-xl

                        bg-blue-50

                        text-blue-600

                        dark:bg-blue-500/10
                        dark:text-blue-400
                    "
                >
                    {icon}
                </div>

            </div>

        </div>

    );

}


/* =========================================================
   HELPERS
========================================================= */

const headerClass = `
    px-6
    py-4

    text-xs
    font-semibold
    uppercase
    tracking-wide

    text-slate-500

    dark:text-slate-400
`;


function capitalize(value) {

    if (!value) {
        return "—";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


function getInitial(name) {

    if (!name) {
        return "?";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


function formatDate(date) {

    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


export default UserManagement;