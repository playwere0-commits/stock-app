import StatsCards from "../components/StatsCards"

const Overview = ({ sales, products }) => {

  return (
    <>
      <h2>Overview</h2>

      <StatsCards
        sales={sales}
        products={products}
      />
    </>
  )

}

export default Overview