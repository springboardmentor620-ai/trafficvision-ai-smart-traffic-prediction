import api from "./api";
 
function authHeader() {
    return {
        headers: {
            Authorization:
                `Bearer ${localStorage.getItem("access_token")}`
        }
    };
}
 
export async function getUsers({ search, role, status, page, pageSize } = {}) {
 
    const params = {};
    if (search) params.search = search;
    if (role) params.role = role;
    if (status) params.status = status;
    if (page) params.page = page;
    if (pageSize) params.page_size = pageSize;
 
    const response = await api.get(
 
        "/admin/users",
 
        {
            params,
            ...authHeader()
        }
 
    );
 
    return response.data;
 
}
 
export async function getUser(id) {
 
    const response = await api.get(
 
        `/admin/users/${id}`,
 
        authHeader()
 
    );
 
    return response.data;
 
}
 
export async function suspendUser(id) {
 
    const response = await api.post(
 
        `/admin/users/${id}/suspend`,
 
        {},
 
        authHeader()
 
    );
 
    return response.data;
 
}
 
export async function restoreUser(id) {
 
    const response = await api.post(
 
        `/admin/users/${id}/restore`,
 
        {},
 
        authHeader()
 
    );
 
    return response.data;
 
}
 