import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";
import { useVendorProfile } from "../hooks/useVendorProfile";
import { useVendorItems } from "../hooks/useVendorItems";
import VendorShowcase from "../components/VendorProfile/VendorShowcase/VendorShowcase";

const VendorItemsPage = () => {
  const { vendorId: vendorIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { vendor } = useVendorProfile(user?.id);
  const isOwner = Boolean(user?.role === "vendor" && vendor);

  const effectiveVendorId = vendorIdParam ? Number(vendorIdParam) : vendor?.id;
  const { items, loading, error, addItem, editItem } = useVendorItems(effectiveVendorId);

  const showcaseItems = useMemo(
    () =>
      items.map((it) => ({
        id: String(it.id),
        name: it.name,
        category: it.category,
        subcategory: it.subcategory || undefined,
        unit: it.unit,
        price: it.price,
        description: it.description || undefined,
        available: it.available,
        imageUrl: it.image_url || "",
      })),
    [items]
  );

  const isVendorView = Boolean(isOwner && !vendorIdParam);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {isVendorView ? "My Items" : "Vendor Catalog"}
          </h1>
          {vendor?.name && isVendorView && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{vendor.name}</p>
          )}
        </div>
        {isVendorView && (
          <button
            onClick={() => navigate("/vendor/profile")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to profile
          </button>
        )}
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading items...</p>
      ) : (
        <VendorShowcase
          initialItems={showcaseItems}
          isVendorView={isVendorView}
          onAddItem={
            isVendorView
              ? async (item) => {
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
                }
              : undefined
          }
          onEditItem={
            isVendorView
              ? async (id, item) => {
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
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default VendorItemsPage;

