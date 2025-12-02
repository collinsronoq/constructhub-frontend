import React from "react"
import EstimateCard from "../Estimates/EstimateCard"
import type { EstimateCardProps } from "../Estimates/EstimateCard"
import { useNavigate } from "react-router-dom"




interface EstimationSummaryProps {
  estimates: EstimateCardProps[]
  onViewAll?: () => void
}



const RecentEstimations: React.FC<EstimationSummaryProps> = ({ estimates, onViewAll }) => {

  const navigate = useNavigate();

  // function that navigates to the estimate page when clicked
  const handleViewAll = () =>{
    if(onViewAll){
      onViewAll();
      return;
    }
    navigate("/estimates");
  }

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Estimations</h2>
        
        
      </div>

      {/* Estimation Cards Grid */}
      {/* { estimates.map((estimate) =>(
        <EstimateCard key={estimate.id} {...estimate}/>
      ))} */}
      
      {/* Estimation Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
        {estimates.length > 0 ? (
          estimates.map((estimate) => (
            <EstimateCard key={estimate.id} {...estimate}/>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No estimates yet. Start your first estimation!
          </div>
        )}
      </div>

      <button
        onClick={handleViewAll}
        className="text-blue-600 dark:text-blue-400 text-base md:text-lg hover:underline absolute bottom-0 right-0 p-4"
      >
        {/* suppose to redirect to the estimations page or just fetch all the estimates from the backend, i will see */}
        View All
      </button>
    </section>
  )
}

export default RecentEstimations
