import { useEffect, useState, useMemo } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import ProductForm from "../components/ProductForm"
import SalesModal from "../components/SalesModal"
import StatsCards from "../components/StatsCards"
import SalesTable from "../components/SalesTable"
import EditProductModal from "../components/EditProductModal"
import "./dashboard.css"

const ITEMS_PER_PAGE = 5

const Dashboard = () => {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [account, setAccount] = useState(null)
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [categories, setCategories] = useState([])

  const [activeView, setActiveView] = useState("overview")

  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const [sellModalOpen, setSellModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // =========================
  // FECHA LOCAL
  // =========================

  const getLocalDate = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset()
    const local = new Date(now.getTime() - offset * 60000)
    return local.toISOString().split("T")[0]
  }
  const today = getLocalDate()
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)

  // =========================
  // TEMA
  // =========================
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  )
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  // =========================
  // CARGAR DATOS
  // =========================

  const fetchInitialData = async () => {
    if (!user) return
    try {
      const { data: accountData, error: accountError } = await supabase
        .from("accounts")
        .select("*")
        .eq("owner_id", user.id)
        .single()
      if (accountError || !accountData) {
        navigate("/onboarding")
        return
      }
      setAccount(accountData)

      // PRODUCTOS

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("account_id", accountData.id)
        .order("created_at", { ascending: false })

      setProducts(productsData || [])

      // CATEGORIAS

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("account_id", accountData.id)
        .order("name")

      setCategories(categoriesData || [])

      // VENTAS

      fetchSales(accountData.id, today, today)
      setLoading(false)
    } catch (err) {
      console.error("Error cargando datos:", err)
      setLoading(false)
    }
  }

  // =========================
  // VENTAS
  // =========================

  const fetchSales = async (accountId, from, to) => {

    let query = supabase
      .from("sales")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })

    if (from) query = query.gte("created_at", from)
    if (to) query = query.lte("created_at", to + "T23:59:59")

    const { data } = await query

    setSales(data || [])

  }

  useEffect(() => {
    fetchInitialData()
  }, [user])

  useEffect(() => {
    if (account) fetchSales(account.id, startDate, endDate)
  }, [startDate, endDate])

  // =========================
  // FILTROS PRODUCTOS
  // =========================

  const filteredProducts = useMemo(() => {
    let result = [...products]
    if (searchTerm) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (stockFilter === "low")
      result = result.filter(p => p.stock <= p.min_stock)
    if (stockFilter === "out")
      result = result.filter(p => p.stock === 0)

    return result

  }, [products, searchTerm, stockFilter])

  // =========================
  // PAGINACION
  // =========================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  )

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // =========================
  // CRUD PRODUCTOS
  // =========================

  const handleCreate = async (data) => {
    const { data: newProduct, error } = await supabase
      .from("products")
      .insert([{ ...data, account_id: account.id }])
      .select()
      .single()

    if (error) {
      alert("Error creando producto")
      return
    }

    setProducts(prev => [newProduct, ...prev])
  }

  const handleUpdate = async (data) => {
  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", editingProduct.id)

  if (error) {
    alert("Error actualizando producto")
    return
  }

  setProducts(prev =>
    prev.map(p =>
      p.id === editingProduct.id
        ? { ...p, ...data }
        : p
    )
  )

  setEditingProduct(null)
  setEditModalOpen(false)
}

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return
    await supabase
      .from("products")
      .delete()
      .eq("id", id)

    setProducts(prev =>
      prev.filter(p => p.id !== id)
    )
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div className="layout">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <h3>{account.name}</h3>

        <button onClick={() => setActiveView("overview")}>
          🏠 Overview
        </button>

        <button onClick={() => setActiveView("products")}>
          📦 Productos
        </button>

        <button onClick={() => setActiveView("sales")}>
          💰 Ventas
        </button>

        <hr />

        <button
          onClick={() =>
            setTheme(prev =>
              prev === "light" ? "dark" : "light"
            )
          }
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>

      </aside>

      {/* CONTENIDO */}

      <main className="content">

        {activeView === "overview" && (
          <>
            <h2>Overview</h2>
            <StatsCards
              sales={sales}
              products={products}
            />
          </>
        )}

        {activeView === "products" && (

  <>

    <h2>Productos</h2>

    <ProductForm
      businessType={account.business_type}
      onSubmit={handleCreate}
      categories={categories}
    />

    {/* BUSCADOR */}

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

    {/* CONTADOR PRODUCTOS */}

    <p className="product-count">
      {filteredProducts.length} productos
    </p>

    {/* TABLA PRODUCTOS */}

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
              {
                categories.find(c =>
                  c.id === product.category_id
                )?.name || "Sin categoría"
              }
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
                Editar
              </button>

              <button
                className="delete-btn"
                onClick={() =>
                  handleDelete(product.id)
                }
              >
                Eliminar
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

    {/* PAGINACION */}

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

)}

        {activeView === "sales" && (
          <>

            <h2>Ventas</h2>

            <div style={{ marginBottom: 10 }}>

              <button
                onClick={() => {

                  const date = new Date()
                  date.setDate(date.getDate() - 1)

                  const offset = date.getTimezoneOffset()
                  const local = new Date(
                    date.getTime() - offset * 60000
                  )

                  const yesterday =
                    local.toISOString().split("T")[0]

                  setStartDate(yesterday)
                  setEndDate(yesterday)

                }}
              >
                Ayer
              </button>

              <button
                onClick={() => {

                  const today = getLocalDate()

                  setStartDate(today)
                  setEndDate(today)

                }}
              >
                Hoy
              </button>

            </div>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
            />

            <SalesTable
              sales={sales}
              products={products}
            />

          </>
        )}

      </main>

      <SalesModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        product={selectedProduct}
        account={account}
        supabase={supabase}
        onSaleSuccess={() => fetchInitialData()}
      />

      <EditProductModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        onSubmit={handleUpdate}
        businessType={account.business_type}
        categories={categories}
      />

    </div>
  )

}

export default Dashboard