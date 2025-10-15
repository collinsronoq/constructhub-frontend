import React from "react"

interface VendorAboutProps {
  description?: string
  yearsInBusiness?: number
  specialty?: string
  deliverySupport?: boolean
  paymentMethods?: string[]
  operatingHours?: {
    open: string
    close: string
    days: string
  }
}

const VendorAbout: React.FC<VendorAboutProps> = ({
  description = "We are a trusted supplier of premium construction materials, offering reliable service and competitive pricing to builders and contractors across Kenya.",
  yearsInBusiness = 7,
  specialty = "General Construction Materials",
  deliverySupport = true,
  paymentMethods = ["Cash", "M-Pesa", "Bank Transfer"],
  operatingHours = {
    open: "8:00 AM",
    close: "6:00 PM",
    days: "Mon - Sat",
  },
}) => {
  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-8">
      {/* Section Header */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        About Vendor
      </h2>

      {/* Vendor Description */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
        {description}
      </p>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <span className="text-blue-600 dark:text-blue-400 text-xl">🏗️</span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Years in Business</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {yearsInBusiness}+ years
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <span className="text-blue-600 dark:text-blue-400 text-xl">🧰</span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Specialty</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {specialty}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <span className="text-blue-600 dark:text-blue-400 text-xl">🚚</span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Support</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {deliverySupport ? "Available" : "Not available"}
            </p>
          </div>
        </div>

        {/* <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <span className="text-blue-600 dark:text-blue-400 text-xl">💳</span>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Payment Methods</p>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {paymentMethods.join(", ")}
            </p>
          </div>
        </div> */}
      </div>

      {/* Operating Hours */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Operating Hours</p>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {operatingHours.days}: {operatingHours.open} – {operatingHours.close}
          </p>
        </div>
        <span className="mt-3 sm:mt-0 inline-block px-3 py-1 text-sm rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 font-medium">
          Open Now
        </span>
      </div>
    </section>
  )
}

export default VendorAbout
