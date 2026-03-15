import { supabase } from "../lib/supabase"

// ============================
// OBTENER PLANTILLAS
// ============================

export const getTemplates = async (accountId) => {

  const { data, error } = await supabase
    .from("product_templates")
    .select("*")
    .or(`account_id.eq.${accountId},is_global.eq.true`)
    .order("name")

  if (error) {
    console.error("Error loading templates:", error)
    return []
  }

  return data
}

// ============================
// OBTENER CAMPOS DE PLANTILLA
// ============================

export const getTemplateFields = async (templateId) => {

  const { data, error } = await supabase
    .from("template_fields")
    .select("*")
    .eq("template_id", templateId)
    .order("name")

  if (error) {
    console.error("Error loading template fields:", error)
    return []
  }

  return data
}

// ============================
// CREAR PLANTILLA
// ============================

export const createTemplate = async (name, icon, accountId) => {

  const { data, error } = await supabase
    .from("product_templates")
    .insert([
      {
        name,
        icon,
        account_id: accountId
      }
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating template:", error)
    return null
  }

  return data
}

// ============================
// CREAR CAMPO DE PLANTILLA
// ============================

export const createTemplateField = async (templateId, name) => {

  const { error } = await supabase
    .from("template_fields")
    .insert([
      {
        template_id: templateId,
        name
      }
    ])

  if (error) {
    console.error("Error creating template field:", error)
  }

}

// ============================
// CREAR PLANTILLAS POR DEFECTO
// ============================

export const createDefaultTemplates = async (accountId) => {

  const defaults = [

    {
      name: "Celular",
      icon: "📱",
      fields: ["Marca", "Modelo", "Capacidad", "Color"]
    },

    {
      name: "Ropa",
      icon: "👕",
      fields: ["Color", "Talle", "Material"]
    },

    {
      name: "Ferretería",
      icon: "🔧",
      fields: ["Marca", "Medida", "Material"]
    },

    {
      name: "Electrodoméstico",
      icon: "📺",
      fields: ["Marca", "Modelo", "Potencia"]
    }

  ]

  for (const template of defaults) {

    const created = await createTemplate(
      template.name,
      template.icon,
      accountId
    )

    if (!created) continue

    for (const field of template.fields) {

      await createTemplateField(
        created.id,
        field
      )

    }

  }

}