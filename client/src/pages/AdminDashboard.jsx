import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { API_URL, useAuth } from '../context/AuthContext';
import { 
  Plus, Edit2, Trash2, Tag, ShoppingBag, FolderPlus, Save, X, 
  FileImage, LayoutDashboard, TrendingUp, Users, LogOut, CheckCircle2,
  Search, Eye, HelpCircle, Upload, Download, AlertTriangle, UserCheck, ShieldAlert,
  DollarSign, Bell, Sun, Moon, Calendar, ExternalLink, ArrowUpRight, Sparkles, Clock,
  Laptop, Smartphone, Coffee, HelpCircle as QuestionIcon, Play, RefreshCw, Key, ShieldCheck,
  Globe, Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { showToast, logout, user: loggedInAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, categories, users, bulk, analytics, settings
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notifications mock state
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New category "Smart Watches" created.', time: '10m ago' },
    { id: 2, text: 'Product import completed successfully.', time: '1h ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme Toggle aesthetic state
  const [themeMode, setThemeMode] = useState('dark');

  // Local settings state (loaded from localStorage or defaults)
  const [affiliateTag, setAffiliateTag] = useState(localStorage.getItem('amazon_affiliate_tag') || 'amzstore-20');
  const [storeLocale, setStoreLocale] = useState(localStorage.getItem('store_locale') || 'US');
  const [siteName, setSiteName] = useState(localStorage.getItem('site_name') || 'AmzStore');
  const [contactEmail, setContactEmail] = useState(localStorage.getItem('contact_email') || 'admin@amazonstore.com');
  const [googleClientStatus, setGoogleClientStatus] = useState(true);

  // Category CRUD states
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null); 
  const [editCatName, setEditCatName] = useState('');

  // Product Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProductId, setEditProductId] = useState(null); 
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodLink, setProdLink] = useState('');
  const [prodRating, setProdRating] = useState('4.5');
  const [prodReviews, setProdReviews] = useState('24');
  const [prodDiscount, setProdDiscount] = useState('0');
  const [prodLongDesc, setProdLongDesc] = useState('');
  const [prodBestSeller, setProdBestSeller] = useState(false);
  const [prodTrending, setProdTrending] = useState(false);
  const [prodEditorsPick, setProdEditorsPick] = useState(false);
  const [prodStockStatus, setProdStockStatus] = useState('In Stock'); // In Stock, Out of Stock, Low Stock
  const [prodSpecs, setProdSpecs] = useState([{ key: '', value: '' }]);
  const [prodImages, setProdImages] = useState(null); 

  // Bulk operations states
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);

  // Search/Filter and Pagination for Products Table
  const [tableSearch, setTableSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 8;

  // Search/Filter for Users Table
  const [userSearch, setUserSearch] = useState('');

  // Real Database Metrics
  const [dbMetrics, setDbMetrics] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    avgPrice: 0,
    dealsCount: 0,
    addedToday: 0,
    googleLoginCount: 0
  });

  // Fetch initial database records
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, userRes] = await Promise.all([
        axios.get(`${API_URL}/products?limit=1000`), 
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/auth/users`)
      ]);

      const fetchedProducts = prodRes.data.data.products;
      const fetchedCategories = catRes.data.data.categories;
      const fetchedUsers = userRes.data.data.users;

      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setUsersList(fetchedUsers);

      // Calculations
      const totalProds = fetchedProducts.length;
      const totalCats = fetchedCategories.length;
      const totalUsrs = fetchedUsers.length;
      
      const totalPrice = fetchedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
      const averagePrice = totalProds > 0 ? totalPrice / totalProds : 0;
      const discountsCount = fetchedProducts.filter(p => p.discountPercent > 0).length;

      // Products added today logic
      const todayStr = new Date().toDateString();
      const addedTodayCount = fetchedProducts.filter(p => {
        if (!p.createdAt) return false;
        return new Date(p.createdAt).toDateString() === todayStr;
      }).length;

      // Google OAuth login count
      const googleLogins = fetchedUsers.filter(u => u.googleId).length;

      setDbMetrics({
        totalProducts: totalProds,
        totalCategories: totalCats,
        totalUsers: totalUsrs,
        avgPrice: averagePrice,
        dealsCount: discountsCount,
        addedToday: addedTodayCount,
        googleLoginCount: googleLogins
      });
    } catch (err) {
      console.error('Error loading database statistics:', err);
      showToast('Error syncing administrative collections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProductImage = (p) => {
    const url = p.images?.[0]?.url;
    if (!url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
    if (url.startsWith('http')) return url;
    const base = API_URL.replace('/api', '');
    return `${base}${url}`;
  };

  // Get dynamic Lucide icons for categories based on name keywords
  const getCategoryIcon = (catName) => {
    const name = catName.toLowerCase();
    if (name.includes('elect') || name.includes('phone') || name.includes('smart')) {
      return <Smartphone className="cat-badge-icon" size={22} />;
    }
    if (name.includes('computer') || name.includes('laptop') || name.includes('tech')) {
      return <Laptop className="cat-badge-icon" size={22} />;
    }
    if (name.includes('coffee') || name.includes('kitchen') || name.includes('appliances')) {
      return <Coffee className="cat-badge-icon" size={22} />;
    }
    return <Tag className="cat-badge-icon" size={22} />;
  };

  // -- Category CRUD --
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/categories`, { name: newCatName });
      showToast(`Category "${res.data.data.category.name}" created.`);
      setNewCatName('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating category', 'error');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCatName.trim() || !editingCat) return;

    try {
      await axios.put(`${API_URL}/categories/${editingCat._id}`, { name: editCatName });
      showToast('Category name updated!');
      setEditingCat(null);
      setEditCatName('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      showToast('Category department deleted.');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting category', 'error');
    }
  };

  // -- User Roles & CRUD --
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

    try {
      await axios.put(`${API_URL}/auth/users/${userId}`, { role: newRole });
      showToast(`User role updated to ${newRole.toUpperCase()}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating user role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user profile? This action is irreversible.')) return;

    try {
      await axios.delete(`${API_URL}/auth/users/${userId}`);
      showToast('User profile deleted.');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting user profile', 'error');
    }
  };

  // -- Product CRUD Form Row Management --
  const handleAddSpecRow = () => {
    setProdSpecs([...prodSpecs, { key: '', value: '' }]);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...prodSpecs];
    updated[index][field] = value;
    setProdSpecs(updated);
  };

  const handleRemoveSpecRow = (index) => {
    setProdSpecs(prodSpecs.filter((_, i) => i !== index));
  };

  const openAddProduct = () => {
    setEditProductId(null);
    setProdName('');
    setProdBrand('');
    setProdPrice('');
    setProdCategory(categories[0]?._id || '');
    setProdDesc('');
    setProdLink('');
    setProdRating('4.5');
    setProdReviews('24');
    setProdDiscount('0');
    setProdLongDesc('');
    setProdBestSeller(false);
    setProdTrending(false);
    setProdEditorsPick(false);
    setProdStockStatus('In Stock');
    setProdSpecs([{ key: '', value: '' }]);
    setProdImages(null);
    setShowProductForm(true);
  };

  const openEditProduct = (p) => {
    setEditProductId(p._id);
    setProdName(p.name);
    setProdBrand(p.brand);
    setProdPrice(p.price.toString());
    setProdCategory(p.category?._id || '');
    setProdDesc(p.description);
    setProdLink(p.affiliateLink);
    setProdRating((p.rating || 4.5).toString());
    setProdReviews((p.reviewsCount || 24).toString());
    setProdDiscount((p.discountPercent || 0).toString());
    setProdLongDesc(p.longDescription || '');
    setProdBestSeller(p.isBestSeller || false);
    setProdTrending(p.isTrending || false);
    setProdEditorsPick(p.isEditorsPick || false);
    
    // Read stock status if present in specs or default
    setProdStockStatus(p.specifications?.Stock || 'In Stock');

    if (p.specifications) {
      const specArray = Object.entries(p.specifications)
        .filter(([key]) => key !== 'Stock')
        .map(([key, value]) => ({ key, value }));
      setProdSpecs(specArray.length > 0 ? specArray : [{ key: '', value: '' }]);
    } else {
      setProdSpecs([{ key: '', value: '' }]);
    }

    setProdImages(null);
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodBrand || !prodPrice || !prodCategory || !prodLink) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', prodName);
    formData.append('brand', prodBrand);
    formData.append('price', prodPrice);
    formData.append('category', prodCategory);
    formData.append('description', prodDesc);
    formData.append('affiliateLink', prodLink);
    formData.append('rating', prodRating);
    formData.append('reviewsCount', prodReviews);
    formData.append('discountPercent', prodDiscount);
    formData.append('longDescription', prodLongDesc);
    formData.append('isBestSeller', prodBestSeller.toString());
    formData.append('isTrending', prodTrending.toString());
    formData.append('isEditorsPick', prodEditorsPick.toString());

    // Inject Stock Status into specifications
    const specsObj = { Stock: prodStockStatus };
    prodSpecs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });
    formData.append('specifications', JSON.stringify(specsObj));

    if (prodImages) {
      for (let i = 0; i < prodImages.length; i++) {
        formData.append('images', prodImages[i]);
      }
    }

    try {
      if (editProductId) {
        await axios.put(`${API_URL}/products/${editProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Product details updated successfully!');
      } else {
        await axios.post(`${API_URL}/products`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Product added successfully!');
      }
      setShowProductForm(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing product', 'error');
    }
  };

  const handleLogOutAction = () => {
    logout();
    navigate('/login');
  };

  // -- Save Settings --
  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('amazon_affiliate_tag', affiliateTag);
    localStorage.setItem('store_locale', storeLocale);
    localStorage.setItem('site_name', siteName);
    localStorage.setItem('contact_email', contactEmail);
    showToast('System configuration preferences saved!');
  };

  // -- Bulk Actions --
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkFile(file);
    setImportReport(null);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
          showToast('The uploaded sheet is empty.', 'error');
          return;
        }

        const errors = [];
        const normalized = rows.map((row, idx) => {
          const rowNum = idx + 2;

          const name = row['Product Name'] || row.name || row.Product_Name;
          const description = row['Description'] || row.description;
          const category = row['Category'] || row.category;
          const brand = row['Brand'] || row.brand;
          const price = row['Price'] || row.price;
          const affiliateLink = row['Affiliate Link'] || row.affiliateLink || row.Affiliate_Link;
          const imageUrl = row['Image URL'] || row.imageUrl || row.Image_URL;

          if (!name) errors.push(`Row ${rowNum}: "Product Name" is missing.`);
          if (!description) errors.push(`Row ${rowNum}: "Description" is missing.`);
          if (!category) errors.push(`Row ${rowNum}: "Category" is missing.`);
          if (!brand) errors.push(`Row ${rowNum}: "Brand" is missing.`);
          if (price === undefined) errors.push(`Row ${rowNum}: "Price" is missing.`);
          if (!affiliateLink) errors.push(`Row ${rowNum}: "Affiliate Link" is missing.`);

          return {
            name: name || '',
            description: description || '',
            category: category || '',
            brand: brand || '',
            price: price || 0,
            affiliateLink: affiliateLink || '',
            imageUrl: imageUrl || '',
            rating: row.rating || 4.5,
            reviewsCount: row.reviewsCount || 24,
            discountPercent: row.discountPercent || 0,
            isEditorsPick: row.isEditorsPick === 'true' || row.isEditorsPick === true || row.isEditorsPick === 1,
            isBestSeller: row.isBestSeller === 'true' || row.isBestSeller === true || row.isBestSeller === 1,
            isTrending: row.isTrending === 'true' || row.isTrending === true || row.isTrending === 1,
            longDescription: row.longDescription || description || '',
            specifications: row.specifications || ''
          };
        });

        setParsedRows(normalized);
        setValidationErrors(errors);

        if (errors.length > 0) {
          showToast(`File parsed with ${errors.length} issues.`, 'error');
        } else {
          showToast(`Successfully parsed and validated ${normalized.length} products!`);
        }
      } catch (err) {
        console.error('File parsing crash:', err);
        showToast('Failed to parse file. Make sure file format matches CSV/XLSX.', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0 || validationErrors.length > 0) return;

    setImporting(true);
    setImportProgress(0);
    setImportReport(null);

    const batchSize = 200; 
    const totalBatches = Math.ceil(parsedRows.length / batchSize);
    
    let combinedReport = {
      successCount: 0,
      skipCount: 0,
      errorCount: 0,
      errors: []
    };

    try {
      for (let i = 0; i < parsedRows.length; i += batchSize) {
        const batch = parsedRows.slice(i, i + batchSize);
        const res = await axios.post(`${API_URL}/products/bulk-import`, { products: batch });
        const { report } = res.data;

        combinedReport.successCount += report.successCount;
        combinedReport.skipCount += report.skipCount;
        combinedReport.errorCount += report.errorCount;
        if (report.errors) {
          combinedReport.errors.push(...report.errors);
        }

        const percentage = Math.round(((i + batch.length) / parsedRows.length) * 100);
        setImportProgress(percentage);
      }

      setImportReport(combinedReport);
      showToast(`Bulk Import Finished! Success: ${combinedReport.successCount}, Skipped: ${combinedReport.skipCount}`);
      setParsedRows([]);
      setBulkFile(null);
      fetchData();
    } catch (err) {
      console.error('Bulk upload processing error:', err);
      showToast('Bulk import failed during batch transmission.', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleExportProducts = () => {
    if (products.length === 0) {
      showToast('No products available to export.', 'error');
      return;
    }

    try {
      const exportData = products.map(p => ({
        'Product Name': p.name,
        'Brand': p.brand,
        'Category': p.category?.name || 'General',
        'Price': p.price,
        'Description': p.description,
        'Affiliate Link': p.affiliateLink,
        'Image URL': p.images?.[0]?.url || '',
        'Rating': p.rating || 4.5,
        'Reviews Count': p.reviewsCount || 24,
        'Discount Percent': p.discountPercent || 0,
        'isBestSeller': p.isBestSeller ? 1 : 0,
        'isTrending': p.isTrending ? 1 : 0,
        'isEditorsPick': p.isEditorsPick ? 1 : 0,
        'Long Description': p.longDescription || p.description,
        'Specifications': JSON.stringify(p.specifications || {})
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      
      XLSX.writeFile(workbook, 'AmzStore_Products_Export.xlsx');
      showToast('Catalog exported to Excel successfully!');
    } catch (err) {
      console.error('Exporting catalog failed:', err);
      showToast('Export failed.', 'error');
    }
  };

  // Products filtering & pagination
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category?._id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProductsPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (productsPage - 1) * itemsPerPage,
    productsPage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setTableSearch(e.target.value);
    setProductsPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setFilterCategory(e.target.value);
    setProductsPage(1);
  };

  // Users local search filtering
  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // 30 Days added products calculation
  const getProductsAddedLast30Days = () => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return products.filter(p => new Date(p.createdAt).getTime() > thirtyDaysAgo).length;
  };

  // Category distribution calculation
  const getCategoryDistribution = () => {
    if (products.length === 0 || categories.length === 0) return [];
    return categories.map(cat => {
      const count = products.filter(p => p.category?._id === cat._id).length;
      const percent = Math.round((count / products.length) * 100) || 0;
      return { name: cat.name, count, percent };
    }).sort((a,b) => b.count - a.count);
  };

  return (
    <div className="admin-layout">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="logo-box">
            <ShoppingBag size={20} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            {siteName} <span style={{ color: '#FF9900' }}>Admin</span>
          </span>
        </div>

        <nav>
          <button 
            onClick={() => { setActiveTab('overview'); setShowProductForm(false); }}
            className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => { setActiveTab('products'); setShowProductForm(false); }}
            className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          >
            <ShoppingBag size={17} />
            <span>Products</span>
          </button>
          <button 
            onClick={() => { setActiveTab('categories'); setEditingCat(null); }}
            className={`nav-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          >
            <Tag size={17} />
            <span>Categories</span>
          </button>
          <button 
            onClick={() => { setActiveTab('users'); }}
            className={`nav-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            <Users size={17} />
            <span>Users</span>
          </button>
          <button 
            onClick={() => { setActiveTab('bulk'); }}
            className={`nav-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
          >
            <Upload size={17} />
            <span>Bulk Import</span>
          </button>
          <button 
            onClick={() => { setActiveTab('analytics'); }}
            className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <TrendingUp size={17} />
            <span>Analytics</span>
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); }}
            className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={17} />
            <span>Settings</span>
          </button>
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
            <div className="admin-avatar">
              {loggedInAdmin?.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {loggedInAdmin?.username || 'Administrator'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                {loggedInAdmin?.email || 'admin@amazonstore.com'}
              </span>
            </div>
          </div>
          <button onClick={handleLogOutAction} className="btn btn-secondary w-full" style={{ gap: '0.5rem', justifyContent: 'center', borderRadius: '12px' }}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN OPERATIONS AREA */}
      <main className="admin-main-pane">
        
        {/* TOP NAVIGATION BAR */}
        <div className="admin-topnav-bar">
          <div className="topnav-search">
            <Search size={16} className="topnav-search-icon" />
            <input 
              type="text" 
              placeholder={activeTab === 'users' ? 'Search profiles...' : 'Search dashboard inventory...'} 
              value={activeTab === 'users' ? userSearch : tableSearch}
              onChange={(e) => {
                if (activeTab === 'users') {
                  setUserSearch(e.target.value);
                } else {
                  handleSearchChange(e);
                }
              }}
            />
          </div>

          <div className="topnav-actions">
            {/* Today's Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 600 }}>
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Aesthetic Theme Toggle */}
            <button 
              className="topnav-action-btn"
              onClick={() => {
                setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
                showToast(`Visual theme mode toggled (Aesthetic preview)`);
              }}
            >
              {themeMode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications Panel Toggle */}
            <div style={{ position: 'relative' }}>
              <button className="topnav-action-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={18} />
                <span className="notification-badge"></span>
              </button>
              {showNotifications && (
                <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '2.5rem', width: '280px', zIndex: 110, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#111827' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <strong>System Logs</strong>
                    <button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', color: '#FF9900', cursor: 'pointer', fontSize: '0.75rem' }}>Clear all</button>
                  </div>
                  {notifications.length === 0 ? (
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>No new notifications.</span>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#e5e7eb', lineHeight: 1.3 }}>{n.text}</span>
                        <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="admin-profile-pill">
              <div className="admin-avatar">
                {loggedInAdmin?.username?.slice(0,2).toUpperCase() || 'AD'}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e5e7eb' }}>Console</span>
            </div>
          </div>
        </div>

        {/* DASHBOARD HOME OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="tab-view-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Real Stats Cards */}
            <div className="premium-metrics-grid">
              <div className="premium-stat-card">
                <div className="stat-header">
                  <span>Catalog Products</span>
                  <div className="stat-icon-wrapper"><ShoppingBag size={16} /></div>
                </div>
                <div className="stat-value">{dbMetrics.totalProducts}</div>
                <div className="stat-subtext"><Sparkles size={12} /> Live items in MongoDB</div>
              </div>

              <div className="premium-stat-card">
                <div className="stat-header">
                  <span>Categories</span>
                  <div className="stat-icon-wrapper"><Tag size={16} /></div>
                </div>
                <div className="stat-value">{dbMetrics.totalCategories}</div>
                <div className="stat-subtext"><Clock size={12} /> Active departments mapped</div>
              </div>

              <div className="premium-stat-card">
                <div className="stat-header">
                  <span>Registered Users</span>
                  <div className="stat-icon-wrapper"><Users size={16} /></div>
                </div>
                <div className="stat-value">{dbMetrics.totalUsers}</div>
                <div className="stat-subtext"><UserCheck size={12} /> {dbMetrics.googleLoginCount} via Google login</div>
              </div>

              <div className="premium-stat-card">
                <div className="stat-header">
                  <span>Affiliate Clicks</span>
                  <div className="stat-icon-wrapper"><ExternalLink size={16} /></div>
                </div>
                <div className="stat-value" style={{ fontSize: '1.45rem', marginTop: '0.35rem', color: '#9ca3af' }}>No data available</div>
                <div className="stat-subtext">Click logs tracking disconnected</div>
              </div>

              <div className="premium-stat-card">
                <div className="stat-header">
                  <span>Added Today</span>
                  <div className="stat-icon-wrapper"><CheckCircle2 size={16} /></div>
                </div>
                <div className="stat-value">{dbMetrics.addedToday}</div>
                <div className="stat-subtext"><Calendar size={12} /> Records inserted today</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '2rem' }}>
              
              {/* Latest Additions Table */}
              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Latest Product Additions</h3>
                  <button onClick={() => setActiveTab('products')} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '10px' }}>
                    View Catalog
                  </button>
                </div>

                <div className="dashboard-table-card">
                  <table className="console-table">
                    <thead>
                      <tr>
                        <th>Product Info</th>
                        <th>Brand</th>
                        <th>Dept. Category</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                          <tr key={idx}>
                            <td><div className="skeleton" style={{ width: '120px', height: '14px' }}></div></td>
                            <td><div className="skeleton" style={{ width: '60px', height: '14px' }}></div></td>
                            <td><div className="skeleton" style={{ width: '80px', height: '14px' }}></div></td>
                            <td><div className="skeleton" style={{ width: '50px', height: '14px' }}></div></td>
                          </tr>
                        ))
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-td-row">No products seeded in database.</td>
                        </tr>
                      ) : (
                        products.slice(0, 4).map(p => (
                          <tr key={p._id}>
                            <td>
                              <div className="console-product-cell">
                                <img 
                                  src={getProductImage(p)} 
                                  alt="" 
                                  className="console-product-img"
                                  style={{ width: '38px', height: '38px' }}
                                />
                                <div className="name-and-badges">
                                  <span className="p-title" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.name}</span>
                                </div>
                              </div>
                            </td>
                            <td><span className="brand-td-text">{p.brand}</span></td>
                            <td>{p.category?.name || 'General'}</td>
                            <td><span className="actual-price">${p.price.toFixed(2)}</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar Action Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Quick Actions</h3>
                  <button onClick={openAddProduct} className="btn btn-primary w-full" style={{ borderRadius: '10px', justifyContent: 'center' }}>
                    <Plus size={16} />
                    <span>Add New Product</span>
                  </button>
                  <button onClick={() => setActiveTab('bulk')} className="btn btn-secondary w-full" style={{ borderRadius: '10px', justifyContent: 'center' }}>
                    <Upload size={16} />
                    <span>Bulk Spreadsheet Import</span>
                  </button>
                  <button onClick={() => setActiveTab('categories')} className="btn btn-secondary w-full" style={{ borderRadius: '10px', justifyContent: 'center' }}>
                    <FolderPlus size={16} />
                    <span>Manage Departments</span>
                  </button>
                </div>

                {/* Recents Registrations summary */}
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>Recent Users</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {loading ? (
                      <div className="skeleton" style={{ height: '50px', width: '100%' }}></div>
                    ) : usersList.slice(0, 3).map(u => (
                      <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="admin-avatar" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                          {u.username?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</span>
                          <span style={{ fontSize: '0.7rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#FF9900', fontWeight: 700 }}>
                          {u.googleId ? 'Google' : 'Email'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PRODUCT MANAGEMENT PANEL */}
        {activeTab === 'products' && (
          <div className="tab-view-container animate-fade-in">
            {!showProductForm ? (
              <>
                <div className="dashboard-section-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="search-filter-box" style={{ flex: 1, minWidth: '240px' }}>
                    <Search size={16} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search items..." 
                      className="form-input search-input"
                      value={tableSearch}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <div className="toolbar-sort" style={{ minWidth: '180px' }}>
                    <select 
                      className="form-select"
                      value={filterCategory}
                      onChange={handleCategoryFilterChange}
                      style={{ padding: '0.65rem 1rem', borderRadius: '12px' }}
                    >
                      <option value="all">All Departments</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button onClick={openAddProduct} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', borderRadius: '12px' }}>
                    <Plus size={16} />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="dashboard-table-card glass-panel" style={{ marginTop: '1.5rem', borderRadius: '16px' }}>
                  <table className="console-table">
                    <thead>
                      <tr>
                        <th>Product Info</th>
                        <th>Brand</th>
                        <th>Dept. Category</th>
                        <th>Price</th>
                        <th>Amazon Link</th>
                        <th>Stock Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="console-product-cell">
                                <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '6px' }}></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '180px' }}>
                                  <div className="skeleton" style={{ height: '14px', width: '80%' }}></div>
                                </div>
                              </div>
                            </td>
                            <td><div className="skeleton" style={{ height: '14px', width: '60px' }}></div></td>
                            <td><div className="skeleton" style={{ height: '14px', width: '80px' }}></div></td>
                            <td><div className="skeleton" style={{ height: '14px', width: '40px' }}></div></td>
                            <td><div className="skeleton" style={{ height: '14px', width: '60px' }}></div></td>
                            <td><div className="skeleton" style={{ height: '14px', width: '40px' }}></div></td>
                            <td><div className="skeleton" style={{ height: '14px', width: '50px' }}></div></td>
                            <td><div className="skeleton" style={{ height: '24px', width: '70px' }}></div></td>
                          </tr>
                        ))
                      ) : paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="empty-td-row">No catalog items found matching your filters.</td>
                        </tr>
                      ) : (
                        paginatedProducts.map(p => (
                          <tr key={p._id}>
                            <td>
                              <div className="console-product-cell">
                                <img 
                                  src={getProductImage(p)} 
                                  alt="" 
                                  className="console-product-img"
                                />
                                <div className="name-and-badges">
                                  <span className="p-title">{p.name}</span>
                                  <div className="badge-pills">
                                    {p.isEditorsPick && <span className="pill ed">Choice</span>}
                                    {p.isBestSeller && <span className="pill bs">Best</span>}
                                    {p.isTrending && <span className="pill tr">Hot</span>}
                                    {p.discountPercent > 0 && <span className="pill sale">{p.discountPercent}% Off</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td><span className="brand-td-text">{p.brand}</span></td>
                            <td>{p.category?.name || 'General'}</td>
                            <td><span className="actual-price">${p.price.toFixed(2)}</span></td>
                            <td>
                              <a href={p.affiliateLink} target="_blank" rel="noopener noreferrer" style={{ color: '#FF9900', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem' }}>
                                <span>Link</span>
                                <ArrowUpRight size={12} />
                              </a>
                            </td>
                            <td>
                              <span 
                                className="pill"
                                style={{
                                  backgroundColor: (p.specifications?.Stock === 'Out of Stock') ? 'rgba(239, 68, 68, 0.1)' : (p.specifications?.Stock === 'Low Stock') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: (p.specifications?.Stock === 'Out of Stock') ? '#ef4444' : (p.specifications?.Stock === 'Low Stock') ? '#f59e0b' : '#10b981',
                                  padding: '0.25rem 0.6rem',
                                  fontWeight: 700
                                }}
                              >
                                {p.specifications?.Stock || 'In Stock'}
                              </span>
                            </td>
                            <td><span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</span></td>
                            <td>
                              <div className="console-actions-row">
                                <Link to={`/products/${p._id}`} className="console-act-btn view" title="View details">
                                  <Eye size={14} />
                                </Link>
                                <button onClick={() => openEditProduct(p)} className="console-act-btn edit" title="Edit details">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteProduct(p._id)} className="console-act-btn delete" title="Delete product">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                {totalProductsPages > 1 && (
                  <div className="pagination" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      disabled={productsPage === 1}
                      onClick={() => setProductsPage(prev => Math.max(1, prev - 1))}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      Prev
                    </button>
                    <span className="pagination-text">
                      Page {productsPage} of {totalProductsPages}
                    </span>
                    <button 
                      disabled={productsPage === totalProductsPages}
                      onClick={() => setProductsPage(prev => Math.min(totalProductsPages, prev + 1))}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Floating Add Button */}
                <button onClick={openAddProduct} className="floating-add-btn">
                  <Plus size={18} />
                  <span>Add Product</span>
                </button>
              </>
            ) : (
              <form onSubmit={handleProductSubmit} className="premium-form-container glass-panel animate-fade-in" style={{ borderRadius: '16px' }}>
                <div className="form-header-row">
                  <h2>{editProductId ? `Edit Inventory: ${prodName}` : 'Add New Affiliate Listing'}</h2>
                  <button type="button" onClick={() => setShowProductForm(false)} className="close-btn">
                    <X size={20} />
                  </button>
                </div>

                <div className="form-section-block">
                  <h3>Core Specifications</h3>
                  <div className="form-grid-three">
                    <div className="form-group">
                      <label className="form-label">Product Name / Title *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="Sony WH-1000XM4 Headphones"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Brand / Manufacturer *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="Sony"
                        value={prodBrand}
                        onChange={(e) => setProdBrand(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department / Category *</label>
                      <select 
                        className="form-select" 
                        required 
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-three">
                    <div className="form-group">
                      <label className="form-label">Amazon Sale Price ($) *</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        className="form-input" 
                        required 
                        placeholder="348.00"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount Percentage (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        className="form-input" 
                        placeholder="0"
                        value={prodDiscount}
                        onChange={(e) => setProdDiscount(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Amazon Affiliate URL *</label>
                      <input 
                        type="url" 
                        className="form-input" 
                        required 
                        placeholder="https://www.amazon.com/dp/B0863TXGM3"
                        value={prodLink}
                        onChange={(e) => setProdLink(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section-block">
                  <h3>Marketing &amp; Stock Status</h3>
                  <div className="form-grid-three">
                    <div className="form-group">
                      <label className="form-label">Customer Rating (0.0 to 5.0)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="5"
                        className="form-input" 
                        value={prodRating}
                        onChange={(e) => setProdRating(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stock Status</label>
                      <select
                        className="form-select"
                        value={prodStockStatus}
                        onChange={(e) => setProdStockStatus(e.target.value)}
                      >
                        <option value="In Stock">In Stock (Active)</option>
                        <option value="Low Stock">Low Stock warning</option>
                        <option value="Out of Stock">Out of Stock (Disabled)</option>
                      </select>
                    </div>
                    <div className="form-group checkbox-align">
                      <label className="form-label">Quality Badges</label>
                      <div className="switches-row">
                        <button 
                          type="button" 
                          className={`switch-badge-btn ${prodEditorsPick ? 'active' : ''}`}
                          onClick={() => setProdEditorsPick(!prodEditorsPick)}
                        >
                          Editor's Pick
                        </button>
                        <button 
                          type="button" 
                          className={`switch-badge-btn ${prodBestSeller ? 'active' : ''}`}
                          onClick={() => setProdBestSeller(!prodBestSeller)}
                        >
                          Best Seller
                        </button>
                        <button 
                          type="button" 
                          className={`switch-badge-btn ${prodTrending ? 'active' : ''}`}
                          onClick={() => setProdTrending(!prodTrending)}
                        >
                          Trending
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section-block">
                  <h3>Editorial Review Descriptions</h3>
                  <div className="form-group">
                    <label className="form-label">Short Summary (Featured in search cards)</label>
                    <textarea 
                      className="form-textarea" 
                      rows="2"
                      required
                      placeholder="Short product intro summary..."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Long-Read In-Depth Editorial Review (Supports markdown headings with ###)</label>
                    <textarea 
                      className="form-textarea" 
                      rows="8"
                      placeholder="Provide why we recommend this item, who it's for, and the lab test details. Use ### to define headers (e.g. ### Why We Recommend It)."
                      value={prodLongDesc}
                      onChange={(e) => setProdLongDesc(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="form-section-block">
                  <h3>Technical Specifications</h3>
                  <div className="specs-list-form">
                    {prodSpecs.map((spec, index) => (
                      <div key={index} className="spec-row-inputs">
                        <input 
                          type="text" 
                          placeholder="Key (e.g. Material)" 
                          className="form-input flex-1"
                          value={spec.key}
                          onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="Value (e.g. Full-grain Leather)" 
                          className="form-input flex-1"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSpecRow(index)}
                          className="btn btn-danger btn-icon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddSpecRow} className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
                      <Plus size={14} />
                      <span>Add spec item</span>
                    </button>
                  </div>
                </div>

                <div className="form-section-block">
                  <h3>Product Images Upload</h3>
                  <div className="file-uploader-box">
                    <FileImage size={32} className="uploader-icon" />
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => setProdImages(e.target.files)}
                    />
                    <span>Select Images (PNG/JPG, multiple selection allowed)</span>
                  </div>
                  {prodImages && (
                    <div className="uploaded-list">
                      <strong>Pending Upload:</strong> {Array.from(prodImages).map(f => f.name).join(', ')}
                    </div>
                  )}
                  {editProductId && !prodImages && (
                    <p className="form-help">Leave empty to preserve currently saved images.</p>
                  )}
                </div>

                <div className="form-footer-buttons">
                  <button type="submit" className="btn btn-primary" style={{ borderRadius: '12px' }}>
                    <Save size={16} />
                    <span>Save Product</span>
                  </button>
                  <button type="button" onClick={() => setShowProductForm(false)} className="btn btn-secondary" style={{ borderRadius: '12px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* CATEGORY DEPARTMENTS PANEL */}
        {activeTab === 'categories' && (
          <div className="tab-view-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '2rem' }}>
              
              {/* Category Cards Grid */}
              <div className="category-cards-grid">
                {categories.length === 0 ? (
                  <div className="glass-panel" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                    No categories created yet. Create a category to start organizing your catalog.
                  </div>
                ) : (
                  categories.map(c => {
                    const count = products.filter(p => p.category?._id === c._id).length;
                    return (
                      <div key={c._id} className="premium-category-card">
                        <div className="cat-header-row">
                          {getCategoryIcon(c.name)}
                          <div style={{ display: 'flex', gap: '0.45rem' }}>
                            <button 
                              onClick={() => { setEditingCat(c); setEditCatName(c.name); }}
                              className="console-act-btn edit"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(c._id)}
                              className="console-act-btn delete"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>{c.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Slug: {c.slug}</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem', fontSize: '0.8rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Collection Items:</span>
                          <strong>{count} items</strong>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Inline Form */}
              <div className="categories-form-card glass-panel" style={{ height: 'fit-content', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                  {editingCat ? 'Modify Category' : 'Create Category Department'}
                </h3>
                {editingCat ? (
                  <form onSubmit={handleUpdateCategory} className="cat-inline-form">
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label">Category Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                      />
                    </div>
                    <div className="btn-row-spacing" style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ borderRadius: '10px', flex: 1, justifyContent: 'center' }}>Update</button>
                      <button type="button" onClick={() => setEditingCat(null)} className="btn btn-secondary" style={{ borderRadius: '10px', flex: 1, justifyContent: 'center' }}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddCategory} className="cat-inline-form">
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label">Category Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Smart Watches"
                        required 
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" style={{ borderRadius: '10px', justifyContent: 'center' }}>
                      <FolderPlus size={16} />
                      <span>Create Category</span>
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        )}

        {/* USER MANAGEMENT PANEL */}
        {activeTab === 'users' && (
          <div className="tab-view-container animate-fade-in">
            <div className="dashboard-section-actions">
              <div className="search-filter-box" style={{ maxWidth: '360px', width: '100%' }}>
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search email or username..." 
                  className="form-input search-input"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="dashboard-table-card glass-panel" style={{ marginTop: '1.5rem', borderRadius: '16px' }}>
              <table className="console-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Login Method</th>
                    <th>System Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx}>
                        <td><div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div></td>
                        <td><div className="skeleton" style={{ width: '100px', height: '14px' }}></div></td>
                        <td><div className="skeleton" style={{ width: '140px', height: '14px' }}></div></td>
                        <td><div className="skeleton" style={{ width: '70px', height: '14px' }}></div></td>
                        <td><div className="skeleton" style={{ width: '60px', height: '14px' }}></div></td>
                        <td><div className="skeleton" style={{ width: '50px', height: '14px' }}></div></td>
                        <td><div className="skeleton" style={{ width: '80px', height: '14px' }}></div></td>
                        <td><div className="skeleton" style={{ width: '50px', height: '24px' }}></div></td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-td-row">No users found matching your search.</td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="admin-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                            {u.username?.slice(0, 2).toUpperCase() || 'US'}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#fff' }}>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span 
                            className="pill" 
                            style={{ 
                              backgroundColor: u.googleId ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                              color: u.googleId ? '#10b981' : '#f59e0b',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {u.googleId ? 'Google SSO' : 'Local Auth'}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="pill" 
                            style={{ 
                              backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                              color: u.role === 'admin' ? '#ef4444' : '#3b82f6',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span 
                            className="pill"
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            Active
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="console-actions-row">
                            <button 
                              onClick={() => handleToggleUserRole(u._id, u.role)} 
                              className="console-act-btn edit" 
                              title="Toggle role"
                              style={{ padding: '0.45rem' }}
                            >
                              <UserCheck size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u._id)} 
                              className="console-act-btn delete" 
                              title="Delete profile"
                              style={{ padding: '0.45rem' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BULK IMPORT PANEL */}
        {activeTab === 'bulk' && (
          <div className="tab-view-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="dashboard-categories-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
              
              {/* Drag & Drop zone card */}
              <div className="categories-form-card glass-panel" style={{ height: 'fit-content', borderRadius: '16px' }}>
                <h2>Bulk Spreadsheet Loader</h2>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Drop your CSV or Excel workbook below. Columns and fields will validate in-browser before data reaches MongoDB.
                </p>

                <div className="drag-drop-zone" style={{ marginBottom: '1.5rem' }}>
                  <Upload size={36} className="uploader-icon" style={{ color: '#FF9900', marginBottom: '1rem' }} />
                  <input 
                    type="file" 
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    disabled={importing}
                    style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100px' }}
                  />
                  <span style={{ fontWeight: 700, display: 'block', fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>
                    {bulkFile ? bulkFile.name : 'Drag & Drop CSV / Excel File'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Accepts standard templates up to 10,000+ entries</span>
                </div>

                {parsedRows.length > 0 && (
                  <div className="parsed-summary" style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span>Parsed Entries:</span>
                      <strong>{parsedRows.length} items</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: validationErrors.length > 0 ? '#ef4444' : '#10b981' }}>
                      <span>Validation status:</span>
                      <strong>{validationErrors.length > 0 ? `${validationErrors.length} Errors detected` : '✓ All Columns Validated'}</strong>
                    </div>
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="error-alert-banner" style={{ flexDirection: 'column', alignItems: 'flex-start', maxHeight: '180px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      <AlertTriangle size={16} />
                      <span>Resolve column format issues:</span>
                    </div>
                    <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.8rem' }}>
                      {validationErrors.slice(0, 8).map((err, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>• {err}</li>
                      ))}
                      {validationErrors.length > 8 && (
                        <li style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>And {validationErrors.length - 8} more...</li>
                      )}
                    </ul>
                  </div>
                )}

                {importing && (
                  <div className="import-progress-container" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                      <span>Seeding database records...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${importProgress}%`, height: '100%', backgroundColor: '#FF9900', transition: 'width 0.15s ease' }}></div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleCommitImport} 
                  className="btn btn-primary w-full"
                  style={{ borderRadius: '12px', justifyContent: 'center' }}
                  disabled={parsedRows.length === 0 || validationErrors.length > 0 || importing}
                >
                  <Save size={16} />
                  <span>{importing ? 'Processing batches...' : 'Commit Import to Database'}</span>
                </button>
              </div>

              {/* Guidelines column */}
              <div className="categories-list-card glass-panel" style={{ height: 'fit-content', borderRadius: '16px', padding: '1.75rem' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Actions &amp; Guidelines</h2>
                
                <div style={{ marginBottom: '2.25rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Export Catalogue</h3>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1rem', lineHeight: 1.5 }}>
                    Download a full workbook export of all products details, ratings, discount rates, and configurations from the database.
                  </p>
                  <button onClick={handleExportProducts} className="btn btn-secondary w-full" style={{ borderRadius: '10px', justifyContent: 'center' }}>
                    <Download size={16} />
                    <span>Download Excel Export</span>
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Excel Spreadsheet Template</h3>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1rem', lineHeight: 1.5 }}>
                    Use the link below to download a blank pre-configured template with correct headers.
                  </p>
                  <a href="/products_template.csv" download className="btn btn-secondary w-full" style={{ borderRadius: '10px', justifyContent: 'center', textDecoration: 'none', color: '#fff' }}>
                    <Download size={16} />
                    <span>Download Blank CSV Template</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Performance Report */}
            {importReport && (
              <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h3>Import Performance Report</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase' }}>Created</div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 850, color: '#10b981', marginTop: '0.25rem' }}>{importReport.successCount}</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase' }}>Skipped (Duplicates)</div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 850, color: '#f59e0b', marginTop: '0.25rem' }}>{importReport.skipCount}</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase' }}>Errors</div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 850, color: '#ef4444', marginTop: '0.25rem' }}>{importReport.errorCount}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REAL METRICS ANALYTICS PANEL */}
        {activeTab === 'analytics' && (
          <div className="tab-view-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Real Stats Metrics summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800 }}>Added last 30 Days</span>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '0.5rem', fontFamily: 'Poppins' }}>{getProductsAddedLast30Days()} products</h3>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Calculated from database entry dates</p>
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800 }}>Avg. Product Price</span>
                <h3 style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '0.5rem', fontFamily: 'Poppins' }}>${dbMetrics.avgPrice.toFixed(2)}</h3>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Computed across {products.length} entries</p>
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800 }}>Affiliate Clicks Data</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.85rem', color: '#9ca3af' }}>No data available</h3>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>MongoDB clicks collection empty</p>
              </div>
            </div>

            {/* Department Distribution Progress bar charts */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Category Distributions</h3>
              {getCategoryDistribution().length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>No data available</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {getCategoryDistribution().map((cat, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: '#e5e7eb', fontWeight: 700 }}>{cat.name}</span>
                        <span style={{ color: '#9ca3af' }}>{cat.count} items ({cat.percent}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#1f2937', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${cat.percent}%`, height: '100%', backgroundColor: '#FF9900', borderRadius: '10px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* SYSTEM PREFERENCES SETTINGS PANEL */}
        {activeTab === 'settings' && (
          <div className="tab-view-container animate-fade-in">
            <form onSubmit={handleSaveSettings} className="premium-form-container glass-panel" style={{ borderRadius: '16px', maxWidth: '800px' }}>
              <div className="form-header-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2>System Configuration Preferences</h2>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '10px' }}>
                  <Save size={16} />
                  <span>Save Configuration</span>
                </button>
              </div>

              {/* Amazon configurations */}
              <div className="form-section-block" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingBag size={18} style={{ color: '#FF9900' }} /> Amazon Affiliate Settings</h3>
                <div className="form-grid-three" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Amazon Associate Tag / Store ID</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={affiliateTag}
                      onChange={(e) => setAffiliateTag(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Default Locale Region</label>
                    <select 
                      className="form-select"
                      value={storeLocale}
                      onChange={(e) => setStoreLocale(e.target.value)}
                    >
                      <option value="US">United States (Amazon.com)</option>
                      <option value="UK">United Kingdom (Amazon.co.uk)</option>
                      <option value="CA">Canada (Amazon.ca)</option>
                      <option value="DE">Germany (Amazon.de)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Site preferences */}
              <div className="form-section-block" style={{ marginBottom: '2rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Laptop size={18} style={{ color: '#FF9900' }} /> Site Information</h3>
                <div className="form-grid-three" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Storefront Site Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Google integrations */}
              <div className="form-section-block" style={{ marginBottom: '2rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={18} style={{ color: '#FF9900' }} /> Google OAuth SSO Integrations</h3>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#fff' }}>Google Identity Services Client</strong>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>Dynamic Client ID loaded from environment config files.</p>
                  </div>
                  <span 
                    className="pill" 
                    style={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981',
                      padding: '0.3rem 0.75rem',
                      fontWeight: 800,
                      borderRadius: '30px'
                    }}
                  >
                    ✓ Linked Active
                  </span>
                </div>
              </div>

              {/* Admin profile settings */}
              <div className="form-section-block" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Key size={18} style={{ color: '#FF9900' }} /> Console Security Settings</h3>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => navigate('/profile')} className="btn btn-secondary" style={{ borderRadius: '10px' }}>
                    <Users size={14} />
                    <span>Change Profile Username</span>
                  </button>
                  <button type="button" onClick={() => navigate('/profile')} className="btn btn-secondary" style={{ borderRadius: '10px' }}>
                    <Key size={14} />
                    <span>Change Account Password</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
