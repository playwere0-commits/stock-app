import { supabase } from "../lib/supabase"

export const getDashboardStats = async (accountId) => {

  const { data, error } = await supabase.rpc(
    "get_dashboard_stats",
    { p_account_id: accountId }
  )

  if (error) throw error

  return data

}

export const getSalesByDay = async (accountId) => {

  const { data, error } = await supabase.rpc(
    "get_sales_by_day",
    { p_account_id: accountId }
  )

  if (error) throw error

  return data

}