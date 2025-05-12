import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

interface RaffleItem {
  id: string;
  item_number: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  sponsor: string | null;
  item_value: number | null;
  created_at: string;
}

function AdminRaffleItems() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<RaffleItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<RaffleItem>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchItems();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to access this page");
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      setIsAdmin(profile?.role === "admin");
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("raffle_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploadingImage(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("raffle-items")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("raffle-items").getPublicUrl(filePath);

      // Update current item with new image URL
      setCurrentItem((prev) => ({
        ...prev,
        image_url: publicUrl,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (item: RaffleItem) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      // First, get the item to find its image URL
      const { data: item } = await supabase
        .from("raffle_items")
        .select("image_url")
        .eq("id", id)
        .single();

      // Delete the image from storage if it exists
      if (item?.image_url) {
        const imagePath = item.image_url.split("/").pop();
        if (imagePath) {
          await supabase.storage.from("raffle-items").remove([imagePath]);
        }
      }

      // Delete the item from the database
      const { error } = await supabase
        .from("raffle_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem.id) {
        const { error } = await supabase
          .from("raffle_items")
          .update(currentItem)
          .eq("id", currentItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("raffle_items")
          .insert([currentItem]);
        if (error) throw error;
      }
      setIsEditing(false);
      setCurrentItem({});
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>;
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Raffle Items</h1>
        <button
          onClick={() => {
            setCurrentItem({});
            setIsEditing(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Item
        </button>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">
            {currentItem.id ? "Edit Item" : "Add New Item"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Item Number
              </label>
              <input
                type="text"
                value={currentItem.item_number || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    item_number: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="e.g., RAFFLE-001, ITEM-2024-01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={currentItem.name || ""}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={currentItem.description || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    description: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                value={currentItem.price || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    price: parseFloat(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                value={currentItem.category || ""}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, category: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="e.g., Electronics, Fashion, Sports"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sponsor
              </label>
              <input
                type="text"
                value={currentItem.sponsor || ""}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, sponsor: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Company Name or Individual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Item Value
              </label>
              <input
                type="number"
                value={currentItem.item_value || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    item_value: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="Estimated value of the item"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {currentItem.image_url && (
                  <img
                    src={currentItem.image_url}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  disabled={uploadingImage}
                />
              </div>
              {uploadingImage && (
                <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentItem({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={uploadingImage}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">
              <span className="text-sm text-gray-500 mr-2">
                #{item.item_number}
              </span>
              {item.name}
            </h3>
            <p className="text-gray-600 mb-2">{item.description}</p>
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  Ticket Price: ${item.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {item.category}
                </span>
              </div>
              <div className="flex justify-between items-center">
                {item.item_value && (
                  <span className="text-sm text-gray-600">
                    Value: ${item.item_value.toFixed(2)}
                  </span>
                )}
                {item.sponsor && (
                  <span className="text-sm text-gray-600">
                    Sponsored by: {item.sponsor}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(item)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminRaffleItems;
