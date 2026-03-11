import { useMemo } from "react"

export default function StatsCards({ sales, products }) {

  const stats = useMemo(() => {

    if (!sales || !products) return null

    let grossRevenue = 0
    let totalCost = 0
    let totalProfit = 0

    const productTotals = {}
    const productProfit = {}

    // MAPA DE PRODUCTOS (mucho más rápido)
    const productMap = {}
    products.forEach(p => {
      productMap[p.id] = p
    })

    sales.forEach(sale => {

      const revenue = Number(sale.total_price || 0)
      const cost = Number(sale.unit_cost || 0) * sale.quantity
      const profit = Number(sale.profit || 0)

      grossRevenue += revenue
      totalCost += cost
      totalProfit += profit

      productTotals[sale.product_id] =
        (productTotals[sale.product_id] || 0) + sale.quantity

      productProfit[sale.product_id] =
        (productProfit[sale.product_id] || 0) + profit
    })

    const margin =
      grossRevenue > 0
        ? ((totalProfit / grossRevenue) * 100).toFixed(1)
        : 0

    const topProducts = Object.entries(productTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, qty]) => {

        const product = productMap[productId]

        return {
          name: product?.name || "Producto eliminado",
          qty
        }
      })

    const mostProfitable = Object.entries(productProfit)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, profit]) => {

        const product = productMap[productId]

        return {
          name: product?.name || "Producto eliminado",
          profit
        }
      })

    const lowStockProducts = products.filter(
      p => p.stock <= p.min_stock && p.stock > 0
    )

    const outStockProducts = products.filter(
      p => p.stock === 0
    )

    return {
      grossRevenue,
      totalCost,
      totalProfit,
      margin,
      totalProducts: products.length,
      lowStockProducts,
      outStockProducts,
      topProducts,
      mostProfitable
    }

  }, [sales, products])

  if (!stats) return null

  return (
    <div>

      <div className="stats-grid">

        <div className="card">
          <h4>💰 Ingresos Brutos</h4>
          <p>${stats.grossRevenue.toFixed(2)}</p>
        </div>

        <div className="card">
          <h4>💸 Costos</h4>
          <p>${stats.totalCost.toFixed(2)}</p>
        </div>

        <div className="card">
          <h4>📈 Ganancia</h4>
          <p>${stats.totalProfit.toFixed(2)}</p>
          <small>Margen {stats.margin}%</small>
        </div>

        <div className="card">
          <h4>📦 Productos</h4>
          <p>{stats.totalProducts}</p>
        </div>

      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3>⚠️ Stock Bajo</h3>

        {stats.lowStockProducts.length === 0 ? (
          <p>Todo en orden</p>
        ) : (
          <ul>
            {stats.lowStockProducts.map(p => (
              <li key={p.id}>
                {p.name} — {p.stock} restantes
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3>🔴 Sin Stock</h3>

        {stats.outStockProducts.length === 0 ? (
          <p>No hay productos agotados</p>
        ) : (
          <ul>
            {stats.outStockProducts.map(p => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3>🔥 Productos Más Vendidos</h3>

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

      <div className="card" style={{ marginTop: 20 }}>
        <h3>💎 Productos Más Rentables</h3>

        {stats.mostProfitable.length === 0 ? (
          <p>No hay datos todavía</p>
        ) : (
          <ul>
            {stats.mostProfitable.map((p, i) => (
              <li key={i}>
                {i + 1}. {p.name} — ${p.profit.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
