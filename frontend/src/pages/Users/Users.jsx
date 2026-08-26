import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FaUsers,
    FaUserShield,
    FaUserCog,
    FaSearch,
    FaCheckCircle,
    FaTimesCircle,
    FaSyncAlt
} from "react-icons/fa";

import DashboardLayout
    from "../../components/layout/DashboardLayout";

import UserService
    from "../../services/userService";

import AuthService
    from "../../services/authService";


function Users() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [roleFilter, setRoleFilter] = useState("all");

    const [actionLoading, setActionLoading] = useState(null);


    const currentUser =
        AuthService.getUser();


    // =====================================================
    // LOAD USERS
    // =====================================================

    const loadUsers = useCallback(async () => {

        try {

            setError("");

            const data =
                await UserService.getAllUsers();

            setUsers(
                Array.isArray(data)
                    ? data
                    : []
            );

        }
        catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to load users. Please check your admin access."
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


        async function fetchUsers() {

            try {

                setError("");

                const data =
                    await UserService.getAllUsers();


                if (!cancelled) {

                    setUsers(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                }

            }
            catch (err) {

                console.error(err);


                if (!cancelled) {

                    setError(
                        err?.response?.data?.detail ||
                        "Unable to load users. Please check your admin access."
                    );

                }

            }
            finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        fetchUsers();


        return () => {

            cancelled = true;

        };

    }, []);


    // =====================================================
    // FILTER USERS
    // =====================================================

    const filteredUsers = useMemo(() => {

        const query =
            search.trim().toLowerCase();


        return users.filter((user) => {

            const matchesSearch =
                !query ||
                user.name
                    ?.toLowerCase()
                    .includes(query) ||
                user.email
                    ?.toLowerCase()
                    .includes(query);


            const matchesRole =
                roleFilter === "all" ||
                user.role === roleFilter;


            return (
                matchesSearch &&
                matchesRole
            );

        });

    }, [users, search, roleFilter]);


    // =====================================================
    // CHANGE ROLE
    // =====================================================

    async function handleRoleChange(
        userId,
        newRole
    ) {

        if (!newRole) {
            return;
        }


        try {

            setActionLoading(
                `role-${userId}`
            );


            const result =
                await UserService.changeRole(
                    userId,
                    newRole
                );


            setUsers((previous) =>
                previous.map((user) =>
                    user.id === userId
                        ? {
                            ...user,
                            ...result.user
                        }
                        : user
                )
            );

        }
        catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.detail ||
                "Unable to change user role."
            );

        }
        finally {

            setActionLoading(null);

        }

    }


    // =====================================================
    // ACTIVATE / DEACTIVATE
    // =====================================================

    async function handleStatusChange(user) {

        try {

            setActionLoading(
                `status-${user.id}`
            );


            const result =
                user.is_active

                    ? await UserService.deactivateUser(
                        user.id
                    )

                    : await UserService.activateUser(
                        user.id
                    );


            setUsers((previous) =>
                previous.map((item) =>
                    item.id === user.id
                        ? {
                            ...item,
                            ...result.user
                        }
                        : item
                )
            );

        }
        catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.detail ||
                "Unable to update user status."
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
    // RENDER
    // =====================================================

    return (

        <DashboardLayout>

            <main
                className="
                    min-h-screen
                    px-6
                    py-10

                    sm:px-8

                    lg:px-10
                    lg:py-12
                "
            >

                <div
                    className="
                        mx-auto
                        w-full
                        max-w-7xl
                    "
                >

                    {/* HEADER */}

                    <header
                        className="
                            mb-10

                            flex
                            flex-col
                            gap-5

                            lg:flex-row
                            lg:items-end
                            lg:justify-between
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
                                Manage platform users, account
                                status and access roles.
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


                    {/* SUMMARY */}

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

                        <SummaryCard
                            icon={<FaUsers />}
                            label="Total Users"
                            value={totalUsers}
                        />

                        <SummaryCard
                            icon={<FaCheckCircle />}
                            label="Active Users"
                            value={activeUsers}
                        />

                        <SummaryCard
                            icon={<FaUserShield />}
                            label="Administrators"
                            value={adminUsers}
                        />

                        <SummaryCard
                            icon={<FaUserCog />}
                            label="Operators"
                            value={operatorUsers}
                        />

                    </section>


                    {/* USERS */}

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

                        {/* FILTERS */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-4

                                border-b
                                border-slate-200

                                p-5

                                md:flex-row
                                md:items-center
                                md:justify-between

                                dark:border-slate-800
                            "
                        >

                            <div
                                className="
                                    relative
                                    w-full
                                    md:max-w-sm
                                "
                            >

                                <FaSearch
                                    className="
                                        absolute
                                        left-4
                                        top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search users..."
                                    className="
                                        h-11
                                        w-full

                                        rounded-xl

                                        border
                                        border-slate-200

                                        bg-slate-50

                                        pl-11
                                        pr-4

                                        text-sm
                                        text-slate-900

                                        outline-none

                                        focus:border-blue-500
                                        focus:bg-white
                                        focus:ring-4
                                        focus:ring-blue-500/10

                                        dark:border-slate-700
                                        dark:bg-slate-950
                                        dark:text-white
                                    "
                                />

                            </div>


                            <select
                                value={roleFilter}
                                onChange={(event) =>
                                    setRoleFilter(
                                        event.target.value
                                    )
                                }

                                className="
                                    h-11

                                    rounded-xl

                                    border
                                    border-slate-200

                                    bg-white

                                    px-4

                                    text-sm
                                    text-slate-700

                                    outline-none

                                    focus:border-blue-500

                                    dark:border-slate-700
                                    dark:bg-slate-950
                                    dark:text-slate-300
                                "
                            >

                                <option value="all">
                                    All roles
                                </option>

                                <option value="admin">
                                    Administrators
                                </option>

                                <option value="operator">
                                    Operators
                                </option>

                            </select>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div
                                className="
                                    m-5

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


                        {/* LOADING */}

                        {loading && (

                            <div
                                className="
                                    flex
                                    min-h-[280px]
                                    items-center
                                    justify-center
                                "
                            >

                                <div className="text-center">

                                    <div
                                        className="
                                            mx-auto
                                            h-8
                                            w-8

                                            animate-spin

                                            rounded-full

                                            border-2
                                            border-slate-200
                                            border-t-blue-600
                                        "
                                    />

                                    <p
                                        className="
                                            mt-4
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        Loading users...
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* EMPTY */}

                        {!loading &&
                            !error &&
                            filteredUsers.length === 0 && (

                                <div
                                    className="
                                        flex
                                        min-h-[280px]

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
                                        "
                                    />

                                    <h3
                                        className="
                                            mt-4
                                            text-sm
                                            font-semibold
                                            text-slate-800
                                            dark:text-slate-200
                                        "
                                    >
                                        No users found
                                    </h3>

                                </div>

                            )}


                        {/* TABLE */}

                        {!loading &&
                            !error &&
                            filteredUsers.length > 0 && (

                                <div className="overflow-x-auto">

                                    <table
                                        className="
                                            w-full
                                            min-w-[850px]
                                        "
                                    >

                                        <thead>

                                            <tr
                                                className="
                                                    border-b
                                                    border-slate-200
                                                    text-left
                                                    dark:border-slate-800
                                                "
                                            >

                                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    User
                                                </th>

                                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Role
                                                </th>

                                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Status
                                                </th>

                                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Joined
                                                </th>

                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {filteredUsers.map(
                                                (user) => {

                                                    const isCurrentUser =
                                                        currentUser?.id ===
                                                        user.id;

                                                    const roleLoading =
                                                        actionLoading ===
                                                        `role-${user.id}`;

                                                    const statusLoading =
                                                        actionLoading ===
                                                        `status-${user.id}`;


                                                    return (

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
                                                                        {(
                                                                            user.name ||
                                                                            "U"
                                                                        )
                                                                            .charAt(0)
                                                                            .toUpperCase()}
                                                                    </div>


                                                                    <div>

                                                                        <p
                                                                            className="
                                                                                text-sm
                                                                                font-semibold
                                                                                text-slate-800
                                                                                dark:text-slate-200
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

                                                                {isCurrentUser ? (

                                                                    <span
                                                                        className="
                                                                            inline-flex
                                                                            items-center
                                                                            gap-2
                                                                            rounded-full
                                                                            bg-blue-50
                                                                            px-3
                                                                            py-1.5
                                                                            text-xs
                                                                            font-medium
                                                                            text-blue-700
                                                                            dark:bg-blue-500/10
                                                                            dark:text-blue-400
                                                                        "
                                                                    >

                                                                        {user.role}

                                                                        <span>
                                                                            (You)
                                                                        </span>

                                                                    </span>

                                                                ) : (

                                                                    <select
                                                                        value={user.role}
                                                                        disabled={roleLoading}
                                                                        onChange={(event) =>
                                                                            handleRoleChange(
                                                                                user.id,
                                                                                event.target.value
                                                                            )
                                                                        }

                                                                        className="
                                                                            rounded-lg
                                                                            border
                                                                            border-slate-200
                                                                            bg-white
                                                                            px-3
                                                                            py-2
                                                                            text-xs
                                                                            font-medium
                                                                            text-slate-700
                                                                            outline-none
                                                                            focus:border-blue-500
                                                                            disabled:opacity-50
                                                                            dark:border-slate-700
                                                                            dark:bg-slate-950
                                                                            dark:text-slate-300
                                                                        "
                                                                    >

                                                                        <option value="operator">
                                                                            Operator
                                                                        </option>

                                                                        <option value="admin">
                                                                            Administrator
                                                                        </option>

                                                                    </select>

                                                                )}

                                                            </td>


                                                            <td className="px-6 py-5">

                                                                <span
                                                                    className={`
                                                                        inline-flex
                                                                        items-center
                                                                        gap-2
                                                                        rounded-full
                                                                        px-3
                                                                        py-1.5
                                                                        text-xs
                                                                        font-medium

                                                                        ${
                                                                            user.is_active
                                                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                                                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                                                        }
                                                                    `}
                                                                >

                                                                    <span
                                                                        className={`
                                                                            h-1.5
                                                                            w-1.5
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
                                                                        : "Inactive"
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td
                                                                className="
                                                                    px-6
                                                                    py-5
                                                                    text-xs
                                                                    text-slate-500
                                                                    dark:text-slate-400
                                                                "
                                                            >

                                                                {user.created_at
                                                                    ? new Date(
                                                                        user.created_at
                                                                    ).toLocaleDateString(
                                                                        "en-IN",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "short",
                                                                            year: "numeric"
                                                                        }
                                                                    )
                                                                    : "—"
                                                                }

                                                            </td>


                                                            <td
                                                                className="
                                                                    px-6
                                                                    py-5
                                                                    text-right
                                                                "
                                                            >

                                                                {isCurrentUser ? (

                                                                    <span
                                                                        className="
                                                                            text-xs
                                                                            text-slate-400
                                                                        "
                                                                    >
                                                                        Current account
                                                                    </span>

                                                                ) : (

                                                                    <button
                                                                        type="button"
                                                                        disabled={statusLoading}
                                                                        onClick={() =>
                                                                            handleStatusChange(
                                                                                user
                                                                            )
                                                                        }

                                                                        className={`
                                                                            inline-flex
                                                                            items-center
                                                                            gap-2
                                                                            rounded-lg
                                                                            border
                                                                            px-3
                                                                            py-2
                                                                            text-xs
                                                                            font-medium
                                                                            transition
                                                                            disabled:opacity-50

                                                                            ${
                                                                                user.is_active
                                                                                    ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20"
                                                                                    : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                                                                            }
                                                                        `}
                                                                    >

                                                                        {user.is_active
                                                                            ? (
                                                                                <>
                                                                                    <FaTimesCircle />
                                                                                    Deactivate
                                                                                </>
                                                                            )
                                                                            : (
                                                                                <>
                                                                                    <FaCheckCircle />
                                                                                    Activate
                                                                                </>
                                                                            )
                                                                        }

                                                                    </button>

                                                                )}

                                                            </td>

                                                        </tr>

                                                    );

                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                    </section>

                </div>

            </main>

        </DashboardLayout>

    );

}


/* =============================================================
   SUMMARY CARD
============================================================= */

function SummaryCard({
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
                dark:shadow-none
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


export default Users;