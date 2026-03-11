import { useState, useEffect, useRef } from "react"

export default function SalesModal({
  isOpen,
  onClose,
  product,
  account,
  supabase,
  onSaleSuccess
}) {

  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setQuantity("")

      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const handleConfirm = async () => {

    const qty = Number(quantity)

    if (!qty || qty <= 0) {
      onClose()
      return
    }

    setLoading(true)

    const { error } = await supabase.rpc("sell_product", {
      p_account_id: account.id,
      p_product_id: product.id,
      p_quantity: qty
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    onSaleSuccess()
    onClose()
    setQuantity("")
    setLoading(false)
  }

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      handleConfirm()
    }

    if (e.key === "Escape") {
      onClose()
    }

  }

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h3>Vender {product.name}</h3>

        <p>Stock disponible: {product.stock}</p>

        <input
          ref={inputRef}
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Cantidad"
        />

        <div style={{ marginTop: 10 }}>

          <button onClick={handleConfirm} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar"}
          </button>

          <button onClick={onClose}>
            Cancelar
          </button>

        </div>

      </div>
    </div>
  )
}
