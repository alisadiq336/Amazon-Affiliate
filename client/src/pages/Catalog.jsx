import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Search, Filter, RotateCcw, Grid, List, Star, CheckSquare, Square, HelpCircle } from 'lucide-react';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: grid or list
  const [viewMode, setViewMode] = useState('grid');

  // URL search and department params
  const searchVal = searchParams.get('search') || '';
  const categoryVal = searchParams.get('category') || '';
  const sortVal = searchParams.get('sort') || '';

  // Local filter states
  const [searchInput, setSearchInput] = useState(searchVal);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState('all'); 
  const [minRating, setMinRating] = useState(0); 
  const [badgeFilter, setBadgeFilter] = useState({
    editorsPick: false,
    bestSeller: false,
    onSale: false
  });

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 products per page is perfect for listing layout

  // Sync search input if URL changes
  useEffect(() => {
    setSearchInput(searchVal);
  }, [searchVal]);

  // Fetch departments list
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products database matching category/search/sort from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { limit: 100 }; // Fetch a large batch to filter/paginate client-side
        if (searchVal) params.search = searchVal;
        if (categoryVal) params.category = categoryVal;
        if (sortVal) params.sort = sortVal;

        const res = await axios.get(`${API_URL}/products`, { params });
        setProducts(res.data.data.products);
        setCurrentPage(1); // Reset page on query change
      } catch (err) {
        console.error('Error loading products catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchVal, categoryVal, sortVal]);

  // Extract unique brands for filtering from loaded products
  const availableBrands = [...new Set(products.map(p => p.brand))].sort();

  // Apply filters client-side
  const filteredProducts = products.filter(product => {
    // Brand checklist filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }

    // Price intervals filter
    if (priceRange === 'under25' && product.price >= 25) return false;
    if (priceRange === '25to50' && (product.price < 25 || product.price > 50)) return false;
    if (priceRange === '50to100' && (product.price < 50 || product.price > 100)) return false;
    if (priceRange === '100plus' && product.price < 100) return false;

    // Minimum rating filter
    if (minRating > 0 && (product.rating || 4.5) < minRating) return false;

    // Marketing tag filters
    if (badgeFilter.editorsPick && !product.isEditorsPick) return false;
    if (badgeFilter.bestSeller && !product.isBestSeller) return false;
    if (badgeFilter.onSale && !(product.discountPercent > 0)) return false;

    return true;
  });

  // Calculate client pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1); // Reset pagination
  };

  const toggleBadge = (key) => {
    setBadgeFilter(prev => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1); // Reset pagination
  };

  const handlePriceChange = (val) => {
    setPriceRange(val);
    setCurrentPage(1); // Reset pagination
  };

  const handleRatingChange = (stars) => {
    setMinRating(minRating === stars ? 0 : stars);
    setCurrentPage(1); // Reset pagination
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSelectedBrands([]);
    setPriceRange('all');
    setMinRating(0);
    setBadgeFilter({ editorsPick: false, bestSeller: false, onSale: false });
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="catalog-page container">
      {/* Editorial Header */}
      <header className="catalog-header-redesign">
        <h1>Consumer Product Directory</h1>
        <p>Curated recommendations backed by thousands of hours of testing. Find the best product for your needs.</p>
      </header>

      {/* Toolbar */}
      <div className="catalog-toolbar glass-panel">
        <div className="toolbar-info">
          <span>Showing <strong>{paginatedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> items</span>
        </div>
        <div className="toolbar-actions">
          {/* Sorting */}
          <div className="toolbar-sort">
            <span className="sort-label">Sort:</span>
            <select 
              className="toolbar-select"
              value={sortVal}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              <option value="">Default (Featured)</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Highest Rated</option>
            </select>
          </div>

          {/* Grid/List switch */}
          <div className="view-mode-buttons">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="catalog-layout">
        {/* Advanced Filters Sidebar */}
        <aside className="catalog-sidebar-redesign glass-panel">
          <div className="sidebar-header">
            <Filter size={18} />
            <h2>Filters &amp; Settings</h2>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="filter-group">
            <label className="form-label">Search keywords</label>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                className="form-input" 
                placeholder="Keywords..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="search-btn-icon">
                <Search size={14} />
              </button>
            </div>
          </form>

          {/* Departments */}
          <div className="filter-group">
            <label className="form-label">Department</label>
            <div className="categories-list-filters">
              <button 
                onClick={() => updateParam('category', '')}
                className={`cat-filter-btn ${!categoryVal ? 'active' : ''}`}
              >
                All Departments
              </button>
              {categories.map(c => (
                <button 
                  key={c._id}
                  onClick={() => updateParam('category', c.slug)}
                  className={`cat-filter-btn ${categoryVal === c.slug ? 'active' : ''}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Rating Filter */}
          <div className="filter-group">
            <label className="form-label">Customer Rating</label>
            <div className="rating-options-list">
              {[4, 3, 2].map(stars => (
                <button 
                  key={stars}
                  type="button" 
                  onClick={() => handleRatingChange(stars)}
                  className={`rating-filter-row ${minRating === stars ? 'active' : ''}`}
                >
                  <div className="star-row-mini">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < stars ? 'star-filled' : 'star-empty'} />
                    ))}
                  </div>
                  <span>&amp; Up</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Quick Filters */}
          <div className="filter-group">
            <label className="form-label">Price Interval</label>
            <select 
              className="form-select"
              value={priceRange}
              onChange={(e) => handlePriceChange(e.target.value)}
            >
              <option value="all">Any Price</option>
              <option value="under25">Under $25</option>
              <option value="25to50">$25 to $50</option>
              <option value="50to100">$50 to $100</option>
              <option value="100plus">$100 &amp; Above</option>
            </select>
          </div>

          {/* Quality Badges */}
          <div className="filter-group">
            <label className="form-label">Recommendation Badges</label>
            <div className="badge-checklist">
              <button type="button" onClick={() => toggleBadge('editorsPick')} className="badge-check-row">
                {badgeFilter.editorsPick ? <CheckSquare size={16} className="checked" /> : <Square size={16} />}
                <span>Editor's Picks</span>
              </button>
              <button type="button" onClick={() => toggleBadge('bestSeller')} className="badge-check-row">
                {badgeFilter.bestSeller ? <CheckSquare size={16} className="checked" /> : <Square size={16} />}
                <span>Best Sellers</span>
              </button>
              <button type="button" onClick={() => toggleBadge('onSale')} className="badge-check-row">
                {badgeFilter.onSale ? <CheckSquare size={16} className="checked" /> : <Square size={16} />}
                <span>Currently On Sale</span>
              </button>
            </div>
          </div>

          {/* Brands Checklist */}
          {availableBrands.length > 0 && (
            <div className="filter-group">
              <label className="form-label">Filter by Brand</label>
              <div className="brands-list-checkboxes">
                {availableBrands.map(brand => (
                  <button key={brand} type="button" onClick={() => toggleBrand(brand)} className="badge-check-row">
                    {selectedBrands.includes(brand) ? <CheckSquare size={16} className="checked" /> : <Square size={16} />}
                    <span>{brand}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={clearAllFilters} className="btn btn-secondary w-full" type="button">
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
        </aside>

        {/* Main Content Listings */}
        <main className="catalog-main-redesign">
          {loading ? (
            <div className="catalog-layout-view-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
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
            <>
              {paginatedProducts.length === 0 ? (
                <div className="no-results-illustration glass-panel w-full animate-fade-in">
                  <HelpCircle size={48} className="no-results-icon" />
                  <h3>No Recommendations Found</h3>
                  <p>We couldn't find any products matching your specific combinations. Try adjusting or clearing your active filters.</p>
                  <button onClick={clearAllFilters} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                    Reset Active Filters
                  </button>
                </div>
              ) : (
                <div className={`catalog-layout-view-${viewMode}`}>
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}

              {/* Client-Side Pagination bar */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="btn btn-secondary"
                  >
                    Prev
                  </button>
                  <span className="pagination-text">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
