const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api";

async function request(path) {
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
