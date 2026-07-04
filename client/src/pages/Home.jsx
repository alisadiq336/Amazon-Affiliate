import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, TrendingUp, Compass, Award, Tag, CheckCircle2, ShieldCheck } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [newsSubmitted, setNewsSubmitted] = useState(false);

  const handleNewsSubmit = (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setNewsSubmitted(true);
    setEmailInput('');
  };
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const navigate = useNavigate();

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (!heroSearchInput.trim()) return;
    navigate(`/catalog?search=${encodeURIComponent(heroSearchInput.trim())}`);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/products?limit=100`),
          axios.get(`${API_URL}/categories`)
        ]);
        setProducts(prodRes.data.data.products);
        setCategories(catRes.data.data.categories);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products client-side for highly responsive categorization
  const editorsPicks = products.filter(p => p.isEditorsPick).slice(0, 3);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const trending = products.filter(p => p.isTrending).slice(0, 4);
  const deals = products.filter(p => p.discountPercent > 0).slice(0, 4);

  return (
    <div className="home-page">
      {/* Premium Editorial Hero Banner */}
      <section className="editorial-hero">
        <div className="container hero-grid">
          <div className="hero-editorial-info">
            <div className="editorial-badge">
              <Award size={14} />
              <span>Independent Editorial Reviews</span>
            </div>
            <h1 className="hero-main-title">
              We Find the <span className="gradient-text">Absolute Best</span> Gear So You Don't Have To.
            </h1>
            <p className="hero-paragraph">
              AmzStore features expert-reviewed recommendations, real-world testing specifications, and direct checkouts on Amazon. We only list products that pass our strict testing protocols.
            </p>
            <div className="hero-benefits">
              <div className="benefit-item">
                <CheckCircle2 size={16} className="benefit-icon" />
                <span>Zero Ads or Sponsored Listings</span>
              </div>
              <div className="benefit-item">
                <CheckCircle2 size={16} className="benefit-icon" />
                <span>Thorough Hands-On Lab Testing</span>
              </div>
            </div>
            {/* Hero Quick Search Form */}
            <form onSubmit={handleHeroSearchSubmit} className="search-input-wrapper" style={{ maxWidth: '500px', width: '100%', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search tested gadgets, gear..." 
                value={heroSearchInput}
                onChange={(e) => setHeroSearchInput(e.target.value)}
                style={{ paddingRight: '3.5rem' }}
              />
              <button type="submit" className="search-btn-icon" style={{ right: '0.75rem' }}>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="hero-buttons-row">
              <Link to="/catalog" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                <span>Explore All Reviews</span>
              </Link>
              <a href="#editors-picks" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', opacity: 0.8 }}>
                Read Editors' Picks
              </a>
            </div>
          </div>

          {/* Featured Hero Product Card */}
          {editorsPicks.length > 0 && (
            <div className="hero-featured-showcase glass-panel">
              <div className="showcase-badge">TOP RECOMMENDATION</div>
              <img 
                src={editorsPicks[0].images?.[0]?.url 
                  ? (editorsPicks[0].images[0].url.startsWith('http') 
                    ? editorsPicks[0].images[0].url 
                    : `http://localhost:5000${editorsPicks[0].images[0].url}`)
                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'} 
                alt="" 
                className="showcase-img"
              />
              <div className="showcase-details">
                <span className="showcase-brand">{editorsPicks[0].brand}</span>
                <h3>{editorsPicks[0].name}</h3>
                <p>{editorsPicks[0].description}</p>
                <div className="showcase-action">
                  <Link to={`/products/${editorsPicks[0]._id}`} className="btn btn-primary w-full">
                    Read Our In-Depth Test
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="trust-banner">
        <div className="container trust-wrapper">
          <div className="trust-col">
            <ShieldCheck className="trust-icon" size={24} />
            <div>
              <h4>Verified Affiliate Connections</h4>
              <p>All checkouts are processed securely directly through Amazon's customer network.</p>
            </div>
          </div>
          <div className="trust-col">
            <Award className="trust-icon" size={24} />
            <div>
              <h4>No-Bias Recommendations</h4>
              <p>We receive no payouts or incentives to list specific items. Our selections are purely performance-based.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Editors' Picks Grid */}
      <section id="editors-picks" className="section-block container">
        <div className="section-title-wrapper">
          <div className="title-left">
            <Award className="section-title-icon" size={22} />
            <h2>Editors' Choice Picks</h2>
          </div>
          <p className="section-desc">The absolute best products we've reviewed this season.</p>
        </div>
        
        {loading ? (
          <div className="editorial-cards-grid">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton skeleton-img"></div>
                <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-price"></div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <div className="skeleton skeleton-button" style={{ flex: 1 }}></div>
                  <div className="skeleton skeleton-button" style={{ flex: 1.2 }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="editorial-cards-grid">
            {editorsPicks.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Categories Showcase */}
      <section className="section-block categories-showcase container">
        <div className="section-title-wrapper">
          <div className="title-left">
            <Compass className="section-title-icon" size={22} />
            <h2>Browse Categories</h2>
          </div>
          <p className="section-desc">Find tested gear grouped by specific departments.</p>
        </div>
        <div className="categories-grid-row">
          {categories.map((category) => (
            <Link 
              key={category._id} 
              to={`/catalog?category=${category.slug}`} 
              className="department-card glass-panel"
            >
              <h3>{category.name}</h3>
              <div className="card-explore-action">
                <span>Browse Products</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals of the Day (Discounted Products) */}
      {deals.length > 0 && (
        <section className="section-block deals-section-block container">
          <div className="section-title-wrapper">
            <div className="title-left">
              <Tag className="section-title-icon" size={22} />
              <h2>Limited-Time Deals</h2>
            </div>
            <p className="section-desc">Verified sales and discounts currently live on Amazon.</p>
          </div>
          <div className="products-grid">
            {deals.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers & Trending Side-by-Side */}
      <section className="section-block container">
        <div className="grid-two-columns">
          {/* Best Sellers */}
          <div>
            <div className="section-title-wrapper compact">
              <div className="title-left">
                <Sparkles className="section-title-icon" size={20} />
                <h2>Best Sellers</h2>
              </div>
            </div>
            <div className="half-products-grid">
              {bestSellers.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Trending */}
          <div>
            <div className="section-title-wrapper compact">
              <div className="title-left">
                <TrendingUp className="section-title-icon" size={20} />
                <h2>Trending Gadgets</h2>
              </div>
            </div>
            <div className="half-products-grid">
              {trending.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Banner */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Ahead of the Curve</h2>
            <p>Get unbiased test reviews, product deals, and buying advice sent directly to your inbox weekly.</p>
            {newsSubmitted ? (
              <div className="alert-success-text" style={{ color: '#10b981', fontWeight: 600, marginTop: '1rem' }}>
                ✓ Thank you for subscribing! Check your inbox to verify your profile.
              </div>
            ) : (
              <form onSubmit={handleNewsSubmit} className="newsletter-form">
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter your email address" 
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
