import { useState } from "react"

export default function SalesModal({
  isOpen,
  onClose,
  product,
  account,
  supabase,
  onSaleSuccess
}) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  if (!isOpen || !product) return null

  const handleConfirm = async () => {
  if (quantity <= 0) return

  setLoading(true)

  const { error } = await supabase.rpc("sell_product", {
    p_account_id: account.id,
    p_product_id: product.id,
    p_quantity: quantity
  })

  if (error) {
    alert(error.message)
    setLoading(false)
    return
  }

  onSaleSuccess()
  onClose()
  setLoading(false)
}

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Vender {product.name}</h3>

        <p>Stock disponible: {product.stock}</p>

        <input
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={handleConfirm} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar"}
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}