import { useState, useEffect } from "react"

const ProductForm = ({
  businessType,
  onSubmit,
  initialData,
  onCancel,
  categories = [],
  onCreateCategory
}) => {

  const isEditing = !!initialData

  // =============================
  // GENERADOR DE SKU
  // =============================

  const generateSKU = () => {
    const random = Math.floor(100000 + Math.random() * 900000)
    return `SKU-${random}`
  }

  // =============================
  // CAMPOS GENERALES
  // =============================

  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [location, setLocation] = useState("")
  const [supplier, setSupplier] = useState("")

  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [stock, setStock] = useState("")
  const [minStock, setMinStock] = useState("")

  // =============================
  // ATRIBUTOS DINÁMICOS
  // =============================

  const [color, setColor] = useState("")
  const [size, setSize] = useState("")
  const [expiration, setExpiration] = useState("")
  const [brand, setBrand] = useState("")
  const [measurement, setMeasurement] = useState("")
  const [material, setMaterial] = useState("")

  // =============================
  // CARGA EN MODO EDICIÓN
  // =============================

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setSku(initialData.sku || "")
      setBarcode(initialData.barcode || "")
      setCategoryId(initialData.category_id || "")
      setLocation(initialData.location || "")
      setSupplier(initialData.supplier || "")

      setPrice(initialData.base_price || "")
      setCostPrice(initialData.cost_price || "")
      setStock(initialData.stock || 0)
      setMinStock(initialData.min_stock || 0)

      const attrs = initialData.attributes || {}

      if (businessType === "ropa") {
        setColor(attrs.color || "")
        setSize(attrs.size || "")
      }

      if (businessType === "almacen") {
        setExpiration(attrs.expiration || "")
      }

      if (businessType === "ferreteria") {
        setBrand(attrs.brand || "")
        setMeasurement(attrs.measurement || "")
        setMaterial(attrs.material || "")
      }
    }
  }, [initialData, businessType])

  // =============================
  // SUBMIT
  // =============================

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name || !price) {
      alert("Nombre y precio son obligatorios")
      return
    }

    let attributes = {}

    if (businessType === "ropa") {
      attributes = { color, size }
    }

    if (businessType === "almacen") {
      attributes = { expiration }
    }

    if (businessType === "ferreteria") {
      attributes = { brand, measurement, material }
    }

    const finalSKU = sku.trim() || generateSKU()

    onSubmit({
      name: name.trim(),
      sku: finalSKU,
      barcode: barcode.trim(),
      category_id: categoryId || null,
      location: location.trim(),
      supplier: supplier.trim(),
      base_price: Number(price) || 0,
      cost_price: Number(costPrice) || 0,
      stock: Number(stock) || 0,
      min_stock: Number(minStock) || 0,
      attributes
    })

    if (!isEditing) {
      resetForm()
    }
  }

  // =============================
  // RESET FORM
  // =============================

  const resetForm = () => {
    setName("")
    setSku("")
    setBarcode("")
    setCategoryId("")
    setLocation("")
    setSupplier("")
    setPrice("")
    setCostPrice("")
    setStock("")
    setMinStock("")

    setColor("")
    setSize("")
    setExpiration("")
    setBrand("")
    setMeasurement("")
    setMaterial("")
  }

  // =============================
  // UI
  // =============================

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>

      <h3>{isEditing ? "Editar Producto" : "Nuevo Producto"}</h3>

      {/* IDENTIFICACIÓN */}

      <input
        placeholder="Nombre del producto"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <input
        placeholder="SKU (opcional)"
        value={sku}
        onChange={e => setSku(e.target.value)}
      />

      <input
        placeholder="Código de barras"
        value={barcode}
        onChange={e => setBarcode(e.target.value)}
      />

      <div style={{ marginBottom: 10 }}>

      <select
        value={categoryId}
        onChange={e => setCategoryId(e.target.value)}
      >
        <option value="">Sin categoría</option>

        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}

      </select>

      <button
        type="button"
        style={{ marginLeft: 10 }}
        onClick={async () => {

          const name = prompt("Nombre de la categoría")

          if (!name) return

          const newCategory = await onCreateCategory(name)

        }}
      >
        + Nueva categoría
      </button>

</div>

      <input
        placeholder="Ubicación (ej: Estante A1)"
        value={location}
        onChange={e => setLocation(e.target.value)}
      />

      <input
        placeholder="Proveedor"
        value={supplier}
        onChange={e => setSupplier(e.target.value)}
      />

      {/* PRECIOS */}

      <input
        type="number"
        placeholder="Precio de venta"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Precio de costo"
        value={costPrice}
        onChange={e => setCostPrice(e.target.value)}
      />

      <input
        type="number"
        placeholder="Stock actual"
        min="1"
        value={stock}
        onChange={e => setStock(e.target.value)}
      />

      <input
        type="number"
        placeholder="Stock mínimo"
        min="1"
        value={minStock}
        onChange={e => setMinStock(e.target.value)}
      />

      {/* CAMPOS DINÁMICOS */}

      {businessType === "ropa" && (
        <>
          <input
            placeholder="Color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />

          <input
            placeholder="Talle"
            value={size}
            onChange={e => setSize(e.target.value)}
          />
        </>
      )}

      {businessType === "almacen" && (
        <input
          type="date"
          value={expiration}
          onChange={e => setExpiration(e.target.value)}
        />
      )}

      {businessType === "ferreteria" && (
        <>
          <input
            placeholder="Marca"
            value={brand}
            onChange={e => setBrand(e.target.value)}
          />

          <input
            placeholder="Medida (ej: 5mm)"
            value={measurement}
            onChange={e => setMeasurement(e.target.value)}
          />

          <input
            placeholder="Material"
            value={material}
            onChange={e => setMaterial(e.target.value)}
          />
        </>
      )}

      <br />

      <button type="submit">
        {isEditing ? "Actualizar" : "Guardar"}
      </button>

      {isEditing && (
        <button
          type="button"
          onClick={onCancel}
          style={{ marginLeft: 10 }}
        >
          Cancelar
        </button>
      )}

    </form>
  )
}

export default ProductForm
