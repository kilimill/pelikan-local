export const ROLE_ID_HOST = 1
export const ROLE_ID_USER = 2
export const AVAILABLE_ROLES = {
    ROLE_ID_HOST: "host",
    ROLE_ID_USER: "user",
}

export default {
    hasRole(roleId) {
        return Object.keys(AVAILABLE_ROLES).includes(roleId)
    },
    getRole(roleId) {
        return this.hasRole(roleId) ? AVAILABLE_ROLES[roleId] : undefined
    },
}