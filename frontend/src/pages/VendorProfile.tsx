import { useEffect, useRef, useState, useMemo } from "react";
import VendorHeader from "../components/VendorProfile/VendorHeader";
import VendorAbout from "../components/VendorProfile/VendorAbout";
import VendorReviews from "../components/VendorProfile/VendorReviews";
import { useVendorProfile } from "../hooks/useVendorProfile";
import { useVendorItems } from "../hooks/useVendorItems";
import { useAuth } from "../hooks/auth/useAuth";
import { useVendorReviews } from "../hooks/useVendorReviews";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import VendorItemCard from "../components/VendorProfile/VendorShowcase/VendorItemCard";

const VendorProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { vendorId: vendorIdParam } = useParams();
  const viewVendorProfileId = vendorIdParam ? Number(vendorIdParam) : location.state?.id;

  const { vendor, loading: profileLoading, error, createProfile, updateProfile, refresh, uploadBanner, uploadLogo } =
    useVendorProfile(userId, viewVendorProfileId);
  const { items, loading: itemsLoading } = useVendorItems(vendor?.id);
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
    setIsEditModalOpen(false);
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
  const isOwner = Boolean(userId && vendor && vendor.user_id === userId && !viewVendorProfileId);
  const visitorItemsPreview = isOwner ? [] : showcaseItems.slice(0, 4);

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
        isVendorView={isOwner}
        availability={displayVendor.availability as any}
        onChangeAvailability={async (status) => {
          if (isOwner) {
            await updateProfile({ availability: status });
            await refresh();
          }
        }}
        onEditProfile={isOwner ? () => setIsEditModalOpen(true) : undefined}
        onManageItems={isOwner ? () => navigate("/vendor/items") : undefined}
        onViewCatalog={
          !isOwner && vendor?.id
            ? () => navigate(`/vendors/${vendor.id}/items`)
            : undefined
        }
      />

      {/* Quick actions */}
      {isOwner && (
        <div className="flex flex-wrap gap-3 items-center my-4">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
          >
            {vendor ? "Edit Profile" : "Create Profile"}
          </button>
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium"
          >
            Upload Banner
          </button>
          <button
            onClick={() => logoInputRef.current?.click()}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium"
          >
            Upload Logo
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadBanner(file);
            }}
          />
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadLogo(file);
            }}
          />
        </div>
      )}

      <VendorAbout />

      {/* Featured preview for visitors; owners manage items on My Items page */}
      {!isOwner && (
        <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 my-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Featured items</h3>
            {vendor?.id && (
              <button
                onClick={() => navigate(`/vendors/${vendor.id}/items`)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </button>
            )}
          </div>
          {visitorItemsPreview.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visitorItemsPreview.map((item) => (
                <VendorItemCard key={item.id} {...item} onViewDetails={undefined} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No items to show yet.</p>
          )}
        </section>
      )}

      <VendorReviews reviews={reviews} verified={displayVendor.verified} isVendorView={isOwner} />

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {vendor ? "Edit vendor profile" : "Create vendor profile"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep your storefront details up to date for builders and buyers.
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Business name</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your business name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Categories</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Comma separated categories"
                    value={form.categories}
                    onChange={(e) => setForm({ ...form, categories: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City / region"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Supplier type</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Retail / Wholesale"
                    value={form.supplier_type}
                    onChange={(e) => setForm({ ...form, supplier_type: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Availability</label>
                  <select
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  >
                    <option>Open</option>
                    <option>Closed</option>
                    <option>By Appointment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-700 dark:text-gray-300">Short description</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Briefly describe your business"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold">
                  {vendor ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorProfile;
