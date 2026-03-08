import ProductForm from "./ProductForm"
import "../pages/dashboard.css"

const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  businessType,
  categories
}) => {

  if (!isOpen || !product) return null

  return (
    <div className="modal-overlay">

      <div className="modal-content">

        <button
          className="modal-close"
          onClick={onClose}
        >
          ✖
        </button>

        <ProductForm
          businessType={businessType}
          onSubmit={onSubmit}
          initialData={product}
          onCancel={onClose}
          categories={categories}
        />

      </div>

    </div>
  )
}

export default EditProductModal