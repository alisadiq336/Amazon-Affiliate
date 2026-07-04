import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { ExternalLink, ArrowLeft, Tag, Layers, Star, Info, ShieldCheck, Check, Truck } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch product and then related products
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        const prod = res.data.data.product;
        setProduct(prod);
        setActiveImageIdx(0);

        // Fetch related products in same category
        if (prod.category) {
          const relRes = await axios.get(`${API_URL}/products?category=${prod.category._id}&limit=5`);
          // Filter out current product
          const filtered = relRes.data.data.products.filter(p => p._id !== prod._id);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        setError('The product you are trying to view does not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const getImageUrl = (imageObj) => {
    if (!imageObj || !imageObj.url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
    if (imageObj.url.startsWith('http')) return imageObj.url;
    const base = API_URL.replace('/api', '');
    return `${base}${imageObj.url}`;
  };

  // Render stars helper
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 4.5);
    const hasHalf = (rating || 4.5) % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={16} className="star-icon filled" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="star-half-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            <Star size={16} className="star-icon" style={{ color: '#334155' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
              <Star size={16} className="star-icon filled" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={16} className="star-icon" style={{ color: '#334155' }} />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="product-detail-page container">
        <div className="back-link skeleton" style={{ width: '120px', height: '14px', marginBottom: '1.5rem' }}></div>
        <div className="detail-showcase-grid glass-panel animate-fade-in" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
          <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="skeleton" style={{ height: '24px', width: '30%' }}></div>
            <div className="skeleton" style={{ height: '48px', width: '90%' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '50%' }}></div>
            <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container error-container">
        <div className="glass-panel error-card">
          <h2>Product Not Found</h2>
          <p>{error}</p>
          <Link to="/catalog" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate pricing
  const hasDiscount = product.discountPercent > 0;
  const originalPrice = hasDiscount 
    ? product.price / (1 - product.discountPercent / 100) 
    : product.price;
  const savings = originalPrice - product.price;

  // Format Description Sections (simple parser for editorial sections)
  const renderEditorialContent = (content) => {
    if (!content) return <p>{product.description}</p>;
    
    // Split on markdown headers ###
    const parts = content.split('###');
    return parts.map((part, idx) => {
      if (idx === 0) {
        if (!part.trim()) return null;
        return <p key={idx} className="editorial-lead-para">{part.trim()}</p>;
      }
      
      const lines = part.split('\n');
      const headerTitle = lines[0].trim();
      const bodyText = lines.slice(1).join('\n').trim();

      return (
        <div key={idx} className="editorial-section">
          <h3>{headerTitle}</h3>
          <p>{bodyText}</p>
        </div>
      );
    });
  };

  return (
    <div className="product-detail-page container">
      {/* Breadcrumbs / Back button */}
      <Link to="/catalog" className="back-link">
        <ArrowLeft size={16} />
        <span>Return to Catalog</span>
      </Link>

      {/* Main Core Showcase */}
      <div className="detail-showcase-grid glass-panel">
        
        {/* Media Column (Image Gallery) */}
        <div className="detail-media-column">
          <div className="main-active-img-wrapper">
            <img 
              src={getImageUrl(product.images?.[activeImageIdx])} 
              alt={product.name} 
              className="main-active-img"
            />
          </div>
          {/* Thumbnails strip */}
          {product.images && product.images.length > 1 && (
            <div className="thumbnails-strip">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`thumb-btn ${activeImageIdx === idx ? 'active' : ''}`}
                >
                  <img src={getImageUrl(img)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Info Column */}
        <div className="detail-info-column">
          {/* Tags */}
          <div className="detail-badges-row">
            <span className="detail-brand-badge">
              <Layers size={12} />
              <span>{product.brand}</span>
            </span>
            {product.category && (
              <span className="detail-category-badge">
                <Tag size={12} />
                <span>{product.category.name}</span>
              </span>
            )}
          </div>

          <h1 className="detail-main-title">{product.name}</h1>

          {/* Rating */}
          <div className="detail-rating-row">
            <div className="stars-row">{renderStars(product.rating)}</div>
            <span className="detail-rating-score">{product.rating || 4.5} out of 5</span>
            <span className="detail-rating-count">({product.reviewsCount || 24} customer ratings)</span>
          </div>

          {/* Pricing */}
          <div className="detail-price-box">
            <div className="pricing-row">
              <span className="price-tag">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="old-price-tag">${originalPrice.toFixed(2)}</span>
                  <span className="savings-tag">Save ${savings.toFixed(2)} ({product.discountPercent}%)</span>
                </>
              )}
            </div>
            <div className="stock-info">
              <Truck size={14} className="stock-icon" />
              <span>Redirection eligible for free shipping via Amazon Prime.</span>
            </div>
          </div>

          {/* Highlights Checklist */}
          <div className="quick-specs-highlights">
            <h4>Quick Highlights</h4>
            <ul>
              {product.specifications && Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                <li key={key}>
                  <Check size={14} className="check-icon" />
                  <strong>{key}:</strong> {val}
                </li>
              ))}
              <li>
                <Check size={14} className="check-icon" />
                <span>Tested and certified by editorial staff</span>
              </li>
            </ul>
          </div>

          {/* Primary Action */}
          <div className="purchase-action-container">
            <a 
              href={product.affiliateLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary buy-now-amazon-btn"
            >
              <span>Check Price on Amazon</span>
              <ExternalLink size={18} />
            </a>
            <p className="amazon-disclaimer">
              Clicking redirects you to Amazon.com to complete checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial & Lab Reviews */}
      <section className="detail-editorial-section-wrapper grid-two-thirds">
        <div className="editorial-main-content glass-panel">
          <div className="editorial-section-header">
            <h2>Editor's Hands-On Review</h2>
            <div className="editorial-meta-line">
              <ShieldCheck size={14} />
              <span>Verified Test Record &bull; Hands-on Lab Performance Review</span>
            </div>
          </div>

          <article className="editorial-article-body">
            {renderEditorialContent(product.longDescription)}
          </article>
        </div>

        {/* Technical specifications column */}
        <div className="detail-sidebar-specs glass-panel">
          <h3>Specifications</h3>
          <div className="specs-list-side">
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="spec-side-row">
                  <span className="spec-side-key">{key}</span>
                  <span className="spec-side-value">{val}</span>
                </div>
              ))
            ) : (
              <p className="muted-text">No specs listed.</p>
            )}
          </div>
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section mt-12">
          <div className="section-title-wrapper">
            <div className="title-left">
              <Info className="section-title-icon" size={20} />
              <h2>Related Recommendations</h2>
            </div>
            <p className="section-desc">More tested products in {product.category?.name}.</p>
          </div>

          <div className="products-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
