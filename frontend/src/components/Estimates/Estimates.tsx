
import React from "react"
import EstimateCard from "./EstimateCard"
import type { EstimateCardProps } from "./EstimateCard"


interface EstimationSummaryProps {
  estimates: EstimateCardProps[] 
  
}





const Estimations: React.FC<EstimationSummaryProps> = ({ estimates }) => {
  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Estimations</h2>
        
        
      </div>

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
      
    </section>
  )
}

export default Estimations
