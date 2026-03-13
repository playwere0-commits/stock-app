import { supabase } from "../lib/supabase"

export const getAccountByOwner = async (userId) => {

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error obteniendo account:", error)
    return null
  }

  return data
}
