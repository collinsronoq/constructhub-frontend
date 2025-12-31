import { useEffect, useRef, useState, useMemo } from "react";
import VendorHeader from "../components/VendorProfile/VendorHeader";
import VendorAbout from "../components/VendorProfile/VendorAbout";
import VendorShowcase from "../components/VendorProfile/VendorShowcase/VendorShowcase";
import VendorReviews from "../components/VendorProfile/VendorReviews";
import { useVendorProfile } from "../hooks/useVendorProfile";
import { useVendorItems } from "../hooks/useVendorItems";
import { useAuth } from "../hooks/auth/useAuth";
import { useVendorReviews } from "../hooks/useVendorReviews";

const VendorProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { vendor, loading: profileLoading, error, createProfile, updateProfile, refresh, uploadBanner, uploadLogo } =
    useVendorProfile(userId);
  const { items, loading: itemsLoading, addItem, editItem } = useVendorItems(userId || 0);
  const { reviews } = useVendorReviews(userId);

  const [form, setForm] = useState({
    name: "",
    categories: "",
    location: "",
    supplier_type: "",
    phone: "",
    email: "",
    short_description: "",
    availability: "Open",
  });

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name || "",
        categories: vendor.categories?.join(", ") || "",
        location: vendor.location || "",
        supplier_type: vendor.supplier_type || "",
        phone: vendor.contact?.phone || "",
        email: vendor.contact?.email || "",
        short_description: vendor.short_description || "",
        availability: vendor.availability || "Open",
      });
    }
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      categories: form.categories ? form.categories.split(",").map((c) => c.trim()).filter(Boolean) : [],
      location: form.location,
      supplier_type: form.supplier_type,
      contact: { phone: form.phone, email: form.email },
      short_description: form.short_description,
      availability: form.availability,
    };
    if (vendor) {
      await updateProfile(payload);
    } else {
      await createProfile(payload);
    }
    await refresh();
  };

  const displayVendor = vendor || {
    name: form.name || "Vendor",
    categories: form.categories ? form.categories.split(",").map((c) => c.trim()).filter(Boolean) : [],
    location: form.location,
    contact: { phone: form.phone, email: form.email },
    verified: false,
    banner_url: undefined,
    logo_url: undefined,
    average_rating: 0,
    isVendorView: true,
    availability: form.availability,
    short_description: form.short_description,
    reviews: [],
  };

  const showcaseItems = useMemo(() => {
    return items.map((it) => ({
      id: String(it.id),
      name: it.name,
      category: it.category,
      subcategory: it.subcategory || undefined,
      unit: it.unit,
      price: it.price,
      description: it.description || undefined,
      available: it.available,
      imageUrl: it.image_url || "",
    }));
  }, [items]);

  const loadingState = profileLoading || itemsLoading;

  return (
    <>
      {!userId && <div className="p-6">Please log in as a vendor to manage your profile.</div>}
      {loadingState && <p className="text-center py-8">Loading vendor details...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <VendorHeader
        name={displayVendor.name}
        categories={displayVendor.categories}
        location={displayVendor.location || undefined}
        contact={displayVendor.contact || undefined}
        verified={displayVendor.verified}
        bannerUrl={displayVendor.banner_url || undefined}
        logoUrl={displayVendor.logo_url || undefined}
        averageRating={displayVendor.average_rating}
        isVendorView
        availability={displayVendor.availability as any}
        onChangeAvailability={async (status) => {
          await updateProfile({ availability: status });
          await refresh();
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 my-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="input" placeholder="Business name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Categories (comma separated)" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} />
          <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className="input" placeholder="Supplier type (Retail/Wholesale)" value={form.supplier_type} onChange={(e) => setForm({ ...form, supplier_type: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className="input" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
            <option>Open</option>
            <option>Closed</option>
            <option>By Appointment</option>
          </select>
        </div>
        <textarea className="input" placeholder="Short description" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex items-center gap-2">
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadBanner(file);
              }}
            />
            <span className="text-sm text-gray-500">Upload banner</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadLogo(file);
              }}
            />
            <span className="text-sm text-gray-500">Upload logo</span>
          </div>
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
          {vendor ? "Update Profile" : "Create Profile"}
        </button>
      </form>

      <VendorAbout />
      <VendorShowcase
        initialItems={showcaseItems}
        isVendorView={true}
        onAddItem={async (item) => {
          await addItem({
            name: item.name,
            category: item.category,
            subcategory: item.subcategory,
            unit: item.unit || "",
            price: item.price,
            description: item.description,
            available: item.available,
            image_url: item.imageUrl,
          } as any);
        }}
        onEditItem={async (id, item) => {
          await editItem(Number(id), {
            name: item.name,
            category: item.category,
            subcategory: item.subcategory,
            unit: item.unit,
            price: item.price,
            description: item.description,
            available: item.available,
            image_url: item.imageUrl,
          });
        }}
      />
      <VendorReviews reviews={reviews} verified={displayVendor.verified} isVendorView />
    </>
  );
};

export default VendorProfile;
