import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

import ProductForm from "../components/ProductForm"
import SalesModal from "../components/SalesModal"
import StatsCards from "../components/StatsCards"
import SalesTable from "../components/SalesTable"
import EditProductModal from "../components/EditProductModal"

import { supabase } from "../lib/supabase"

import { getAccountByOwner } from "../services/accountService"
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../services/productService"

import { getSales } from "../services/salesService"

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

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  )

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

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


  const getYesterday = () => {
  const date = new Date()
  date.setDate(date.getDate() - 1)

  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)

  return local.toISOString().split("T")[0]
}

const getWeekRange = () => {
  const now = new Date()

  const start = new Date(now)
  start.setDate(now.getDate() - 6)

  const offsetStart = start.getTimezoneOffset()
  const offsetEnd = now.getTimezoneOffset()

  const startLocal = new Date(start.getTime() - offsetStart * 60000)
  const endLocal = new Date(now.getTime() - offsetEnd * 60000)

  return {
    start: startLocal.toISOString().split("T")[0],
    end: endLocal.toISOString().split("T")[0]
  }
}

const getMonthRange = () => {
  const now = new Date()

  const start = new Date(now.getFullYear(), now.getMonth(), 1)

  const offsetStart = start.getTimezoneOffset()
  const offsetEnd = now.getTimezoneOffset()

  const startLocal = new Date(start.getTime() - offsetStart * 60000)
  const endLocal = new Date(now.getTime() - offsetEnd * 60000)

  return {
    start: startLocal.toISOString().split("T")[0],
    end: endLocal.toISOString().split("T")[0]
  }
}

  // =========================
  // CARGAR DATOS
  // =========================

  const fetchInitialData = async () => {

    if (!user) return

    try {

      const accountData = await getAccountByOwner(user.id)

      if (!accountData) {
        navigate("/onboarding")
        return
      }

      setAccount(accountData)

      const productsData = await getProducts(accountData.id)

      setProducts(productsData || [])

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("account_id", accountData.id)
        .order("name")

      setCategories(categoriesData || [])

      const salesData = await getSales(accountData.id, today, today)

      setSales(salesData || [])

      setLoading(false)

    } catch (err) {

      console.error("Error cargando datos:", err)
      setLoading(false)

    }

  }

  // =========================
  // VENTAS
  // =========================

  const fetchSalesData = async (accountId, from, to) => {

    try {

      const salesData = await getSales(accountId, from, to)

      setSales(salesData || [])

    } catch (err) {

      console.error("Error cargando ventas:", err)

    }

  }

  useEffect(() => {
    fetchInitialData()
  }, [user])

  useEffect(() => {

  if (account) {
    fetchSalesData(account.id, startDate, endDate)
  }

}, [account, startDate, endDate])

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

    if (stockFilter === "low") {
      result = result.filter(p => p.stock <= p.min_stock)
    }

    if (stockFilter === "out") {
      result = result.filter(p => p.stock === 0)
    }

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

    try {

      const newProduct = await createProduct({
        ...data,
        account_id: account.id
      })

      setProducts(prev => [newProduct, ...prev])

    } catch {

      alert("Error creando producto")

    }

  }

  const handleUpdate = async (data) => {

    try {

      await updateProduct(editingProduct.id, data)

      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? { ...p, ...data }
            : p
        )
      )

      setEditingProduct(null)
      setEditModalOpen(false)

    } catch {

      alert("Error actualizando producto")

    }

  }

  const handleDelete = async (id) => {

  try {

    await deleteProduct(id)

    setProducts(prev =>
      prev.filter(p => p.id !== id)
    )

  } catch {

    alert("Error eliminando producto")

  }

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

            <p className="product-count">
              {filteredProducts.length} productos
            </p>

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
        )}

        {activeView === "sales" && (
          <>

            <h2>Ventas</h2>

            <div style={{ marginBottom: 10, display: "flex", gap: "8px", flexWrap: "wrap" }}>

             <button
               onClick={() => {
                 const yesterday = getYesterday()
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

             <button
               onClick={() => {
                 const { start, end } = getWeekRange()
                 setStartDate(start)
                 setEndDate(end)
               }}
              >
               Últimos 7 días
             </button>

             <button
               onClick={() => {
                 const { start, end } = getMonthRange()
                 setStartDate(start)
                 setEndDate(end)
               }}
             >
               Este mes
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
        onDelete={handleDelete}
        businessType={account.business_type}
        categories={categories}
      />

    </div>
  )
}

export default Dashboard

