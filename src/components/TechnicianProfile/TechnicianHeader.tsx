import React from "react"

interface TechnicianHeaderProps {
  name: string
  specialization: string
  location: string
  experience?: string
  rating?: number
  contact?: string
  verified?: boolean
  imageUrl?: string
}

const TechnicianHeader: React.FC<TechnicianHeaderProps> = ({
  name,
  specialization,
  location,
  experience,
  rating,
  contact,
  verified,
  imageUrl,
}) => {
  return (
    <header className="p-6 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      
      {/* Left: Technician Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 flex-1">
        {/* Profile Image */}
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-semibold text-gray-600 dark:text-gray-300">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info Text */}
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {name}
            </h2>
            {verified && (
              <span className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M13.485 1.929a.75.75 0 0 1 .086 1.057l-7.25 8.25a.75.75 0 0 1-1.086.03L2.43 8.293a.75.75 0 1 1 1.06-1.06l2.44 2.44 6.72-7.64a.75.75 0 0 1 1.057-.086Z" />
                </svg>
                Verified
              </span>
            )}
          </div>
          <p className="text-blue-700 dark:text-blue-400 font-medium text-lg mb-1">
            {specialization}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap justify-center sm:justify-start gap-2">
            <span>📍 {location}</span>
            {experience && <span>• {experience}</span>}
          </p>

          {/* Rating */}
          {rating && (
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill={i < Math.round(rating) ? "gold" : "#d1d5db"}
                  className="w-5 h-5"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.09 3.356a1 1 0 0 0 .95.69h3.525c.969 0 1.371 1.24.588 1.81l-2.857 2.074a1 1 0 0 0-.364 1.118l1.09 3.356c.3.921-.755 1.688-1.54 1.118l-2.857-2.074a1 1 0 0 0-1.176 0l-2.857 2.074c-.784.57-1.838-.197-1.54-1.118l1.09-3.356a1 1 0 0 0-.364-1.118L2.896 8.783c-.783-.57-.38-1.81.588-1.81h3.525a1 1 0 0 0 .95-.69l1.09-3.356z" />
                </svg>
              ))}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                {rating.toFixed(1)} / 5.0
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Contact Section */}
      <div className="flex justify-center sm:justify-end flex-wrap gap-3">
        {contact && (
          <>
            <a
              href={`tel:${contact}`}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
            >
              📞 Call
            </a>
            <a
              href={`https://wa.me/${contact.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
            >
              💬 Message
            </a>
          </>
        )}
      </div>
    </header>
  )
}

export default TechnicianHeader
