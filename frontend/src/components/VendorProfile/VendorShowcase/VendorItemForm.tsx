import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { VendorItemCardProps } from "./VendorItemCard";

interface VendorItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: VendorItemCardProps) => void;
  initialData?: VendorItemCardProps | null;
}

const VendorItemForm: React.FC<VendorItemFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<VendorItemCardProps, "id">>({
    name: "",
    category: "",
    subcategory: "",
    unit: "",
    price: 0,
    description: "",
    available: true,
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(!initialData); // if no data => Add mode

  /** Prefill form when editing or viewing an item */
  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setFormData(rest);
      setImagePreview(initialData.imageUrl);
      setIsEditMode(false); // start in view-only mode
    }
  }, [initialData]);

  if (!isOpen) return null;

  /** Handlers */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleToggleAvailability = () =>
    setFormData((prev) => ({ ...prev, available: !prev.available }));

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.price) {
      alert("Please fill in all required fields.");
      return;
    }

    const newItem: VendorItemCardProps = {
      id: initialData ? initialData.id : Date.now().toString(),
      ...formData,
    };

    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {initialData
              ? isEditMode
                ? "Edit Product / Material"
                : "Product / Material Details"
              : "Add New Product / Material"}
          </h2>

          <div className="flex items-center gap-2">
            {initialData && !isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditMode}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-60"
              placeholder="e.g. River Sand"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={!isEditMode}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-60"
              placeholder="e.g. Aggregates"
            />
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subcategory
            </label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              disabled={!isEditMode}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-60"
              placeholder="e.g. Sand"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit *
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              disabled={!isEditMode}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-60"
              placeholder="e.g. ton, bag, piece"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price (KSh) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              disabled={!isEditMode}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-60"
              placeholder="e.g. 1200"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Availability
            </label>
            <button
              type="button"
              onClick={handleToggleAvailability}
              disabled={!isEditMode}
              className={`mt-1 w-full py-2 rounded-lg text-sm font-medium transition ${
                formData.available
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              } disabled:opacity-60`}
            >
              {formData.available ? "In Stock" : "Out of Stock"}
            </button>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditMode}
              rows={3}
              className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 disabled:opacity-60"
              placeholder="e.g. High-quality river sand suitable for construction..."
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Image *
            </label>
            {isEditMode && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-2 text-sm"
              />
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 w-full h-40 object-cover rounded-lg border dark:border-gray-700"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>

          {isEditMode && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Save Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorItemForm;
