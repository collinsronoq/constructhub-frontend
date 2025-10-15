import VendorHeader from "../components/VendorProfile/VendorHeader"
import image2 from "../assets/image_2.jpg"
import image5 from "../assets/image_5.jpg"
import VendorAbout from "../components/VendorProfile/VendorAbout"

const VendorProfile = () =>{

  const VendorInfo = {
    name: "Ronok Hardware",
    categories: ["roofing materials", "electrical materilas"],
    location: "Rafiki, Nakuru",
    contact: {
      phone: "254 712 345 678",
      email: "vendor2gmail.com"
    },
    verified: true,
    bannerUrl: image5,
    logoUrl: image2,
    averageRating: 4,
    isVendorView: true,  // determines visibility of edit/verify buttons
    availability: "Open",
  }
  return (
    <>
      <VendorHeader 
        name={VendorInfo.name} 
        categories={VendorInfo.categories} 
        location={VendorInfo.location}
        contact={VendorInfo.contact}
        verified={VendorInfo.verified}
        bannerUrl={VendorInfo.bannerUrl}
        // logoUrl={VendorInfo.logoUrl}
        averageRating={VendorInfo.averageRating}
        isVendorView={VendorInfo.isVendorView}
        
      />
      <VendorAbout />

    </>
    
  )
}

export default VendorProfile