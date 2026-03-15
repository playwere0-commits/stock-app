import { supabase } from "../lib/supabase"

export const getCategoriesByAccount = async (accountId) => {

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("account_id", accountId)
    .order("name")

  if (error) throw error

  return data
}

export const createCategory = async (category) => {

  const { data, error } = await supabase
    .from("categories")
    .insert([category])
    .select()
    .single()

  if (error) throw error

  return data
}