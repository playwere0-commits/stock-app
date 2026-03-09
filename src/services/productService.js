import { supabase } from "../lib/supabase"

export const getProducts = async (accountId) => {

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return data
}

export const createProduct = async (product) => {

  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single()

  if (error) throw error

  return data
}

export const updateProduct = async (id, updates) => {

  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)

  if (error) throw error
}

export const deleteProduct = async (id) => {

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) throw error
}