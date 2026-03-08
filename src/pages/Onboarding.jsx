import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const Onboarding = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [businessType, setBusinessType] = useState("almacen")

  const handleCreateAccount = async (e) => {
    e.preventDefault()

    const { error } = await supabase.from("accounts").insert([
      {
        name,
        business_type: businessType,
        owner_id: user.id,
      }
    ])

    if (error) {
      console.log(error)
      alert("Error creando negocio")
    } else {
      navigate("/dashboard")
    }
  }

  return (
    <form onSubmit={handleCreateAccount}>
      <h2>Crear tu negocio</h2>

      <input
        type="text"
        placeholder="Nombre del negocio"
        onChange={(e) => setName(e.target.value)}
      />

      <select onChange={(e) => setBusinessType(e.target.value)}>
        <option value="almacen">Almacén</option>
        <option value="ropa">Ropa</option>
        <option value="ferreteria">Ferretería</option>
      </select>

      <button type="submit">Crear negocio</button>
    </form>
  )
}

export default Onboarding