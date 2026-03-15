import SalesTable from "../components/SalesTable"

const Sales = ({
  sales,
  products,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  statsLabel,
  setStatsLabel,
  setActiveView,
  getYesterday,
  getLocalDate,
  getWeekRange,
  getMonthRange
}) => {

  return (
    <>
      <h2>Ventas</h2>

      <div style={{ marginBottom: 10, display: "flex", gap: "8px", flexWrap: "wrap" }}>

        <button
          onClick={() => {
            const yesterday = getYesterday()
            setStartDate(yesterday)
            setEndDate(yesterday)
            setStatsLabel("ayer")
          }}
        >
          Ayer
        </button>

        <button
          onClick={() => {
            const today = getLocalDate()
            setStartDate(today)
            setEndDate(today)
            setStatsLabel("hoy")
          }}
        >
          Hoy
        </button>

        <button
          onClick={() => {
            const { start, end } = getWeekRange()
            setStartDate(start)
            setEndDate(end)
            setStatsLabel("últimos 7 días")
          }}
        >
          Últimos 7 días
        </button>

        <button
          onClick={() => {
            const { start, end } = getMonthRange()
            setStartDate(start)
            setEndDate(end)
            setStatsLabel("este mes")
          }}
        >
          Este mes
        </button>

        {statsLabel && (
          <button
            style={{
              background: "#3b82f6",
              color: "white",
              cursor: "pointer"
            }}
            onClick={() => {
              setActiveView("overview")
              setStatsLabel("")
            }}
          >
            Ver estadísticas de {statsLabel}
          </button>
        )}

      </div>

      <input
        type="date"
        value={startDate}
        onChange={(e) =>
          setStartDate(e.target.value)
        }
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) =>
          setEndDate(e.target.value)
        }
      />

      <SalesTable
        sales={sales}
        products={products}
      />

    </>
  )

}

export default Sales