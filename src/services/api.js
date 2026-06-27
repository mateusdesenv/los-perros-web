const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:3333/api" : "")
);

function normalizeApiBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

async function request(path) {
  if (!API_BASE_URL) {
    throw new Error("Configure VITE_API_BASE_URL com a URL da API.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os dados da API.");
  }

  return response.json();
}

export const menuApi = {
  getFeaturedProducts() {
    return request("/public/products/featured");
  },
  getMenu() {
    return request("/public/menu");
  }
};
