

import { useEffect, useState } from 'react';
import NuevoProducto from './NuevoProducto';
import styles from './App.module.css';
import { Routes, Route, useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  title: string;
  price: number;
}

const PAGE_SIZE = 6;


function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editValues, setEditValues] = useState<{ title: string; price: number }>({ title: '', price: 0 });
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('https://dummyjson.com/products')
      .then((res) => res.json())
      .then((data) => {
  setProducts((data.products as Product[]).map((p) => ({ id: p.id, title: p.title, price: p.price })));
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar los productos');
        setLoading(false);
      });
  }, []);

  // Filtro de búsqueda
  const filtered = products.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = () => {
    navigate('/nuevo');
  };



  const handleAddProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    navigate('/');
  };

 

  // Editar
  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setEditValues({ title: product.title, price: product.price });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditProduct(null);
  };
  const handleConfirmEdit = () => {
    if (!editProduct) return;
    const updated = products.map(p =>
      p.id === editProduct.id ? { ...p, title: editValues.title, price: editValues.price } : p
    );
    setProducts(updated);
    handleCloseEditModal();
  };

  // Eliminar
  const handleDelete = (product: Product) => {
    setDeleteProduct(product);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteProduct(null);
  };
  const handleConfirmDelete = () => {
    if (!deleteProduct) return;
    setProducts(products.filter(p => p.id !== deleteProduct.id));
    handleCloseDeleteModal();
  };

  

  const validateEdit = () => {
    if (!editValues.title) return 'El título es requerido';
    if (editValues.price <= 0) return 'El precio debe ser mayor a 0';
    return null;
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className={styles.productListContainer}>
            <h1 style={{ color: '#6366f1', marginBottom: 24 }}>Lista de Productos</h1>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
              <input
                className={styles.input}
                type="text"
                placeholder="Buscar por título..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              <button className={styles.button} onClick={handleAdd}>Añadir</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Título</th>
                  <th className={styles.th}>Precio</th>
                  <th className={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(product => (
                  <tr className={styles.tr} key={product.id}>
                    <td className={styles.td}>{product.id}</td>
                    <td className={styles.td}>{product.title}</td>
                    <td className={styles.td}>${product.price}</td>
                    <td className={styles.td} style={{ display: 'flex', gap: 8 }}>
                      <button className={styles.button} onClick={() => handleEdit(product)}>Editar</button>
                      <button className={styles.button} style={{ background: '#ef4444' }} onClick={() => handleDelete(product)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td className={styles.td} colSpan={4}>No hay productos</td></tr>
                )}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18 }}>
              <button className={styles.button} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
              <span style={{ alignSelf: 'center', color: '#6366f1', fontWeight: 500 }}>Página {page} de {totalPages}</span>
              <button className={styles.button} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</button>
            </div>

            {/* Modal de edición */}
            {showEditModal && editProduct && (
              <div className={styles.modalBg}>
                <div className={styles.modalContent}>
                  <h2>Editar producto</h2>
                  <p><b>ID:</b> {editProduct.id}</p>
                  <div style={{ marginBottom: 12 }}>
                    <label>
                      Título:<br />
                      <input
                        className={styles.input}
                        type="text"
                        value={editValues.title}
                        onChange={e => setEditValues(v => ({ ...v, title: e.target.value }))}
                      />
                    </label>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label>
                      Precio:<br />
                      <input
                        className={styles.input}
                        type="number"
                        value={editValues.price}
                        min={0}
                        onChange={e => setEditValues(v => ({ ...v, price: Number(e.target.value) }))}
                      />
                    </label>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button className={styles.button} onClick={handleConfirmEdit} disabled={!!validateEdit()}>Confirmar</button>
                    <button className={styles.button} onClick={handleCloseEditModal}>Cancelar</button>
                  </div>
                  <div className={styles.error}>{validateEdit()}</div>
                </div>
              </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {showDeleteModal && deleteProduct && (
              <div className={styles.modalBg}>
                <div className={styles.modalContent}>
                  <h2 style={{ color: '#ef4444' }}>¿Eliminar producto?</h2>
                  <p>¿Seguro que deseas eliminar <b>{deleteProduct.title}</b>?</p>
                  <div style={{ marginTop: 16 }}>
                    <button className={styles.button} style={{ background: '#ef4444' }} onClick={handleConfirmDelete}>Eliminar</button>
                    <button className={styles.button} onClick={handleCloseDeleteModal}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />
      <Route path="/nuevo" element={<NuevoProducto onAdd={handleAddProduct} />} />
    </Routes>
  );
}

export default App;
