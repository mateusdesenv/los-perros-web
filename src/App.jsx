import { useEffect, useMemo, useState } from 'react';
import {
  Beer,
  Bike,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  BookOpen,
  Home,
  Menu,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Snowflake,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import initialMenuData from './data/menuData.json';
import logoBadge from './assets/logo-badge.jpg';
import logoMain from './assets/logo-main.jpg';
import mascots from './assets/mascots.jpg';
import heroBanner from './assets/hero-banner.webp';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import {
  STORAGE_KEYS,
  buildWhatsAppMessage,
  categoryGradient,
  categoryIcons,
  formatCurrency,
  getAllProducts,
  getFeaturedProducts,
  normalizeText,
  sanitizeWhatsAppNumber,
} from './utils';

const WHATSAPP_NUMBER = sanitizeWhatsAppNumber(import.meta.env.VITE_WHATSAPP_NUMBER || initialMenuData.establishment.whatsapp);
const ROUTES = {
  home: '/',
  catalog: '/cardapio',
};

function getPageFromLocation() {
  if (typeof window === 'undefined') return 'home';
  return window.location.pathname.replace(/\/$/, '') === '/cardapio' ? 'catalog' : 'home';
}

function Logo({ variant = 'badge' }) {
  return (
    <img
      className="brand-logo"
      src={variant === 'badge' ? logoBadge : logoMain}
      alt="Los Perros Market"
      loading="lazy"
    />
  );
}

function CategoryIcon({ categoryId }) {
  return (
    <span className="category-symbol" aria-hidden="true">
      {categoryIcons[categoryId] || <Beer size={28} />}
    </span>
  );
}

function ProductVisual({ product }) {
  return (
    <div
      className="product-visual"
      style={{ background: categoryGradient[product.categoryId] || undefined }}
      aria-hidden="true"
    >
      <div className="product-glow" />
      <span>{categoryIcons[product.categoryId] || '🛒'}</span>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const hasPrice = product.priceInCents !== null && product.priceInCents !== undefined;

  return (
    <article className="product-card">
      <div className="product-badges">
        {product.ageRestriction18 && <span className="badge danger">18+</span>}
        {product.status === 'needs_confirmation' && <span className="badge warning">Confirmar</span>}
      </div>
      <ProductVisual product={product} />
      <div className="product-info">
        <span className="product-category">{product.categoryName}</span>
        <h3>{product.name}</h3>
        <p>{product.description || product.volume || 'Produto selecionado Los Perros Market'}</p>
      </div>
      <div className="product-footer">
        <strong className={!hasPrice ? 'consult-price' : ''}>
          {product.priceFormatted || formatCurrency(product.priceInCents)}
        </strong>
        <button type="button" className="icon-button orange" onClick={() => onAdd(product)} aria-label={`Adicionar ${product.name}`}>
          <ShoppingCart size={18} />
        </button>
      </div>
    </article>
  );
}

function CartDrawer({ isOpen, onOpen, onClose, cart, setCart, establishment }) {
  const subtotal = cart.reduce((total, item) => total + (item.priceInCents || 0) * item.quantity, 0);

  function updateQuantity(productId, operation) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== productId) return item;
          const nextQuantity = operation === 'increase' ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity: Math.max(nextQuantity, 0) };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
  }

  async function finishOrder() {
    if (!cart.length) return;

    const message = buildWhatsAppMessage(cart, establishment);

    if (WHATSAPP_NUMBER) {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    await navigator.clipboard.writeText(message);
    alert('Pedido copiado. Configure o número no .env para abrir direto no WhatsApp.');
  }

  return (
    <>
      <button className={`cart-fab ${cart.length ? 'is-active' : ''}`} type="button" onClick={onOpen} aria-label="Abrir carrinho">
        <ShoppingCart size={22} />
        <span>{cart.reduce((total, item) => total + item.quantity, 0)}</span>
      </button>

      <div className={`overlay ${isOpen ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`cart-drawer ${isOpen ? 'is-open' : ''}`} aria-label="Carrinho">
        <div className="cart-header">
          <div>
            <span className="section-kicker">Pedido</span>
            <h2>Seu carrinho</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="Fechar carrinho">
            <X size={20} />
          </button>
        </div>

        {!cart.length ? (
          <div className="empty-cart">
            <ShoppingCart size={42} />
            <h3>Nenhum produto ainda</h3>
            <p>Adicione bebidas, pizzas ou conveniências para montar o pedido.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-icon">{categoryIcons[item.categoryId] || '🛒'}</div>
                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <span>{item.priceFormatted || formatCurrency(item.priceInCents)}</span>
                    {item.ageRestriction18 && <small>Produto 18+</small>}
                  </div>
                  <div className="cart-item-actions">
                    <button type="button" onClick={() => updateQuantity(item.id, 'decrease')} aria-label="Diminuir quantidade">
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, 'increase')} aria-label="Aumentar quantidade">
                      <Plus size={14} />
                    </button>
                    <button className="trash" type="button" onClick={() => removeItem(item.id)} aria-label="Remover item">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Total estimado</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <p>Produtos com preço sob consulta serão confirmados no atendimento.</p>
              <button className="primary-button full" type="button" onClick={finishOrder}>
                <MessageCircle size={19} /> Finalizar pedido
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function AgeConfirmModal({ product, onConfirm, onCancel }) {
  if (!product) return null;

  return (
    <div className="modal-layer">
      <div className="age-modal">
        <div className="age-icon">18+</div>
        <h2>Confirmação necessária</h2>
        <p>
          <strong>{product.name}</strong> é um produto alcoólico. Confirme que você tem 18 anos ou mais para continuar.
        </p>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>Cancelar</button>
          <button className="primary-button" type="button" onClick={onConfirm}>Tenho 18 anos ou mais</button>
        </div>
      </div>
    </div>
  );
}

function Hero({ productCount, onOpenCatalog }) {
  return (
    <section
      className="hero hero-with-banner"
      id="inicio"
      style={{ '--hero-banner': `url(${heroBanner})` }}
    >
      <div className="hero-content">
        <span className="eyebrow"><Sparkles size={16} /> Sua conveniência, a um clique</span>
        <h1>Bebidas geladas e conveniência delivery</h1>
        <p>
          Cervejas, destilados, vinhos, refrigerantes, energéticos, pizzas e gelo. Tudo para curtir em casa ou na praia.
        </p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onOpenCatalog}>Cardápio completo <ChevronRight size={20} /></button>
          <a className="secondary-button" href="#pedido"><MessageCircle size={19} /> Pedir no WhatsApp</a>
        </div>
        <div className="trust-row">
          <span><Bike size={17} /> Entrega rápida</span>
          <span><ShieldCheck size={17} /> Seguro e confiável</span>
          <span><Snowflake size={17} /> Bebidas geladas</span>
        </div>
      </div>

      <div className="hero-stats hero-stats-banner" aria-hidden="true">
        <strong>{productCount}</strong>
        <span>produtos cadastrados</span>
      </div>
    </section>
  );
}

function HomePage({ allProducts, featuredProducts, onAdd, onOpenCatalog, onOpenCart }) {
  return (
    <>
      <Hero productCount={allProducts.length} onOpenCatalog={onOpenCatalog} />

      <section className="featured-section" id="destaques">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Tela inicial</span>
            <h2>Mais pedidos</h2>
          </div>
          <button className="text-link" type="button" onClick={onOpenCatalog}>
            Cardápio completo <ChevronRight size={18} />
          </button>
        </div>
        <div className="featured-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} />
          ))}
        </div>
      </section>

      <section className="benefits-panel" id="pedido">
        <div>
          <Bike size={35} />
          <strong>Entrega rápida</strong>
          <span>Chegou, gelou, curtiu.</span>
        </div>
        <div>
          <Phone size={35} />
          <strong>Pedido fácil</strong>
          <span>Monte o pedido e envie pelo WhatsApp.</span>
        </div>
        <div>
          <Snowflake size={35} />
          <strong>Bebidas geladas</strong>
          <span>Do jeito certo para praia e confraternização.</span>
        </div>
        <div>
          <Clock3 size={35} />
          <strong>Atendimento até tarde</strong>
          <span>Conveniência para quando precisar.</span>
        </div>
      </section>

      <section className="cta-banner">
        <img src={mascots} alt="Mascotes Los Perros" />
        <div>
          <span>Pediu, chegou, aprovou!</span>
          <h2>Sua conveniência favorita, agora online.</h2>
          <p>A tela inicial mostra só os destaques. O cardápio completo fica em uma tela separada, pronto para evoluir para e-commerce.</p>
        </div>
        <button className="primary-button light" type="button" onClick={onOpenCart}>
          Ver carrinho <ShoppingCart size={18} />
        </button>
      </section>
    </>
  );
}

function CatalogPage({ menuData, allProducts, filteredProducts, selectedCategory, searchTerm, onSelectCategory, onSearch, onReset, onAdd, onBackHome }) {
  const selectedCategoryName = selectedCategory === 'todos'
    ? 'Todos os produtos'
    : menuData.categories.find((item) => item.id === selectedCategory)?.name;

  return (
    <section className="catalog-section catalog-page" id="cardapio">
      <button className="back-button" type="button" onClick={onBackHome}>
        <ChevronLeft size={18} /> Voltar para início
      </button>

      <div className="catalog-topbar">
        <div>
          <span className="section-kicker">Cardápio completo</span>
          <h2>{selectedCategoryName}</h2>
          <p>{filteredProducts.length} de {allProducts.length} produtos. Dados carregados do JSON e persistidos no navegador.</p>
        </div>
        <div className="catalog-actions">
          <label className="search-box">
            <Search size={18} />
            <input
              value={searchTerm}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Buscar por produto ou categoria"
            />
          </label>
          <button className="reset-button" type="button" onClick={onReset}>
            <RotateCcw size={17} /> Restaurar JSON
          </button>
        </div>
      </div>

      <div className="category-strip catalog-category-strip" aria-label="Categorias do cardápio completo">
        <button
          className={`category-card ${selectedCategory === 'todos' ? 'is-selected' : ''}`}
          type="button"
          onClick={() => onSelectCategory('todos')}
        >
          <span className="category-symbol" aria-hidden="true"><CheckCircle2 size={30} /></span>
          <span>Todos</span>
          <small>{allProducts.length} itens</small>
        </button>
        {menuData.categories.map((category) => (
          <button
            key={category.id}
            className={`category-card ${selectedCategory === category.id ? 'is-selected' : ''}`}
            type="button"
            onClick={() => onSelectCategory(category.id)}
          >
            <CategoryIcon categoryId={category.id} />
            <span>{category.name}</span>
            <small>{category.products.length} itens</small>
          </button>
        ))}
      </div>

      <div className="filter-row">
        <button
          className={selectedCategory === 'todos' ? 'is-selected' : ''}
          type="button"
          onClick={() => onSelectCategory('todos')}
        >
          Todos <span>{allProducts.length}</span>
        </button>
        {menuData.categories.map((category) => (
          <button
            key={category.id}
            className={selectedCategory === category.id ? 'is-selected' : ''}
            type="button"
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name} <span>{category.products.length}</span>
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>

      {!filteredProducts.length && (
        <div className="empty-state">
          <Search size={34} />
          <h3>Nenhum produto encontrado</h3>
          <p>Tente outro termo de busca ou selecione outra categoria.</p>
        </div>
      )}
    </section>
  );
}

function BottomNavigation({ currentPage, cartQuantity, onHome, onCart, onCatalog }) {
  return (
    <nav className="bottom-navigation" aria-label="Navegação mobile">
      <button className={currentPage === 'home' ? 'is-active' : ''} type="button" onClick={onHome}>
        <Home size={21} />
        <span>Home</span>
      </button>
      <button className="bottom-cart-button" type="button" onClick={onCart} aria-label="Abrir carrinho">
        <ShoppingCart size={25} />
        <span>Carrinho</span>
        {cartQuantity > 0 && <strong>{cartQuantity}</strong>}
      </button>
      <button className={currentPage === 'catalog' ? 'is-active' : ''} type="button" onClick={onCatalog}>
        <BookOpen size={21} />
        <span>Cardápio</span>
      </button>
    </nav>
  );
}


function App() {
  const [menuData, setMenuData] = useLocalStorageState(STORAGE_KEYS.menu, initialMenuData);
  const [cart, setCart] = useLocalStorageState(STORAGE_KEYS.cart, []);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingAgeProduct, setPendingAgeProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(getPageFromLocation);

  const allProducts = useMemo(() => getAllProducts(menuData), [menuData]);
  const featuredProducts = useMemo(() => getFeaturedProducts(menuData, 8), [menuData]);

  const filteredProducts = useMemo(() => {
    const search = normalizeText(searchTerm);

    return allProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'todos' || product.categoryId === selectedCategory;
      const matchesSearch = !search || normalizeText(`${product.name} ${product.description || ''} ${product.categoryName}`).includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, searchTerm, selectedCategory]);

  useEffect(() => {
    function syncPageWithLocation() {
      setCurrentPage(getPageFromLocation());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.addEventListener('popstate', syncPageWithLocation);
    return () => window.removeEventListener('popstate', syncPageWithLocation);
  }, []);

  function navigateTo(page, options = {}) {
    const path = ROUTES[page] || ROUTES.home;

    if (options.resetCatalog) {
      setSelectedCategory('todos');
      setSearchTerm('');
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openFullCatalog() {
    navigateTo('catalog', { resetCatalog: true });
  }

  function goHome() {
    navigateTo('home');
  }

  function hasAgeConfirmed() {
    return window.localStorage.getItem(STORAGE_KEYS.ageConfirmed) === 'true';
  }

  function addToCart(product) {
    if (product.ageRestriction18 && !hasAgeConfirmed()) {
      setPendingAgeProduct(product);
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function confirmAgeAndAdd() {
    window.localStorage.setItem(STORAGE_KEYS.ageConfirmed, 'true');
    const product = pendingAgeProduct;
    setPendingAgeProduct(null);
    if (product) addToCart(product);
  }

  function resetMenuData() {
    setMenuData(initialMenuData);
    setSelectedCategory('todos');
    setSearchTerm('');
  }

  const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="logo-link logo-button" type="button" onClick={goHome} aria-label="Los Perros Market - início">
          <Logo />
        </button>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <button className={currentPage === 'home' ? 'is-active' : ''} type="button" onClick={goHome}>Início</button>
          <button className={currentPage === 'catalog' ? 'is-active' : ''} type="button" onClick={openFullCatalog}>Cardápio completo</button>
          <button type="button" onClick={() => setIsCartOpen(true)}>Pedido</button>
        </nav>
        <button className="cart-button" type="button" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={20} />
          <span>{cartQuantity}</span>
        </button>
        <button className="menu-button" type="button" onClick={currentPage === 'home' ? openFullCatalog : goHome} aria-label="Alternar tela">
          <Menu size={24} />
        </button>
      </header>

      <main>
        {currentPage === 'home' ? (
          <HomePage
            allProducts={allProducts}
            featuredProducts={featuredProducts}
            onAdd={addToCart}
            onOpenCatalog={openFullCatalog}
            onOpenCart={() => setIsCartOpen(true)}
          />
        ) : (
          <CatalogPage
            menuData={menuData}
            allProducts={allProducts}
            filteredProducts={filteredProducts}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            onSelectCategory={setSelectedCategory}
            onSearch={setSearchTerm}
            onReset={resetMenuData}
            onAdd={addToCart}
            onBackHome={goHome}
          />
        )}
      </main>

      <footer className="site-footer">
        <div>
          <Logo variant="main" />
          <p>{menuData.establishment.deliveryNote}</p>
        </div>
        <div>
          <strong>Contato</strong>
          <span>WhatsApp: configurar no .env</span>
          <span>@losperros.market</span>
        </div>
        <div>
          <strong>Cardápio</strong>
          <span>{menuData.categories.length} categorias</span>
          <span>{allProducts.length} produtos cadastrados</span>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onOpen={() => setIsCartOpen(true)}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        establishment={menuData.establishment}
      />

      <BottomNavigation
        currentPage={currentPage}
        cartQuantity={cartQuantity}
        onHome={goHome}
        onCart={() => setIsCartOpen(true)}
        onCatalog={openFullCatalog}
      />

      <AgeConfirmModal
        product={pendingAgeProduct}
        onCancel={() => setPendingAgeProduct(null)}
        onConfirm={confirmAgeAndAdd}
      />
    </div>
  );
}

export default App;
