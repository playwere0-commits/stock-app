import { useMemo } from "react"

export default function StatsCards({ sales, products }) {

  const stats = useMemo(() => {

    if (!sales || !products) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let todayRevenue = 0
    let totalRevenue = 0

    let productTotals = {}

    sales.forEach(sale => {

      const saleDate = new Date(sale.created_at)

      totalRevenue += Number(sale.total_price)

      if (saleDate >= today) {
        todayRevenue += Number(sale.total_price)
      }

      productTotals[sale.product_id] =
        (productTotals[sale.product_id] || 0) + sale.quantity

    })

    // TOP PRODUCTOS

    const topProducts = Object.entries(productTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, qty]) => {

        const product = products.find(p => p.id === productId)

        return {
          name: product?.name || "Producto eliminado",
          qty
        }

      })

    // STOCK STATS

    const lowStock = products.filter(
      p => p.stock <= p.min_stock && p.stock > 0
    ).length

    const outStock = products.filter(
      p => p.stock === 0
    ).length

    return {
      todayRevenue,
      totalRevenue,
      totalProducts: products.length,
      lowStock,
      outStock,
      topProducts
    }

  }, [sales, products])

  if (!stats) return null

  return (

    <div>

      {/* CARDS */}

      <div className="stats-grid">

        <div className="card">
          <h4>💰 Ingresos Hoy</h4>
          <p>${stats.todayRevenue.toFixed(2)}</p>
        </div>

        <div className="card">
          <h4>💰 Ingresos Totales</h4>
          <p>${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="card">
          <h4>📦 Productos</h4>
          <p>{stats.totalProducts}</p>
        </div>

        <div className="card">
          <h4>⚠️ Stock Bajo</h4>
          <p>{stats.lowStock}</p>
        </div>

        <div className="card">
          <h4>🔴 Sin Stock</h4>
          <p>{stats.outStock}</p>
        </div>

      </div>


      {/* TOP PRODUCTOS */}

      <div className="card" style={{ marginTop: 20 }}>

        <h3>🔥 Top Productos Más Vendidos</h3>

        {stats.topProducts.length === 0 ? (
          <p>No hay ventas todavía</p>
        ) : (

          <ul>

            {stats.topProducts.map((p, i) => (

              <li key={i}>
                {i + 1}. {p.name} — {p.qty} vendidos
              </li>

            ))}

          </ul>

        )}

      </div>

    </div>

  )

}