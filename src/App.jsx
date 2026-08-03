import React, { useEffect, useState } from 'react';

const emptyForm = { id: null, name: '', description: '', price: '', stock: '' };

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [appInfo, setAppInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.api.getAppInfo().then(setAppInfo);
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await window.api.getProducts();
    setProducts(data);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
    };
    if (!payload.name) {
      setError('يرجى إدخال اسم المنتج');
      return;
    }
    try {
      if (form.id) {
        await window.api.updateProduct({ ...payload, id: form.id });
      } else {
        await window.api.addProduct(payload);
      }
      setForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(p) {
    setForm({ id: p.id, name: p.name, description: p.description, price: p.price, stock: p.stock });
  }

  async function handleDelete(id) {
    await window.api.deleteProduct(id);
    await loadProducts();
  }

  return (
    <div className="container">
      <header className="header">
        <h1>متجر العطور</h1>
        {appInfo && (
          <p className="meta">
            الإصدار {appInfo.version} · Electron {appInfo.electron}
          </p>
        )}
      </header>

      <form className="card form" onSubmit={handleSubmit}>
        <h2>{form.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
        <div className="grid">
          <input
            name="name"
            placeholder="اسم العطر"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="description"
            placeholder="الوصف"
            value={form.description}
            onChange={handleChange}
          />
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="السعر (ر.س)"
            value={form.price}
            onChange={handleChange}
          />
          <input
            name="stock"
            type="number"
            min="0"
            placeholder="الكمية"
            value={form.stock}
            onChange={handleChange}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          {form.id && (
            <button type="button" className="secondary" onClick={() => setForm(emptyForm)}>
              إلغاء
            </button>
          )}
          <button type="submit">{form.id ? 'حفظ التعديلات' : 'إضافة'}</button>
        </div>
      </form>

      <div className="card">
        <h2>المنتجات ({products.length})</h2>
        {products.length === 0 ? (
          <p className="empty">لا توجد منتجات بعد. أضف منتجك الأول!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الوصف</th>
                <th>السعر</th>
                <th>الكمية</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.description || '—'}</td>
                  <td>{Number(p.price).toFixed(2)} ر.س</td>
                  <td>{p.stock}</td>
                  <td className="row-actions">
                    <button className="secondary" onClick={() => startEdit(p)}>
                      تعديل
                    </button>
                    <button className="danger" onClick={() => handleDelete(p.id)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
