import VendorHeader from "../components/VendorProfile/VendorHeader"
import image2 from "../assets/image_2.jpg"
import image5 from "../assets/image_5.jpg"
import VendorAbout from "../components/VendorProfile/VendorAbout"
import VendorShowcase from "../components/VendorProfile/VendorShowcase/VendorShowcase"

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

      <VendorShowcase
        items={[
          {
            id: "1",
            name: "Cement 50kg Bag",
            category: "Building Materials",
            unit: "bag",
            price: 800,
            available: true,
            imageUrl: image5,
          },
          {
            id: "2",
            name: "Cement 50kg Bag",
            category: "Building Materials",
            unit: "bag",
            price: 800,
            available: true,
            imageUrl: image5,
          },
          {
            id: "3",
            name: "Cement 50kg Bag",
            category: "Plumbing",
            unit: "bag",
            price: 800,
            available: true,
            imageUrl: image5,
          },
          {
            id: "4",
            name: "Cement 50kg Bag",
            category: "Roofing",
            unit: "bag",
            price: 800,
            available: true,
            imageUrl: image5,
          },
          {
            id: "5",
            name: "Gloss Paint",
            category: "Paints",
            unit: "litre",
            price: 550,
            available: false,
            imageUrl: image2,
          },
        ]}
      />


    </>
    
  )
}

export default VendorProfile