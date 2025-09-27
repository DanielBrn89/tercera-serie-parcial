import { useState } from 'react';
import './App.css';

interface Product {
  id: number;
  title: string;
  price: number;
}

export default function NuevoProducto({ onAdd }: { onAdd: (product: Product) => void }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!title) return 'El título es requerido';
    if (price <= 0) return 'El precio debe ser mayor a 0';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError(null);
    // Optimistic UI: crear producto localmente
    const tempId = Date.now();
    const newProduct = { id: tempId, title, price };
    onAdd(newProduct);
    try {
      const res = await fetch('https://dummyjson.com/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price })
      });
      await res.json();
      // Aquí podrías actualizar el producto con el id real si la API lo devuelve
    } catch {
      setError('Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-list-container">
      <h1 style={{ color: '#6366f1' }}>Nuevo Producto</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
        <div style={{ marginBottom: 16 }}>
          <label>Título:<br />
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: 8 }} />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Precio:<br />
            <input type="number" value={price} min={0} onChange={e => setPrice(Number(e.target.value))} style={{ width: '100%', padding: 8 }} />
          </label>
        </div>
        <button type="submit" disabled={loading || !!validate()}>{loading ? 'Creando...' : 'Crear'}</button>
        <button type="button" style={{ marginLeft: 8 }} onClick={() => window.location.href = '/'}>Cancelar</button>
        <div className="error">{error || validate()}</div>
      </form>
    </div>
  );
}
