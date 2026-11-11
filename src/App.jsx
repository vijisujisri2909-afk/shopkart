import { useEffect, useMemo, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db, firebaseConfigured } from './firebase.js'
import './App.css'

const PRODUCTS = [
  { id: 1, name: 'Classic Cotton Kurta', category: 'Fashion', price: 899, oldPrice: 1499, rating: 4.5, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85', description: 'Soft, breathable cotton for effortless everyday style.' },
  { id: 2, name: 'Everyday Denim Jacket', category: 'Fashion', price: 1699, oldPrice: 2599, rating: 4.3, image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=85', description: 'A timeless layer with a relaxed, comfortable fit.' },
  { id: 3, name: 'Wireless Noise-Cancel Headphones', category: 'Electronics', price: 2499, oldPrice: 3999, rating: 4.6, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85', description: 'Immersive sound and all-day listening comfort.' },
  { id: 4, name: 'Smart Fitness Watch', category: 'Electronics', price: 3299, oldPrice: 4999, rating: 4.4, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85', description: 'Track your activity, sleep, and everyday goals.' },
  { id: 5, name: 'Aurora 5G Smartphone', category: 'Mobiles', price: 18999, oldPrice: 24999, rating: 4.5, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=85', description: 'Fast 5G performance with a brilliant edge-to-edge display.' },
  { id: 6, name: 'Everyday Wireless Earbuds', category: 'Electronics', price: 1499, oldPrice: 2499, rating: 4.2, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=85', description: 'Pocket-sized sound with a secure, comfortable fit.' },
  { id: 7, name: 'Minimal Ceramic Table Lamp', category: 'Home & Kitchen', price: 1299, oldPrice: 1999, rating: 4.4, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85', description: 'Warm ambient light for a calmer evening at home.' },
  { id: 8, name: 'Linen Cushion Cover Set', category: 'Home & Kitchen', price: 699, oldPrice: 1199, rating: 4.1, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=85', description: 'A set of two textured covers to refresh your space.' },
  { id: 9, name: 'Hydrating Skincare Essentials', category: 'Beauty', price: 999, oldPrice: 1599, rating: 4.5, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85', description: 'A gentle daily-care set made for a healthy glow.' },
  { id: 10, name: 'Everyday Running Shoes', category: 'Footwear', price: 1899, oldPrice: 2999, rating: 4.3, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85', description: 'Light cushioning and a grippy sole for every run.' },
  { id: 11, name: 'Studio Over-Ear Headphones', category: 'Electronics', price: 2799, oldPrice: 4299, rating: 4.6, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=85', description: 'Balanced audio, plush earcups, and a foldable design.' },
  { id: 12, name: 'Slim Leather Wallet', category: 'Fashion', price: 799, oldPrice: 1299, rating: 4.2, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=85', description: 'A compact everyday wallet with room for the essentials.' },
  { id: 13, name: 'Brew-at-Home Coffee Maker', category: 'Home & Kitchen', price: 2199, oldPrice: 3499, rating: 4.4, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85', description: 'Make your favorite rich, fresh coffee every morning.' },
  { id: 14, name: 'Portrait Camera Smartphone', category: 'Mobiles', price: 22999, oldPrice: 29999, rating: 4.7, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=85', description: 'Capture crisp portraits and vivid color wherever you go.' },
  { id: 15, name: 'Daily Glow Beauty Kit', category: 'Beauty', price: 1199, oldPrice: 1899, rating: 4.3, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=85', description: 'Your easy-to-use essentials for a fresh daily routine.' },
  { id: 16, name: 'Classic White Sneakers', category: 'Footwear', price: 1599, oldPrice: 2499, rating: 4.4, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=85', description: 'An easy, versatile pair made for all-day comfort.' },
]

const CATEGORIES = [
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85', icon: '✦' },
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=700&q=85', icon: '⌁' },
  { name: 'Mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85', icon: '▯' },
  { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=85', icon: '⌂' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85', icon: '✿' },
  { name: 'Footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85', icon: '↗' },
]

const FILTERS = ['All', 'Fashion', 'Electronics', 'Mobiles', 'Home']
const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
const CURRENT_YEAR = new Date().getFullYear()

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('shopkart-cart') || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function CartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L22 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
}

function ProductCard({ product, isWishlisted, onAdd, onBuy, onWishlist }) {
  const discount = product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0
  return (
    <article className="product-card">
      <div className="product-card__photo">
        <img src={product.image} alt={product.name} loading="lazy" />
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        <button className={`wishlist-button${isWishlisted ? ' is-active' : ''}`} type="button" onClick={() => onWishlist(product.id)} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={isWishlisted}>{isWishlisted ? '♥' : '♡'}</button>
      </div>
      <div className="product-card__details">
        <span className="product-card__category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-rating"><span aria-label={`${product.rating} out of 5 stars`}>★</span> {product.rating} <span className="rating-count">({Math.floor(product.rating * 83)} reviews)</span></p>
        <p className="product-prices"><strong>{money(product.price)}</strong><del>{money(product.oldPrice)}</del></p>
        <div className="product-card__actions">
          <button type="button" className="button button--outline" onClick={() => onAdd(product)}>Add to cart</button>
          <button type="button" className="button button--orange" onClick={() => onBuy(product)}>Buy now</button>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [cartItems, setCartItems] = useState(readSavedCart)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authUser, setAuthUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [productError, setProductError] = useState('')
  const [productBusy, setProductBusy] = useState(false)
  const [cloudProducts, setCloudProducts] = useState([])
  const [productsError, setProductsError] = useState('')
  const [contactSent, setContactSent] = useState(false)
  const [contactError, setContactError] = useState('')

  useEffect(() => {
    localStorage.setItem('shopkart-cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    if (!auth) return undefined
    return onAuthStateChanged(
      auth,
      setAuthUser,
      (error) => setAuthError(`Unable to check your sign-in status: ${error.message}`),
    )
  }, [])

  useEffect(() => {
    if (!db) return undefined
    return onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
      setCloudProducts(snapshot.docs.map((product) => ({ ...product.data(), id: product.id })))
        setProductsError('')
      },
      (error) => setProductsError(`Unable to load added products: ${error.message}`),
    )
  }, [])

  useEffect(() => {
    if (!isCartOpen && !checkoutOpen && !orderOpen && !loginOpen && !addProductOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsCartOpen(false)
        setCheckoutOpen(false)
        setOrderOpen(false)
        setLoginOpen(false)
        setAddProductOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isCartOpen, checkoutOpen, orderOpen, loginOpen, addProductOpen])

  const products = useMemo(() => [...PRODUCTS, ...cloudProducts], [cloudProducts])
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'All' || (category === 'Home' ? product.category === 'Home & Kitchen' : product.category === category)
      return matchesCategory && (!query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query))
    })
    if (sort === 'low') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'high') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [category, products, search, sort])

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function addToCart(product) {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }]
    })
  }

  function updateQuantity(productId, amount) {
    setCartItems((current) => current
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0))
  }

  function chooseCategory(name) {
    setCategory(name === 'Home & Kitchen' ? 'Home' : name)
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  function buyNow(product) {
    addToCart(product)
    setIsCartOpen(false)
    setCheckoutOpen(true)
  }

  function placeOrder(event) {
    event.preventDefault()
    if (cartItems.length === 0) return
    setCheckoutOpen(false)
    setIsCartOpen(false)
    setCartItems([])
    setOrderOpen(true)
  }

  function sendContact(event) {
    event.preventDefault()
    setContactError('')
    setContactSent(true)
    event.currentTarget.reset()
  }

  function getFirebaseError(error) {
    const messages = {
      'auth/email-already-in-use': 'An account already exists for this email. Try signing in instead.',
      'auth/invalid-credential': 'That email and password combination was not recognized.',
      'auth/invalid-email': 'Enter a valid email address.',
      'auth/operation-not-allowed': 'Email/password sign-in is disabled in Firebase Authentication settings.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
      'permission-denied': 'Firebase denied this request. Check your Firestore security rules.',
      'unavailable': 'Firebase is temporarily unavailable. Please try again.',
    }
    return messages[error.code] || error.message || 'Something went wrong. Please try again.'
  }

  async function submitAuth(event) {
    event.preventDefault()
    setAuthError('')
    if (!auth) {
      setAuthError('Firebase is not configured. Add your Firebase values to .env.local and restart the app.')
      return
    }
    setAuthBusy(true)
    const form = event.currentTarget
    const email = form.elements.email.value.trim()
    const password = form.elements.password.value
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      setLoginOpen(false)
      form.reset()
    } catch (error) {
      setAuthError(getFirebaseError(error))
    } finally {
      setAuthBusy(false)
    }
  }

  async function submitProduct(event) {
    event.preventDefault()
    setProductError('')
    if (!db || !authUser) {
      setProductError('Sign in with a configured Firebase account before adding a product.')
      return
    }
    const form = event.currentTarget
    const formData = new FormData(form)
    const price = Number(formData.get('price'))
    const oldPriceValue = formData.get('oldPrice')
    const oldPrice = oldPriceValue ? Number(oldPriceValue) : price
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(oldPrice) || oldPrice < price) {
      setProductError('Enter a valid price and an original price that is at least the selling price.')
      return
    }
    setProductBusy(true)
    try {
      await addDoc(collection(db, 'products'), {
        name: formData.get('name').trim(),
        category: formData.get('category'),
        price,
        oldPrice,
        rating: 4.5,
        image: formData.get('image').trim(),
        description: formData.get('description').trim(),
        ownerId: authUser.uid,
        createdAt: serverTimestamp(),
      })
      form.reset()
      setAddProductOpen(false)
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
      setProductError(getFirebaseError(error))
    } finally {
      setProductBusy(false)
    }
  }

  async function handleSignOut() {
    if (!auth) return
    try {
      await signOut(auth)
    } catch (error) {
      setAuthError(`Unable to sign out: ${getFirebaseError(error)}`)
    }
  }

  function openAuth(mode = 'login') {
    setAuthMode(mode)
    setAuthError('')
    setLoginOpen(true)
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <>
      <div className="announcement">The festive season starts here — extra savings on your favourites!</div>
      <header className="site-header">
        <div className="nav-shell">
          <a className="brand" href="#home" aria-label="ShopKart home"><span className="brand__mark">S</span>Shop<span>Kart</span></a>
          <button className="menu-toggle" type="button" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}><span /><span /><span /></button>
          <nav className={`main-nav${isMenuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            {[['Home', '#home'], ['Shop', '#shop'], ['Categories', '#categories'], ['Deals', '#deals'], ['About', '#about'], ['Contact', '#contact']].map(([label, href]) => <a key={label} href={href} onClick={closeMenu}>{label}</a>)}
          </nav>
          <form className="header-search" role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
            <input type="search" aria-label="Search products" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} />
            {search && <button type="button" aria-label="Clear search" onClick={() => setSearch('')}>×</button>}
          </form>
          <div className="nav-actions">
            <button type="button" className="cart-trigger" aria-label={`Open cart, ${itemCount} items`} onClick={() => setIsCartOpen(true)}><CartIcon /><span>Cart</span><b>{itemCount}</b></button>
            {authUser ? <>
              <button type="button" className="login-button nav-secondary" onClick={() => { setProductError(''); setAddProductOpen(true) }}>Add Product</button>
              <button type="button" className="login-button nav-signout" onClick={handleSignOut}>Sign out</button>
            </> : <button type="button" className="login-button" onClick={() => openAuth()}>Login</button>}
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero__image" role="img" aria-label="Festive shopping bags and gifts" />
          <div className="hero__veil" />
          <div className="hero__content">
            <span className="eyebrow eyebrow--light">The biggest celebration of the year</span>
            <h1>Big Diwali Sale<br />Up to <em>50% OFF</em></h1>
            <p>Find something wonderful for everyone. Celebrate more, spend less.</p>
            <a href="#shop" className="button button--orange button--large">Shop now <span aria-hidden="true">→</span></a>
            <div className="hero__note"><span>✦</span> Limited-time festive offers</div>
          </div>
          <div className="hero__offer"><small>FESTIVE<br />SPECIAL</small><strong>50<sup>%</sup></strong><span>OFF</span></div>
        </section>

        <section className="benefit-strip" aria-label="Shopping benefits">
          {[['↗', 'Free Delivery', 'On orders over ₹999'], ['₹', 'Cash on Delivery', 'Pay when it arrives'], ['↻', 'Easy Returns', '7-day return window'], ['◇', 'Secure Payment', 'Your details stay safe']].map(([icon, title, detail]) => <article className="benefit" key={title}><span className="benefit__icon">{icon}</span><div><h2>{title}</h2><p>{detail}</p></div></article>)}
        </section>

        <section className="section categories-section" id="categories">
          <div className="section-heading"><div><span className="eyebrow">Find your favourites</span><h2>Shop by category</h2></div><a className="text-link" href="#shop">Explore all <span>→</span></a></div>
          <div className="category-grid">{CATEGORIES.map((item) => <button className="category-card" type="button" key={item.name} onClick={() => chooseCategory(item.name)}><img src={item.image} alt="" loading="lazy" /><span className="category-card__shade" /><span className="category-card__icon">{item.icon}</span><span className="category-card__name">{item.name}</span><span className="category-card__arrow">↗</span></button>)}</div>
        </section>

        <section className="deal-banner" id="deals">
          <div><span className="eyebrow eyebrow--light">Good things don't wait</span><h2>Make room for a little more joy.</h2><p>Festive picks, lovely prices, and a little something for everyone.</p></div>
          <a className="button button--light" href="#shop">Discover the deals <span>→</span></a>
          <span className="deal-banner__sparkle">✳</span>
        </section>

        <section className="section products-section" id="shop">
          <div className="section-heading products-heading"><div><span className="eyebrow">Handpicked for you</span><h2>Our bestsellers</h2><p className="section-subtitle">A few customer favourites, at prices worth celebrating.</p></div><label className="sort-control">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option></select></label></div>
          <div className="filter-row" role="group" aria-label="Filter products by category">{FILTERS.map((filter) => <button className={`filter-chip${category === filter ? ' is-selected' : ''}`} type="button" key={filter} onClick={() => setCategory(filter)} aria-pressed={category === filter}>{filter === 'Home' ? 'Home & Kitchen' : filter}</button>)}</div>
          {productsError && <p className="form-message form-message--error" role="alert">{productsError}</p>}
          {!firebaseConfigured && <p className="setup-notice" role="status">Configure Firebase to enable accounts and product publishing. See the project README.</p>}
          {authError && !loginOpen && <p className="form-message form-message--error" role="alert">{authError}</p>}
          <p className="results-count" aria-live="polite">Showing {visibleProducts.length} of {products.length} products{search && <> for “{search}”</>}</p>
          {visibleProducts.length > 0 ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} isWishlisted={wishlist.includes(product.id)} onAdd={addToCart} onBuy={buyNow} onWishlist={(id) => setWishlist((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id])} />)}</div> : <div className="empty-search"><span>⌕</span><h3>No products found</h3><p>Try a different search or category.</p><button className="button button--outline" type="button" onClick={() => { setSearch(''); setCategory('All') }}>Clear filters</button></div>}
        </section>

        <section className="about-section" id="about">
          <div className="about-image"><img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1000&q=85" alt="A cheerful selection of gifts ready to be unwrapped" loading="lazy" /></div>
          <div className="about-copy"><span className="eyebrow">A little more joy, every day</span><h2>Good finds.<br /><em>Good feelings.</em></h2><p>At ShopKart, we believe the best shopping feels simple. Discover thoughtful picks across the things you love, fair prices you can feel good about, and friendly service from checkout to doorstep.</p><a className="text-link" href="#categories">Explore our collections <span>→</span></a></div>
        </section>

        <section className="newsletter">
          <div><span className="eyebrow eyebrow--light">A little inbox sunshine</span><h2>Good deals look good on you.</h2><p>Join our list for fresh finds and special offers.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset(); window.alert('Thanks for subscribing to ShopKart!') }}><label className="visually-hidden" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required /><button className="button button--orange" type="submit">Sign me up <span>→</span></button></form>
        </section>

        <section className="contact-section section" id="contact">
          <div className="section-heading"><div><span className="eyebrow">We would love to hear from you</span><h2>Let's talk</h2><p className="section-subtitle">Questions, ideas, or just saying hello? We're here for it.</p></div></div>
          <div className="contact-layout">
            <form className="contact-form" onSubmit={sendContact}>
              <label>Your name<input name="name" type="text" placeholder="How should we call you?" required /></label>
              <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
              <label>Your message<textarea name="message" rows="4" placeholder="Tell us what's on your mind..." required /></label>
              {contactError && <p className="form-message form-message--error" role="alert">{contactError}</p>}
              {contactSent && <p className="form-message" role="status">Thanks for reaching out! We'll be in touch soon.</p>}
              <button className="button button--orange" type="submit">Send message <span>→</span></button>
            </form>
            <div className="contact-details"><h3>Come say hello</h3><p><span>☎</span><a href="tel:+914424681234">+91 44 2468 1234</a></p><p><span>✉</span><a href="mailto:hello@shopkart.in">hello@shopkart.in</a></p><p><span>⌖</span>Chennai, Tamil Nadu, India</p><div className="map-frame"><iframe title="Map showing Chennai, Tamil Nadu" src="https://maps.google.com/maps?q=Chennai%2C%20Tamil%20Nadu%2C%20India&t=&z=12&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand"><a className="brand brand--footer" href="#home"><span className="brand__mark">S</span>Shop<span>Kart</span></a><p>Everyday favourites, delightful deals, and a little more joy in every delivery.</p><div className="social-links"><a href="#contact" aria-label="Instagram">ig</a><a href="#contact" aria-label="Facebook">f</a><a href="#contact" aria-label="X">x</a></div></div>
          <div><h3>Explore</h3><a href="#about">About us</a><a href="#shop">Shop all</a><a href="#deals">Festive deals</a><a href="#contact">Contact</a></div>
          <div><h3>Popular categories</h3>{CATEGORIES.map((item) => <a href="#shop" key={item.name} onClick={() => chooseCategory(item.name)}>{item.name}</a>)}</div>
          <div><h3>We're here to help</h3><a href="tel:+914424681234">+91 44 2468 1234</a><a href="mailto:hello@shopkart.in">hello@shopkart.in</a><p>Monday–Saturday<br />9:00 AM–6:00 PM IST</p></div>
        </div>
        <div className="footer-bottom"><span>© {CURRENT_YEAR} ShopKart. Made for good finds.</span><span>Secure shopping <b>·</b> Easy returns <b>·</b> Happy deliveries</span></div>
      </footer>

      {isCartOpen && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCartOpen(false) }}><aside className="drawer" id="shopping-cart" aria-label="Shopping cart"><div className="drawer__header"><div><span className="eyebrow">Your good finds</span><h2>Your cart <small>({itemCount})</small></h2></div><button type="button" className="icon-close" aria-label="Close cart" onClick={() => setIsCartOpen(false)}>×</button></div>{cartItems.length ? <><div className="drawer__items">{cartItems.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt={item.name} /><div className="cart-item__details"><h3>{item.name}</h3><p>{money(item.price)}</p><div className="quantity-control"><button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, 1)}>+</button></div></div><button type="button" className="remove-item" onClick={() => setCartItems((current) => current.filter((entry) => entry.id !== item.id))}>Remove</button></article>)}</div><div className="drawer__footer"><p><span>Subtotal</span><strong>{money(cartTotal)}</strong></p><small>Delivery is calculated at checkout.</small><button type="button" className="button button--orange button--full" onClick={() => { setIsCartOpen(false); setCheckoutOpen(true) }}>Continue to checkout <span>→</span></button><button type="button" className="continue-shopping" onClick={() => setIsCartOpen(false)}>Continue shopping</button></div></> : <div className="cart-empty"><div className="cart-empty__icon"><CartIcon /></div><h3>Your cart is empty</h3><p>Looks like you haven't found your favourites yet.</p><button type="button" className="button button--orange" onClick={() => { setIsCartOpen(false); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}>Start exploring <span>→</span></button></div>}</aside></div>}

      {checkoutOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false) }}><section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><div className="modal-heading"><div><span className="eyebrow">Almost yours</span><h2 id="checkout-title">Checkout</h2></div><button type="button" className="icon-close" aria-label="Close checkout" onClick={() => setCheckoutOpen(false)}>×</button></div><p className="checkout-summary">{itemCount} {itemCount === 1 ? 'item' : 'items'} <strong>{money(cartTotal)}</strong></p><form className="checkout-form" onSubmit={placeOrder}><label>Full name<input name="name" type="text" autoComplete="name" placeholder="Your full name" required /></label>      <label>Phone number<input name="phone" type="tel" autoComplete="tel" pattern="[0-9]{8,15}" placeholder="9876543210" required /></label><label>Delivery address<textarea name="address" autoComplete="street-address" rows="3" placeholder="House number, street, city, PIN code" required /></label><label>Payment method<select name="payment" required><option value="cod">Cash on Delivery</option><option value="upi">UPI</option><option value="card">Credit / Debit Card</option></select></label><button className="button button--orange button--full" type="submit">Place order · {money(cartTotal)} <span>→</span></button><p className="secure-note">◇ Your order details are kept secure.</p></form></section></div>}

      {orderOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOrderOpen(false) }}><section className="success-modal" role="dialog" aria-modal="true" aria-labelledby="order-title"><button type="button" className="icon-close" aria-label="Close confirmation" onClick={() => setOrderOpen(false)}>×</button><span className="success-check">✓</span><span className="eyebrow">Thanks for shopping with us</span><h2 id="order-title">Order Placed Successfully</h2><p>Your order is confirmed. We can't wait for it to reach you!</p><button type="button" className="button button--orange" onClick={() => setOrderOpen(false)}>Continue shopping <span>→</span></button></section></div>}

      {loginOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setLoginOpen(false) }}><section className="checkout-modal login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title"><div className="modal-heading"><div><span className="eyebrow">Welcome to ShopKart</span><h2 id="login-title">{authMode === 'signup' ? 'Create account' : 'Sign in'}</h2></div><button type="button" className="icon-close" aria-label="Close sign in" onClick={() => setLoginOpen(false)}>×</button></div><p className="login-note">{authMode === 'signup' ? 'Create an account to publish products to the ShopKart catalog.' : 'Sign in to your ShopKart account to publish products.'}</p>{!firebaseConfigured && <p className="form-message form-message--error" role="alert">Firebase is not configured. Copy .env.example to .env.local, add your Firebase project values, and restart the app.</p>}{authError && <p className="form-message form-message--error" role="alert">{authError}</p>}<form className="checkout-form" onSubmit={submitAuth}><label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label><label>Password<input type="password" name="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Enter your password'} minLength="6" required /></label><button className="button button--orange button--full" type="submit" disabled={authBusy || !firebaseConfigured}>{authBusy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Continue'} <span>→</span></button></form><p className="auth-switch">{authMode === 'signup' ? 'Already have an account?' : 'New to ShopKart?'} <button type="button" onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setAuthError('') }}>{authMode === 'signup' ? 'Sign in' : 'Create an account'}</button></p></section></div>}

      {addProductOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddProductOpen(false) }}><section className="checkout-modal product-modal" role="dialog" aria-modal="true" aria-labelledby="add-product-title"><div className="modal-heading"><div><span className="eyebrow">Grow the collection</span><h2 id="add-product-title">Add a product</h2></div><button type="button" className="icon-close" aria-label="Close add product" onClick={() => setAddProductOpen(false)}>×</button></div>{productError && <p className="form-message form-message--error" role="alert">{productError}</p>}<form className="checkout-form" onSubmit={submitProduct}><label>Product name<input name="name" type="text" maxLength="100" placeholder="Product name" required /></label><label>Category<select name="category" defaultValue={CATEGORIES[0].name}>{CATEGORIES.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label><div className="product-price-fields"><label>Price (₹)<input name="price" type="number" min="1" step="1" placeholder="999" required /></label><label>Original price (₹)<input name="oldPrice" type="number" min="1" step="1" placeholder="Optional" /></label></div><label>Image URL<input name="image" type="url" maxLength="1000" placeholder="https://example.com/product.jpg" required /></label><label>Description<textarea name="description" rows="3" maxLength="500" placeholder="Describe the product" required /></label><button className="button button--orange button--full" type="submit" disabled={productBusy}>{productBusy ? 'Saving product…' : 'Save product'} <span>→</span></button></form></section></div>}
    </>
  )
}

export default App
