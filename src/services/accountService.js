import { supabase } from "../lib/supabase"

export const getAccountByOwner = async (userId) => {

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("owner_id", userId)
    .single()

  if (error) throw error

  return data
}