import { useMemo } from "react"
import ProductForm from "../components/ProductForm"

const Products = ({
  account,
  categories,
  productsTitle,
  paginatedProducts,
  searchTerm,
  setSearchTerm,
  stockFilter,
  setStockFilter,
  categoryFilter,
  setCategoryFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  handleCreate,
  handleCreateCategory,
  setEditingProduct,
  setEditModalOpen,
  setSelectedProduct,
  setSellModalOpen
}) => {

  const categoryMap = useMemo(() => {

  const map = {}

  categories.forEach(cat => {
    map[cat.id] = cat.name
  })

  return map

}, [categories])

  return (
    <>
      <ProductForm
        businessType={account.business_type}
        onSubmit={handleCreate}
        categories={categories}
        onCreateCategory={handleCreateCategory}
      />

      <h2>{productsTitle}</h2>

      <div className="products-toolbar">

        <input
          className="search-input"
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value="all">Todas las categorías</option>

          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}

        </select>

        <select
          className="stock-filter"
          value={stockFilter}
          onChange={(e) => {
            setStockFilter(e.target.value)
            setCurrentPage(1)
          }}
        >
          <option value="all">Todos</option>
          <option value="low">Stock Bajo</option>
          <option value="out">Sin Stock</option>
        </select>

      </div>

      <table className="products-table">

        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {paginatedProducts.length === 0 && (
            <tr>
              <td colSpan="6" className="no-products">
                No hay productos
              </td>
            </tr>
          )}

          {paginatedProducts.map(product => (

            <tr
              key={product.id}
              onDoubleClick={() => {
                setSelectedProduct(product)
                setSellModalOpen(true)
              }}
            >

              <td className="product-name">
                {product.name}
              </td>

              <td>{product.sku}</td>

              <td>
                {categoryMap[product.category_id] || "Sin categoría"}
              </td>

              <td>
                ${Number(product.base_price).toFixed(2)}
              </td>

              <td
                className={
                  product.stock <= product.min_stock
                    ? "low-stock"
                    : ""
                }
              >
                {product.stock}
              </td>

              <td className="table-actions">

                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingProduct(product)
                    setEditModalOpen(true)
                  }}
                >
                  Detalles
                </button>

                <button
                  className="sell-btn"
                  onClick={() => {
                    setSelectedProduct(product)
                    setSellModalOpen(true)
                  }}
                >
                  Vender
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage(prev => prev - 1)
          }
        >
          Anterior
        </button>

        <span>
          Página {currentPage} de {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage(prev => prev + 1)
          }
        >
          Siguiente
        </button>

      </div>

    </>
  )

}

export default Products