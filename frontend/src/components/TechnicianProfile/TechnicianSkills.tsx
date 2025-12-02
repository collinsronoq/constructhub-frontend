import React from "react"

interface TechnicianExperienceProps {
  experience?: string
  certifications?: string[]
  verified?: boolean
}

const TechnicianExperience: React.FC<TechnicianExperienceProps> = ({
  experience,
  certifications = [],
  verified = false,
}) => {
  return (
    <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
      {/* Section Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Experience & Certifications
      </h3>

      {/* Experience Summary */}
      {experience ? (
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          <span className="font-medium">Experience:</span> {experience}
        </p>
      ) : (
        <p className="italic text-gray-500 dark:text-gray-400 mb-6">
          Experience details not yet provided.
        </p>
      )}

      {/* Certifications List */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
          Certifications
        </h4>
        {certifications.length > 0 ? (
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {certifications.map((cert, index) => (
              <li
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                {cert}
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-gray-500 dark:text-gray-400">
            No certifications added yet.{" "}
            {verified
              ? "Add your credentials to build trust with builders."
              : "Verify your profile to display certifications."}
          </p>
        )}
      </div>
    </section>
  )
}

export default TechnicianExperience
