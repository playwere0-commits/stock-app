export default function SalesTable({ sales, products }) {

  const getProductName = (id) => {
    return products.find(p => p.id === id)?.name || "Producto"
  }

  return (
    <div>

      <table border="1" cellPadding="5" width="100%">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 && (
            <tr>
              <td colSpan="4">No hay ventas en este período</td>
            </tr>
          )}

          {sales.map(sale => (
            <tr key={sale.id}>
              <td>
                {new Date(sale.created_at).toLocaleString("es-AR", {
                  timeZone: "America/Argentina/Buenos_Aires"
                })}
              </td>
              <td>{getProductName(sale.product_id)}</td>
              <td>{sale.quantity}</td>
              <td>${Number(sale.total_price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}