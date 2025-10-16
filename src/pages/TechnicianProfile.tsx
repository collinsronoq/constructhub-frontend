import TechnicianHeader from "../components/TechnicianProfile/TechnicianHeader";
import TechnicianAbout from "../components/TechnicianProfile/TechnicianAbout";
import TechnicianSkills from "../components/TechnicianProfile/TechnicianSkills";
import TechnicianReviews from "../components/TechnicianProfile/TechnicianReviews";


const TechnicianProfile = () => {
  // Sample placeholder data
  const technician = {
    name: "Collins Rono",
    specialization: "Electrical Engineer",
    location: "Nakuru, Kenya",
    experience: "5 years",
    verified: false,
    rating: 4,
    imageUrl: "src/assets/image_4.jpg",
    contact: "+254 712 345 678",
    email: "electrician@gmail.com",
    bio: "A dedicated electrical technician with over five years of experience in residential and commercial installations, wiring, and power systems. Passionate about delivering quality and ensuring safety in every project.",
    skills: ["Wiring", "Lighting Installation", "Solar Systems", "Safety Compliance"],
    certifications: ["Electrical Safety Certification", "Solar Energy Technician Certificate"],
    // reviews: [
    //   { id: 1, reviewer: "John Doe", comment: "Professional and punctual!", rating: 5, date: "2025-10-11"},
    //   { id: 2, reviewer: "Jane Wambui", comment: "Very skilled and easy to work with.", rating: 4.5, date: "2025-10-11" },
    // ],
    reviews: [
      {
        id: "1",
        reviewerName: "John Mwangi",
        reviewerRole: "Builder",
        rating: 5,
        date: "Oct 5, 2025",
        review: "Very professional and punctual. The wiring was done perfectly!",
      },
      {
        id: "2",
        reviewerName: "Sarah Otieno",
        reviewerRole: "Contractor",
        rating: 4,
        date: "Oct 3, 2025",
        review: "Good work overall. Slight delay on completion but well executed.",
      },
      {
        id: "3",
        reviewerName: "James Kariuki",
        reviewerRole: "Builder",
        rating: 5,
        date: "Sep 29, 2025",
        review: "Reliable and skilled technician. Definitely recommend!",
      },
    ],
  };

   return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-md space-y-6">
      {/* Verification Notice */}
      {/* {!technician.verified && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ This technician has not yet been verified by ConstructHub. 
          <span className="block text-xs mt-1">
            Verification helps technicians gain visibility and trust.
          </span>
        </div>
      )} */}

      {/* Header Section (with Contact actions included) */}
      <TechnicianHeader
        name={technician.name}
        specialization={technician.specialization}
        location={technician.location}
        experience={technician.experience}
        rating={technician.rating}
        contact={technician.contact}
        verified={technician.verified}
        email={technician.email}
      />

      {/* Bio Section */}
      <TechnicianAbout 
        bio={technician.bio} 
        skills={technician.skills}
        specialization={technician.specialization}
        verified={technician.verified}
      />

      {/* Skills Section */}
      <TechnicianSkills 
        experience={technician.experience}
        certifications={technician.certifications}
        verified={technician.verified} 
        
      />

      
      

      {/* Reviews Section */}
      <TechnicianReviews reviews={technician.reviews} verified={technician.verified}/>
    </section>
  )
};

export default TechnicianProfile;
