export const STORAGE_KEYS = {
  menu: 'los-perros:menu-data:v1',
  cart: 'los-perros:cart:v1',
  ageConfirmed: 'los-perros:age-confirmed:v1',
};

export const categoryIcons = {
  'pizzas-do-gobbo': '🍕',
  refrigerantes: '🥤',
  energeticos: '⚡',
  'cervejas-geladas': '🍺',
  espumantes: '🍾',
  vinhos: '🍷',
  destilados: '🥃',
};

export const categoryGradient = {
  'pizzas-do-gobbo': 'linear-gradient(145deg, rgba(235,75,39,.18), rgba(252,237,178,.08))',
  refrigerantes: 'linear-gradient(145deg, rgba(180,199,229,.28), rgba(252,237,178,.07))',
  energeticos: 'linear-gradient(145deg, rgba(244,90,50,.22), rgba(180,199,229,.10))',
  'cervejas-geladas': 'linear-gradient(145deg, rgba(252,237,178,.22), rgba(235,75,39,.10))',
  espumantes: 'linear-gradient(145deg, rgba(255,243,196,.26), rgba(232,210,143,.08))',
  vinhos: 'linear-gradient(145deg, rgba(201,58,29,.18), rgba(252,237,178,.08))',
  destilados: 'linear-gradient(145deg, rgba(252,237,178,.16), rgba(180,199,229,.08))',
};

export function formatCurrency(valueInCents) {
  if (valueInCents === null || valueInCents === undefined) return 'Consultar';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100);
}

export function normalizeText(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getAllProducts(menuData) {
  return menuData.categories.flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
    })),
  );
}

export function getFeaturedProducts(menuData, limit = 8) {
  const allProducts = getAllProducts(menuData);
  const preferred = [
    'cervejas-geladas',
    'destilados',
    'refrigerantes',
    'energeticos',
    'pizzas-do-gobbo',
    'vinhos',
    'espumantes',
  ];

  const picked = [];

  preferred.forEach((categoryId) => {
    const product = allProducts.find(
      (item) => item.categoryId === categoryId && item.priceInCents !== null,
    );
    if (product) picked.push(product);
  });

  allProducts.forEach((product) => {
    if (picked.length >= limit) return;
    if (!picked.some((item) => item.id === product.id)) picked.push(product);
  });

  return picked.slice(0, limit);
}

export function buildWhatsAppMessage(cartItems, establishment) {
  const lines = [
    `Olá, quero fazer um pedido no ${establishment.name}:`,
    '',
    ...cartItems.map((item) => {
      const unitPrice = item.priceInCents ? formatCurrency(item.priceInCents) : 'valor sob consulta';
      const subtotal = item.priceInCents ? formatCurrency(item.priceInCents * item.quantity) : 'sob consulta';
      return `• ${item.quantity}x ${item.name} — ${unitPrice} cada | subtotal: ${subtotal}`;
    }),
    '',
    `Total estimado: ${formatCurrency(
      cartItems.reduce((total, item) => total + (item.priceInCents || 0) * item.quantity, 0),
    )}`,
    '',
    'Pode confirmar disponibilidade, entrega e forma de pagamento?',
  ];

  return lines.join('\n');
}

export function sanitizeWhatsAppNumber(value = '') {
  return value.toString().replace(/\D/g, '');
}
