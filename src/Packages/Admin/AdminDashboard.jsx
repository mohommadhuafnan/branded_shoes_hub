import React, { useEffect, useMemo, useState } from 'react';
import { FaChartLine, FaBoxOpen, FaEdit, FaTrash, FaPlus, FaClipboardList, FaMobileAlt, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';
import { useShop } from '../../context/ShopContext';
import { ref, onValue, set, push, update, remove, off } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalProducts: 0, availableProducts: 0, totalSales: 0, todaySales: 0, monthSales: 0, lowStockCount: 0, totalOrders: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [content, setContent] = useState({ heroTitle: '', heroDescription: '', heroTag: '', promoTitle: '', promoDescription: '', whatsappNumber: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', salePrice: '', stock: '', category: '', image: '', description: '', brand: '', sizes: '40,41,42', featured: false });
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  const { showToast } = useShop();

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const ordersRef = ref(db, 'orders');
    const contentRef = ref(db, 'content');

    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const rows = data ? Object.keys(data).map(k => ({ _id: k, ...data[k] })) : [];
      setProducts(rows);
    });

    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      const rows = data ? Object.keys(data).map(k => ({ _id: k, ...data[k] })) : [];
      setOrders(rows.reverse());
    });

    const unsubscribeContent = onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setContent(data);
    });

    return () => {
      off(productsRef, 'value', unsubscribeProducts);
      off(ordersRef, 'value', unsubscribeOrders);
      off(contentRef, 'value', unsubscribeContent);
    };
  }, []);

  useEffect(() => {
    const tp = products.length;
    const ap = products.filter(p => Number(p.stock) > 0).length;
    const ls = products.filter(p => Number(p.stock) <= 5).length;
    
    let ts = 0, td = 0, ms = 0;
    const now = new Date();
    orders.forEach(o => {
       const price = Number(o.totalPrice) || 0;
       ts += price;
       if (o.createdAt) {
           const d = new Date(o.createdAt);
           if (d.toDateString() === now.toDateString()) td += price;
           if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) ms += price;
       }
    });

    setStats({ totalProducts: tp, availableProducts: ap, totalSales: ts, todaySales: td, monthSales: ms, lowStockCount: ls, totalOrders: orders.length });
  }, [products, orders]);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
      setFormData(prev => ({...prev, [name]: value}));
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        stock: product.stock || '',
        category: product.category || '',
        image: product.image || '',
        description: product.description || '',
        brand: product.brand || '',
        sizes: Array.isArray(product.sizes) ? product.sizes.join(',') : (product.sizes || '40,41,42'),
        featured: !!product.featured
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', salePrice: '', stock: '', category: '', image: '', description: '', brand: '', sizes: '40,41,42', featured: false });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const fileRef = storageRef(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setFormData((prev) => ({ ...prev, image: url }));
      if(showToast) showToast('Upload complete', 'Image uploaded successfully.', 'success');
    } catch (err) {
      if(showToast) showToast('Upload failed', err.message, 'warning');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sizesArray = typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => s.trim()) : formData.sizes;
      const dataToSave = { ...formData, sizes: sizesArray };

      if (editingId) {
        await update(ref(db, `products/${editingId}`), dataToSave);
        if(showToast) showToast('Success', 'Product updated!', 'success');
      } else {
        await push(ref(db, 'products'), dataToSave);
        if(showToast) showToast('Success', 'Product added!', 'success');
      }

      setIsModalOpen(false);
    } catch(err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await remove(ref(db, `products/${id}`));
      if(showToast) showToast('Deleted', 'Product removed successfully.', 'success');
    } catch(err) {
      alert(err.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await update(ref(db, `orders/${id}`), { status });
    } catch(err) {
      alert(err.message);
    }
  };

  const saveContent = async () => {
    try {
      await set(ref(db, 'content'), content);
      if(showToast) showToast('Saved', 'Homepage content updated.', 'success');
    } catch(err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const chartData = useMemo(() => {
    const days = {};
    orders.forEach(o => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt).toLocaleDateString();
      if (!days[d]) days[d] = 0;
      days[d] += Number(o.totalPrice) || 0;
    });
    return Object.keys(days).map(date => ({ date, sales: days[date] })).reverse();
  }, [orders]);

  const renderOverview = () => (
    <div>
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FaChartLine /></div>
          <div className="stat-info">
            <h3>Today's Sales</h3>
            <strong>${stats.todaySales.toLocaleString()}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaChartLine style={{color: '#4179ff'}}/></div>
          <div className="stat-info">
            <h3>Monthly Sales</h3>
            <strong>${stats.monthSales.toLocaleString()}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaChartLine style={{color: '#4179ff'}}/></div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <strong>${stats.totalSales.toLocaleString()}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaBoxOpen style={{color: '#10b981'}}/></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <strong>{stats.totalProducts}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaBoxOpen style={{color: '#f59e0b'}}/></div>
          <div className="stat-info">
            <h3>In Stock Items</h3>
            <strong>{stats.availableProducts}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaClipboardList style={{color: '#6b21a8'}}/></div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <strong>{stats.totalOrders}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaBoxOpen style={{color: '#dc2626'}}/></div>
          <div className="stat-info">
            <h3>Low Stock (≤5)</h3>
            <strong>{stats.lowStockCount}</strong>
          </div>
        </div>
      </div>
      
      <div className="admin-panel" style={{ marginTop: '2rem', height: '350px' }}>
        <div className="panel-header">
          <h3>Sales Trend</h3>
        </div>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#4179ff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <div className="admin-header">
        <h1>Product Management</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FaPlus /> Add Product
        </button>
      </div>

      <div className="admin-panel">
        <div className="panel-header">
          <h3>All Inventory</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>No products found</td></tr>
            ) : (
              products.map(product => (
                <tr key={product._id}>
                  <td>
                    {product.image ? 
                      <img src={product.image} className="product-img-thumb" alt={product.name} /> 
                      : <div className="product-img-thumb" />}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="td-actions">
                      <button className="action-btn edit" onClick={() => openModal(product)}><FaEdit/></button>
                      <button className="action-btn delete" onClick={() => handleDelete(product._id)}><FaTrash/></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => {
    const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);
    return (
      <div className="admin-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Order Management</h3>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order.customerName}</td>
              <td>${Number(order.totalPrice || 0).toLocaleString()}</td>
              <td>
                <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                  {['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  };

  const renderContent = () => (
    <div className="admin-panel">
      <div className="panel-header">
        <h3>Homepage Content & Phone</h3>
        <button className="btn btn-primary" onClick={saveContent}><FaMobileAlt /> Save Content</button>
      </div>
      <div className="admin-content-form">
        <div className="form-group"><label>Hero Title</label><input value={content.heroTitle || ''} onChange={(e) => setContent((p) => ({ ...p, heroTitle: e.target.value }))} /></div>
        <div className="form-group"><label>Hero Description</label><textarea value={content.heroDescription || ''} onChange={(e) => setContent((p) => ({ ...p, heroDescription: e.target.value }))} /></div>
        <div className="form-group"><label>Hero Tag</label><input value={content.heroTag || ''} onChange={(e) => setContent((p) => ({ ...p, heroTag: e.target.value }))} /></div>
        <div className="form-group"><label>WhatsApp Number</label><input value={content.whatsappNumber || ''} onChange={(e) => setContent((p) => ({ ...p, whatsappNumber: e.target.value }))} placeholder="9477xxxxxxx" /></div>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBoxOpen /> Products
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaClipboardList /> Orders
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <FaMobileAlt /> Content
          </button>
          <div style={{flex: 1}}></div>
          <button className="admin-nav-item logout-btn" onClick={handleLogout} style={{color: '#dc2626', marginTop: 'auto'}}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'content' && renderContent()}
      </main>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="admin-two-col-grid">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input required type="number" name="price" value={formData.price} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Mens, Womens" />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input name="image" value={formData.image} onChange={handleInputChange} placeholder="/uploads/..." />
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
                  {uploadingImage && <small>Uploading image...</small>}
                  {!!formData.image && (
                    <img
                      src={formData.image}
                      alt="Product preview"
                      className="admin-image-preview"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} />
                </div>
                <div className="admin-two-col-grid">
                  <div className="form-group">
                    <label>Brand</label>
                    <input name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Shoes Hub" />
                  </div>
                  <div className="form-group">
                    <label>Sale Price (optional)</label>
                    <input type="number" name="salePrice" value={formData.salePrice} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Sizes (comma separated)</label>
                  <input name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="40,41,42" />
                </div>
                <label><input type="checkbox" checked={formData.featured} onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.checked }))} /> Featured product</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">{editingId ? 'Update' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
