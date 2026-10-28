import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  ClipboardList,
  ChartNoAxesCombined,
  Search,
  Bell,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  PackageCheck,
  AlertTriangle,
  Warehouse,
  ChevronDown,
  Menu,
  X,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Package,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';
import './style.css';

const API = 'http://localhost:8080/api';
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));
const fmt = d => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

function App() {
  const [page, setPage] = useState('Overview');
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [movements, setMovements] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState('');
  const [mobile, setMobile] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: 'Equipment', quantity: 0, reorderLevel: 10, unitPrice: 0, location: 'A-01-01' });
  const [stockForm, setStockForm] = useState({ id: '', type: 'STOCK_IN', quantity: 1, note: '' });
  const [orderForm, setOrderForm] = useState({ customerName: '', productId: '', quantity: 1 });

  async function req(path, opts = {}) {
    const r = await fetch(API + path, { headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) }, ...opts });
    if (!r.ok) {
      let e = {};
      try { e = await r.json(); } catch {}
      throw Error(e.error || `Request failed (${r.status})`);
    }
    if (r.status === 204) return null;
    return r.json();
  }

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [d, p, o, m] = await Promise.all([req('/dashboard'), req('/products'), req('/orders'), req('/stock-movements')]);
      setData(d);
      setProducts(p);
      setOrders(o);
      setMovements(m);
    } catch (e) {
      setError(e.message + ' — make sure the Spring Boot API and MySQL are running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.sku} ${p.category} ${p.location}`.toLowerCase().includes(q.toLowerCase())), [products, q]);
  const low = products.filter(p => p.quantity <= p.reorderLevel);
  const nav = [['Overview', LayoutDashboard], ['Inventory', Boxes], ['Stock movements', ArrowLeftRight], ['Orders', ClipboardList], ['Reports', ChartNoAxesCombined]];

  async function saveProduct(e) {
    e.preventDefault();
    try {
      await req('/products', {
        method: 'POST',
        body: JSON.stringify({ ...form, quantity: Number(form.quantity), reorderLevel: Number(form.reorderLevel), unitPrice: Number(form.unitPrice) })
      });
      setModal('');
      setForm({ name: '', sku: '', category: 'Equipment', quantity: 0, reorderLevel: 10, unitPrice: 0, location: 'A-01-01' });
      await load();
      setToast('Product added successfully');
    } catch (e) {
      setError(e.message);
    }
  }

  async function changeStock(e) {
    e.preventDefault();
    try {
      await req(`/products/${stockForm.id}/stock`, {
        method: 'POST',
        body: JSON.stringify({ type: stockForm.type, quantity: Number(stockForm.quantity), note: stockForm.note })
      });
      setModal('');
      await load();
      setToast('Stock movement recorded');
    } catch (e) {
      setError(e.message);
    }
  }

  async function createOrder(e) {
    e.preventDefault();
    try {
      await req('/orders', {
        method: 'POST',
        body: JSON.stringify({ customerName: orderForm.customerName, items: [{ productId: Number(orderForm.productId), quantity: Number(orderForm.quantity) }] })
      });
      setModal('');
      await load();
      setToast('Order processed and stock updated');
    } catch (e) {
      setError(e.message);
    }
  }

  const chart = [
    { day: 'Mon', inbound: 42, outbound: 26 },
    { day: 'Tue', inbound: 35, outbound: 31 },
    { day: 'Wed', inbound: 58, outbound: 38 },
    { day: 'Thu', inbound: 43, outbound: 28 },
    { day: 'Fri', inbound: 67, outbound: 46 },
    { day: 'Sat', inbound: 52, outbound: 35 },
    { day: 'Sun', inbound: 76, outbound: 51 }
  ];

  return (
    <div className="app">
      <aside className={`sidebar ${mobile ? 'mobile' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Warehouse size={22} /></div>
          <div><b>stockpilot<span>.</span></b><small>WAREHOUSE OS</small></div>
          <button className="mobile-close" onClick={() => setMobile(false)}><X /></button>
        </div>
        <div className="workspace">
          <div className="workspace-icon">NW</div>
          <div><b>Northstar Warehouse</b><small>Operations workspace</small></div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map(([n, I]) => (
            <button key={n} className={`nav-item ${page === n ? 'active' : ''}`} onClick={() => { setPage(n); setMobile(false); }}>
              <I size={18} /><span>{n}</span>{n === 'Inventory' && low.length > 0 && <em>{low.length}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><PackageCheck size={18} /></div>
            <b>Warehouse health</b>
            <p>{low.length ? `${low.length} items need attention.` : 'All stock levels look healthy.'}</p>
            <button onClick={() => setPage('Inventory')}>Review inventory <span>→</span></button>
          </div>
          <div className="profile">
            <div className="avatar">OP</div>
            <div><b>Operations Admin</b><small>Warehouse manager</small></div>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setMobile(true)}><Menu /></button>
          <div className="crumb">Workspace <span>/</span> <b>{page}</b></div>
          <div className="top-actions">
            <div className="system-status"><i /> Systems operational</div>
            <button className="icon-btn" title="Refresh" onClick={load}><RefreshCw size={17} /></button>
            <button className="icon-btn notification" title="Alerts" onClick={() => setPage('Inventory')}><Bell size={18} />{low.length > 0 && <i />}</button>
            <div className="top-avatar">OP</div>
          </div>
        </header>
        <div className="content">
          <div className="page-head">
            <div>
              <div className="eyebrow">SATURDAY, OCTOBER 17, 2026 <span>·</span> LIVE OPERATIONS</div>
              <h1>{page === 'Overview' ? 'Warehouse overview' : page}</h1>
              <p>{page === 'Overview' ? 'A clear view of your inventory, order flow, and warehouse performance.' : page === 'Inventory' ? 'Manage SKUs, monitor stock levels, and take action before you run out.' : page === 'Stock movements' ? 'A traceable record of every inbound and outbound stock transaction.' : page === 'Orders' ? 'Process fulfillment orders and keep inventory in sync.' : 'Understand inventory value, availability, and operational trends.'}</p>
            </div>
            <div className="head-buttons">
              <button className="btn secondary" onClick={() => {
                const csv = ['SKU,Product,Category,Quantity,Reorder Level,Unit Price,Location', ...products.map(p => [p.sku, `"${p.name}"`, p.category, p.quantity, p.reorderLevel, p.unitPrice, p.location].join(','))].join('\n');
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
                a.download = 'stockpilot-inventory.csv';
                a.click();
                URL.revokeObjectURL(a.href);
              }}>
                <ArrowDownToLine size={16} /> Export
              </button>
              <button className="btn primary" onClick={() => setModal('product')}><Plus size={17} /> Add product</button>
            </div>
          </div>
          {error && <div className="error-banner"><AlertTriangle size={18} /><span>{error}</span><button onClick={() => setError('')}><X size={16} /></button></div>}
          {loading && <div className="loading"><RefreshCw className="spin" /> Connecting to warehouse services…</div>}

          {page === 'Overview' && <>
            <div className="stats-grid">
              <Stat icon={Boxes} label="Total SKUs" value={data?.totalProducts ?? '—'} sub="Unique product lines" tone="blue" />
              <Stat icon={Package} label="Units in stock" value={(data?.totalUnits ?? 0).toLocaleString('en-IN')} sub="Across all locations" tone="purple" />
              <Stat icon={AlertTriangle} label="Low stock alerts" value={data?.lowStockCount ?? '—'} sub={low.length ? 'Requires replenishment' : 'No action required'} tone="orange" />
              <Stat icon={TrendingUp} label="Inventory value" value={money(data?.inventoryValue)} sub="Based on unit cost" tone="green" />
            </div>
            <div className="overview-grid">
              <section className="panel chart-panel">
                <div className="panel-head">
                  <div><h3>Stock movement</h3><p>Inbound vs outbound · this week</p></div>
                  <span className="select-pill">Last 7 days <ChevronDown size={14} /></span>
                </div>
                <div className="legend"><span><i className="legend-in" /> Stock received</span><span><i className="legend-out" /> Stock dispatched</span></div>
                <div className="chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="inFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity={.2} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#929bad', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#929bad', fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="inbound" name="Stock received" stroke="#14b8a6" fill="url(#inFill)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="outbound" name="Stock dispatched" stroke="#7787f7" fill="#7787f7" fillOpacity={.06} strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-foot"><span><i /> Inventory flow is illustrative demo data</span><b>Live inventory: {data?.totalUnits ?? 0} units</b></div>
              </section>
              <section className="panel alerts-panel">
                <div className="panel-head">
                  <div><h3>Needs attention</h3><p>Items at or below reorder level</p></div>
                  <button className="text-link" onClick={() => setPage('Inventory')}>View all <span>→</span></button>
                </div>
                <div className="alert-list">
                  {low.slice(0, 4).map(p => (
                    <div className="alert-row" key={p.id}>
                      <div className="product-symbol"><Package size={18} /></div>
                      <div className="alert-info">
                        <b>{p.name}</b>
                        <small>{p.sku} · {p.location}</small>
                        <div className="progress"><i style={{ width: `${Math.min(100, p.quantity / Math.max(1, p.reorderLevel) * 100)}%` }} /></div>
                      </div>
                      <div className="alert-count"><b>{p.quantity}</b><small>left</small></div>
                    </div>
                  ))}
                  {low.length === 0 && <div className="empty"><CheckCircle2 size={24} /><b>You're all caught up</b><span>No low-stock items right now.</span></div>}
                </div>
                <button className="replenish-btn" onClick={() => setPage('Inventory')}>Review replenishment list <span>→</span></button>
              </section>
            </div>
            <section className="panel table-panel">
              <div className="panel-head">
                <div><h3>Inventory snapshot</h3><p>Your most recently listed product lines</p></div>
                <button className="text-link" onClick={() => setPage('Inventory')}>All inventory <span>→</span></button>
              </div>
              <ProductTable products={products.slice(0, 5)} onStock={p => { setStockForm({ ...stockForm, id: p.id }); setModal('stock'); }} />
            </section>
            <div className="bottom-grid">
              <section className="panel recent-panel">
                <div className="panel-head">
                  <div><h3>Recent stock activity</h3><p>Latest inventory transactions</p></div>
                  <button className="text-link" onClick={() => setPage('Stock movements')}>Activity log →</button>
                </div>
                <Movements items={movements.slice(0, 4)} />
              </section>
              <section className="panel performance-panel">
                <div className="panel-head">
                  <div><h3>Warehouse at a glance</h3><p>Current operating indicators</p></div>
                </div>
                <div className="metric-row">
                  <div className="metric-icon mint"><PackageCheck size={18} /></div>
                  <div><b>Stock availability</b><small>Products with stock on hand</small></div>
                  <strong>{products.length ? Math.round(products.filter(p => p.quantity > 0).length / products.length * 100) : 0}%</strong>
                </div>
                <div className="metric-row">
                  <div className="metric-icon violet"><ClipboardList size={18} /></div>
                  <div><b>Orders processed</b><small>Recorded customer orders</small></div>
                  <strong>{orders.length}</strong>
                </div>
                <div className="metric-row">
                  <div className="metric-icon amber"><Clock3 size={18} /></div>
                  <div><b>Reorder monitoring</b><small>Items at threshold</small></div>
                  <strong>{low.length}</strong>
                </div>
              </section>
            </div>
          </>}

          {page === 'Inventory' && (
            <section className="panel table-panel full-table">
              <div className="table-toolbar">
                <div><h3>All products <span className="count-badge">{filtered.length}</span></h3><p>Search, inspect, and update your stock</p></div>
                <div className="table-actions">
                  <div className="searchbox"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, SKU, location…" /></div>
                  <button className="btn primary" onClick={() => setModal('product')}><Plus size={16} /> Add product</button>
                </div>
              </div>
              <ProductTable products={filtered} onStock={p => { setStockForm({ ...stockForm, id: p.id }); setModal('stock'); }} />
            </section>
          )}

          {page === 'Stock movements' && (
            <section className="panel table-panel full-table">
              <div className="panel-head">
                <div><h3>Stock movement log</h3><p>Most recent inbound and outbound transactions</p></div>
                <button className="btn primary" onClick={() => setModal('stock')}><Plus size={16} /> Record movement</button>
              </div>
              <Movements items={movements} />
            </section>
          )}

          {page === 'Orders' && (
            <section className="panel table-panel full-table">
              <div className="panel-head">
                <div><h3>Customer orders</h3><p>Order processing and stock allocation</p></div>
                <button className="btn primary" onClick={() => setModal('order')}><Plus size={16} /> Create order</button>
              </div>
              {orders.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>STATUS</th><th>CREATED</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td className="sku">ORD-{String(o.id).padStart(5, '0')}</td>
                          <td className="name-cell">{o.customerName}</td>
                          <td>{o.items?.length || 0} line(s)</td>
                          <td><span className="status completed">{o.status}</span></td>
                          <td>{fmt(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty large">
                  <ClipboardList size={28} />
                  <b>No orders yet</b>
                  <span>Create an order to reserve stock and record fulfillment.</span>
                  <button className="btn primary" onClick={() => setModal('order')}>Create your first order</button>
                </div>
              )}
            </section>
          )}

          {page === 'Reports' && <>
            <div className="stats-grid">
              <Stat icon={Boxes} label="Product lines" value={products.length} sub="Registered SKUs" tone="blue" />
              <Stat icon={Package} label="Units available" value={data?.totalUnits ?? 0} sub="Current on-hand quantity" tone="purple" />
              <Stat icon={TrendingUp} label="Inventory valuation" value={money(data?.inventoryValue)} sub="Quantity × unit price" tone="green" />
              <Stat icon={AlertTriangle} label="Replenishment items" value={low.length} sub="Need review" tone="orange" />
            </div>
            <section className="panel table-panel">
              <div className="panel-head">
                <div><h3>Stock by category</h3><p>Current quantity grouped by product category</p></div>
              </div>
              <div className="chart report-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(products.reduce((a, p) => (a[p.category] = (a[p.category] || 0) + p.quantity, a), {})).map(([category, units]) => ({ category, units }))} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf3" />
                    <XAxis dataKey="category" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="units" fill="#5a67d8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="panel table-panel">
              <div className="panel-head">
                <div><h3>Low-stock report</h3><p>Items that need replenishment planning</p></div>
                <button className="btn secondary" onClick={() => setPage('Inventory')}>Manage stock</button>
              </div>
              <ProductTable products={low} onStock={p => { setStockForm({ ...stockForm, id: p.id }); setModal('stock'); }} />
            </section>
          </>}

          <footer>© 2026 StockPilot Operations <span>Built for clarity. Designed for control.</span></footer>
        </div>
      </main>

      {modal && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal('')}>
          <div className="modal">
            <div className="modal-head">
              <div>
                <h2>{modal === 'product' ? 'Add a product' : modal === 'stock' ? 'Record stock movement' : 'Create fulfillment order'}</h2>
                <p>{modal === 'product' ? 'Add a new SKU to your warehouse catalog.' : modal === 'stock' ? 'Log incoming or outgoing inventory with an audit note.' : 'Allocate available stock and process a customer order.'}</p>
              </div>
              <button className="icon-btn" onClick={() => setModal('')}><X size={19} /></button>
            </div>
            {modal === 'product' && (
              <form onSubmit={saveProduct} className="form-grid">
                <label className="wide">Product name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Industrial barcode scanner" /></label>
                <label>SKU / Item code<input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="WHS-1007" /></label>
                <label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{['Equipment', 'Packaging', 'Safety', 'Electronics', 'Consumables', 'Other'].map(c => <option key={c}>{c}</option>)}</select></label>
                <label>Opening quantity<input required min="0" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></label>
                <label>Reorder level<input required min="0" type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} /></label>
                <label>Unit price (₹)<input required min="0" step="0.01" type="number" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} /></label>
                <label>Bin / location<input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="A-01-01" /></label>
                <div className="form-foot wide"><button type="button" className="btn secondary" onClick={() => setModal('')}>Cancel</button><button className="btn primary">Save product</button></div>
              </form>
            )}
            {modal === 'stock' && (
              <form onSubmit={changeStock} className="form-grid">
                <label className="wide">
                  Product
                  <select required value={stockForm.id} onChange={e => setStockForm({ ...stockForm, id: e.target.value })}>
                    <option value="">Select a product…</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.sku} ({p.quantity} available)</option>)}
                  </select>
                </label>
                <label>Movement type<select value={stockForm.type} onChange={e => setStockForm({ ...stockForm, type: e.target.value })}><option value="STOCK_IN">Stock received (+)</option><option value="STOCK_OUT">Stock dispatched (−)</option></select></label>
                <label>Quantity<input type="number" min="1" required value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} /></label>
                <label className="wide">Reason / reference<input value={stockForm.note} onChange={e => setStockForm({ ...stockForm, note: e.target.value })} placeholder="e.g. PO-2048 received at dock 2" /></label>
                <div className="form-foot wide"><button type="button" className="btn secondary" onClick={() => setModal('')}>Cancel</button><button className="btn primary">Record movement</button></div>
              </form>
            )}
            {modal === 'order' && (
              <form onSubmit={createOrder} className="form-grid">
                <label className="wide">Customer / destination<input required value={orderForm.customerName} onChange={e => setOrderForm({ ...orderForm, customerName: e.target.value })} placeholder="Customer or receiving location" /></label>
                <label className="wide">
                  Product
                  <select required value={orderForm.productId} onChange={e => setOrderForm({ ...orderForm, productId: e.target.value })}>
                    <option value="">Choose an in-stock product…</option>
                    {products.filter(p => p.quantity > 0).map(p => <option key={p.id} value={p.id}>{p.name} — {p.quantity} available</option>)}
                  </select>
                </label>
                <label>Quantity<input type="number" min="1" required value={orderForm.quantity} onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })} /></label>
                <div className="form-foot wide"><button type="button" className="btn secondary" onClick={() => setModal('')}>Cancel</button><button className="btn primary">Process order</button></div>
                <p className="form-hint wide">Stock is validated and reduced in a single database transaction. Orders are marked completed in this demo.</p>
              </form>
            )}
          </div>
        </div>
      )}
      {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub"><span className="stat-dot" />{sub}</div>
    </div>
  );
}

function ProductTable({ products, onStock }) {
  return products.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>PRODUCT / SKU</th><th>CATEGORY</th><th>LOCATION</th><th>ON-HAND</th><th>UNIT PRICE</th><th>STOCK STATUS</th><th>ACTION</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>
                <div className="product-cell">
                  <div className="product-thumb"><Package size={17} /></div>
                  <div className="name-cell">{p.name}<small>{p.sku}</small></div>
                </div>
              </td>
              <td><span className="category-pill">{p.category}</span></td>
              <td className="location">{p.location || '—'}</td>
              <td className="quantity">{p.quantity}<small> units</small></td>
              <td>{money(p.unitPrice)}</td>
              <td><span className={`status ${p.quantity === 0 ? 'out' : p.quantity <= p.reorderLevel ? 'low' : 'healthy'}`}><i />{p.quantity === 0 ? 'Out of stock' : p.quantity <= p.reorderLevel ? 'Low stock' : 'In stock'}</span></td>
              <td><button className="row-action" onClick={() => onStock(p)} title="Update stock"><ArrowLeftRight size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="empty large"><Boxes size={28} /><b>No products found</b><span>Add a product or change your search query.</span></div>
  );
}

function Movements({ items }) {
  return items.length ? (
    <div className="movement-list">
      {items.map(m => (
        <div className="movement-row" key={m.id}>
          <div className={`movement-icon ${m.type === 'STOCK_IN' ? 'in' : 'out'}`}>
            {m.type === 'STOCK_IN' ? <ArrowDownToLine size={17} /> : <ArrowUpFromLine size={17} />}
          </div>
          <div className="movement-main">
            <b>{m.product?.name || 'Product'}</b>
            <small>{m.note || m.type.replace('_', ' ')} · {fmt(m.createdAt)}</small>
          </div>
          <div className={`movement-qty ${m.type === 'STOCK_IN' ? 'positive' : 'negative'}`}>
            {m.type === 'STOCK_IN' ? '+' : '−'}{m.quantity}<small>balance {m.balanceAfter}</small>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="empty"><ArrowLeftRight size={24} /><b>No stock activity yet</b><span>Stock changes will appear here.</span></div>
  );
}

createRoot(document.getElementById('root')).render(<App />);