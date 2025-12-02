import VendorHeader from "../components/VendorProfile/VendorHeader"
import image2 from "../assets/image_2.jpg"
import image5 from "../assets/image_5.jpg"
import VendorAbout from "../components/VendorProfile/VendorAbout"
import VendorShowcase from "../components/VendorProfile/VendorShowcase/VendorShowcase"
import VendorReviews from "../components/VendorProfile/VendorReviews"
import { useVendorProfile } from "../hooks/useVendorProfile"
import { useVendorItems } from "../hooks/useVendorItems"

const VendorProfile = () =>{

  const vendorId = "vendor_001";
  const { vendor, loading: profileLoading } = useVendorProfile(vendorId);
  const { items, loading: itemsLoading } = useVendorItems(vendorId)

  const FakeVendorInfo = {
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
  }

  const initialItems = [
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
        
  ]

  const VendorInfo = vendor || FakeVendorInfo;
  const VendorItems = items.length ? items : initialItems;

  if(profileLoading || itemsLoading)
    return <p className="text-center py-8">Loading vendor details..</p>

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

      <VendorShowcase initialItems={VendorItems} isVendorView = {true}/>

      <VendorReviews reviews={VendorInfo.reviews} verified={VendorInfo.verified}/>


    </>
    
  )
}

export default VendorProfile