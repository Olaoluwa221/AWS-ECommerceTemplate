export const API_PREFIX = '/api';

export const testRoutes = {
    auth: {
        register: `${API_PREFIX}/auth/register`,
        login: `${API_PREFIX}/auth/login`,
    },

    categories: {
        root: `${API_PREFIX}/categories`,
        adminAll: `${API_PREFIX}/categories/admin/all`,

        bySlug: (slug: string) =>
            `${API_PREFIX}/categories/${slug}`,

        byId: (id: string) =>
            `${API_PREFIX}/categories/${id}`,

        deactivate: (id: string) =>
            `${API_PREFIX}/categories/${id}/deactivate`,

        reactivate: (id: string) =>
            `${API_PREFIX}/categories/${id}/reactivate`,
    },

    optionDefinitions: {
        root: `${API_PREFIX}/option-definitions`,

        byName: (name: string) =>
            `${API_PREFIX}/option-definitions/${encodeURIComponent(name)}`,

        byId: (id: string) =>
            `${API_PREFIX}/option-definitions/${id}`,

        deactivate: (id: string) =>
            `${API_PREFIX}/option-definitions/${id}/deactivate`,

        reactivate: (id: string) =>
            `${API_PREFIX}/option-definitions/${id}/reactivate`,
    },

    productTemplates: {
        root: `${API_PREFIX}/product-templates`,

        byId: (id: string) =>
            `${API_PREFIX}/product-templates/${id}`,

        deactivate: (id: string) =>
            `${API_PREFIX}/product-templates/${id}/deactivate`,

        reactivate: (id: string) =>
            `${API_PREFIX}/product-templates/${id}/reactivate`,
    },
};