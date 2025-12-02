import React from "react"

interface TechnicianAboutProps {
  bio?: string
  skills?: string[]
  specialization?: string
  verified?: boolean
}

const TechnicianAbout: React.FC<TechnicianAboutProps> = ({
  bio,
  skills = [],
  specialization,
  verified = false,
}) => {
  return (
    <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        About the Technician
      </h3>

      {/* Bio Section */}
      <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
        {bio ? (
          <p>{bio}</p>
        ) : (
          <p className="italic text-gray-500 dark:text-gray-400">
            No bio added yet.{" "}
            {verified
              ? "We recommend updating your profile to attract more builders."
              : "Verify your account to make your profile more visible to builders."}
          </p>
        )}
      </div>

      {/* Skills Section */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Key Skills
        </h4>
        {skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <li
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-gray-900 dark:text-gray-100 text-sm rounded-full"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-gray-500 dark:text-gray-400">
            No skills listed yet.
          </p>
        )}
      </div>

      {/* Specialization Highlight */}
      {specialization && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Specialization
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            {specialization}
          </p>
        </div>
      )}


    </section>
  )
}

export default TechnicianAbout
