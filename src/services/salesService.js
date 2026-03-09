import { supabase } from "../lib/supabase"

export const getSales = async (accountId, from, to) => {

  let query = supabase
    .from("sales")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })

  if (from) query = query.gte("created_at", from)
  if (to) query = query.lte("created_at", to + "T23:59:59")

  const { data, error } = await query

  if (error) throw error

  return data
}