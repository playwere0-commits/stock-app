import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Overview from "../dashboard/Overview"
import Products from "../dashboard/Products"
import Sales from "../dashboard/Sales"

import SalesModal from "../components/SalesModal"
import EditProductModal from "../components/EditProductModal"
import { getCategoriesByAccount, createCategory } from "../services/categoryService"

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
  const [categoryFilter, setCategoryFilter] = useState("all")

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
  const [statsLabel, setStatsLabel] = useState("")


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

  // BUSCAR POR NOMBRE

  if (searchTerm) {

  const term = searchTerm.toLowerCase()

  result = result.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.sku?.toLowerCase().includes(term)
  )

}

  // FILTRO POR CATEGORIA

  if (categoryFilter !== "all") {
    result = result.filter(p => p.category_id === categoryFilter)
  }

  // FILTRO POR STOCK

  if (stockFilter === "low") {
    result = result.filter(p => p.stock <= p.min_stock)
  }

  if (stockFilter === "out") {
    result = result.filter(p => p.stock === 0)
  }

  return result

}, [products, searchTerm, stockFilter, categoryFilter])

// nombre dinamico

const selectedCategory = categories.find(
  c => c.id === categoryFilter
)

const productsTitle =
  categoryFilter === "all"
    ? `Productos (${filteredProducts.length})`
    : `Productos - ${selectedCategory?.name} (${filteredProducts.length})`

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

  const handleCreateCategory = async (name) => {

  try {

    const newCategory = await createCategory({
      name,
      account_id: account.id
    })

    setCategories(prev => [...prev, newCategory])

  } catch {

    alert("Error creando categoría")

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
// boton de stats

useEffect(() => {
  if (activeView !== "sales") {
    setStatsLabel("")
  }
}, [activeView])
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
    <Overview
      sales={sales}
      products={products}
    />
  )}

  {activeView === "products" && (
    <Products
      account={account}
      categories={categories}
      productsTitle={productsTitle}
      paginatedProducts={paginatedProducts}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      stockFilter={stockFilter}
      setStockFilter={setStockFilter}
      categoryFilter={categoryFilter}
      setCategoryFilter={setCategoryFilter}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalPages={totalPages}
      handleCreate={handleCreate}
      handleCreateCategory={handleCreateCategory}
      setEditingProduct={setEditingProduct}
      setEditModalOpen={setEditModalOpen}
      setSelectedProduct={setSelectedProduct}
      setSellModalOpen={setSellModalOpen}
    />
  )}

  {activeView === "sales" && (
    <Sales
      sales={sales}
      products={products}
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      statsLabel={statsLabel}
      setStatsLabel={setStatsLabel}
      setActiveView={setActiveView}
      getYesterday={getYesterday}
      getLocalDate={getLocalDate}
      getWeekRange={getWeekRange}
      getMonthRange={getMonthRange}
    />
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
