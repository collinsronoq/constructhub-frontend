import { Link } from "react-router-dom"

export interface VendorCardProps {
  id: string
  name: string
  category: string
  location: string
  rating?: number
  imageUrl?: string
  contact?: string
}


const VendorCard : React.FC<VendorCardProps> =({ id, name, category, location, imageUrl, contact}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col">
      {/* Vendor Image */}
      <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 1 1 15 0v.75H4.5v-.75Z"
            />
          </svg>
        )}
      </div>

      {/* Vendor Info */}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
          {name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {category} • {location}
        </p>

        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 text-blue-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75Zm3 0 6.75 4.5 6.75-4.5"
            />
          </svg>
          <span>{contact}</span>
        </div>
      </div>

      {/* View Profile Button */}
      <Link
        to={`/vendors/${id}`}
        className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm font-medium transition rounded-b-lg"
      >
        View Profile
      </Link>
    </div>
  )
}

export default VendorCard