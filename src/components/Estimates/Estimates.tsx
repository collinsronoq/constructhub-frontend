
import React from "react"
import { Link } from "react-router-dom"

interface EstimateCard {
  id: string
  projectName: string
  category: string
  estimatedCost: string
  dateCreated: string
  location: string
}


interface EstimationSummaryProps {
  estimates: EstimateCard[]
  onViewAll?: () => void
}





const Estimations: React.FC<EstimationSummaryProps> = ({ estimates, onViewAll }) => {
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
            <div
              key={estimate.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-background-dark shadow hover:shadow-md transition"
            >
              <div className="flex items-center space-x-2 text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 ml-2 my-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 md:size-5">
                  <path d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
                </svg>
                <h3>
                  {estimate.projectName}
                </h3>
                
              </div>
              
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 ml-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                  estimate.category === "Residential"
                    ? "bg-blue-100 text-blue-700"
                    : estimate.category === "Commercial"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {estimate.category}
                </span>
              </p>

              <div className="mt-3 text-gray-600 dark:text-gray-300 my-2 text-xs md:text-sm">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 md:size-5">
                    <path fill-rule="evenodd" d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" />
                  </svg>
                  <p>
                    Location: 
                    <span className="font-medium ml-2">{estimate.location}</span>
                  </p>
                </div>
                
                <div className="flex items-center text-gray-900 dark:text-gray-100 space-x-2 my-2 text-xs md:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 md:size-5">
                    <path fill-rule="evenodd" d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3Zm9 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-6.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM11.5 6A.75.75 0 1 1 13 6a.75.75 0 0 1-1.5 0Z" clip-rule="evenodd" />
                    <path d="M13 11.75a.75.75 0 0 0-1.5 0v.179c0 .15-.138.28-.306.255A65.277 65.277 0 0 0 1.75 11.5a.75.75 0 0 0 0 1.5c3.135 0 6.215.228 9.227.668A1.764 1.764 0 0 0 13 11.928v-.178Z" />
                  </svg>
                  <p >
                    Estimated Cost:
                    <span className="font-medium  ml-2">
                      {estimate.estimatedCost}
                    </span>
                  </p>
                </div>
                
                
                <div className="flex items-center  text-gray-500 dark:text-gray-400 my-2 space-x-2 text-xs md:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 md:size-5">
                    <path fill-rule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 6a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7Z" clip-rule="evenodd" />
                  </svg>
                  <p className=" text-gray-500 dark:text-gray-400 mt-1">
                    Created on: {estimate.dateCreated}
                  </p>
                </div>
                
              </div>
              

               {/* View Details Button, should lead to a page which ahs a detailed breakdown of the estimate */}
              <div className="mt-4 ">
                <Link
                  to={`/estimation/${estimate.id}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  View Details
                </Link>
              </div>
              
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No estimates yet. Start your first estimation!
          </div>
        )}
      </div>
      <button
        onClick={onViewAll}
        className="text-blue-600 dark:text-blue-400 text-base md:text-lg hover:underline absolute bottom-0 right-0 p-4"
      >
        {/* suppose to redirect to the estimations page or just fetch all the estimates from the backend, i will see */}
        View All
      </button>
    </section>
  )
}

export default Estimations
