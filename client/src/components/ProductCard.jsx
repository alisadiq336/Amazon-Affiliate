import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Star, Percent, Award, Sparkles, TrendingUp } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const getImageUrl = (imageObj) => {
    if (!imageObj || !imageObj.url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
    if (imageObj.url.startsWith('http')) return imageObj.url;
    const base = API_URL.replace('/api', '');
    return `${base}${imageObj.url}`;
  };

  const mainImage = product.images?.[0] || { 
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60' 
  };

  // Calculate original price if discount exists
  const hasDiscount = product.discountPercent > 0;
  const originalPrice = hasDiscount 
    ? product.price / (1 - product.discountPercent / 100) 
    : product.price;

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="star-icon filled" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="star-half-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            <Star size={14} className="star-icon" style={{ color: '#334155' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
              <Star size={14} className="star-icon filled" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={14} className="star-icon" style={{ color: '#334155' }} />);
      }
    }
    return stars;
  };

  return (
    <div className="ecommerce-product-card glass-panel">
      {/* Badges Container */}
      <div className="card-badge-row">
        {product.isEditorsPick && (
          <span className="badge editors-pick-badge">
            <Award size={12} />
            <span>Editor's Pick</span>
          </span>
        )}
        {product.isBestSeller && (
          <span className="badge bestseller-badge">
            <Sparkles size={12} />
            <span>Best Seller</span>
          </span>
        )}
        {product.isTrending && (
          <span className="badge trending-badge">
            <TrendingUp size={12} />
            <span>Trending</span>
          </span>
        )}
        {hasDiscount && (
          <span className="badge discount-badge">
            <Percent size={10} />
            <span>{product.discountPercent}% OFF</span>
          </span>
        )}
      </div>

      <div className="card-img-wrapper">
        <img 
          src={getImageUrl(mainImage)} 
          alt={product.name} 
          className="card-image"
          loading="lazy"
        />
        {product.category && (
          <span className="category-overlay-tag">
            {product.category.name}
          </span>
        )}
      </div>

      <div className="card-details">
        <div className="card-meta-row">
          <span className="card-brand-name">{product.brand}</span>
          <div className="card-rating-container">
            <div className="stars-row">{renderStars(product.rating || 4.5)}</div>
            <span className="rating-count">({product.reviewsCount || 24})</span>
          </div>
        </div>

        <h3 className="card-title-text">{product.name}</h3>

        <div className="card-price-row">
          <div className="prices">
            <span className="current-price">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="original-price">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="card-action-buttons">
        <Link to={`/products/${product._id}`} className="btn btn-secondary card-action-btn flex-1">
          <span>Read Review</span>
          <ArrowRight size={14} />
        </Link>
        <a 
          href={product.affiliateLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary card-action-btn amazon-btn flex-1.2"
        >
          <span>Buy on Amazon</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
