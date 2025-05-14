import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useEvent } from "../../lib/context/EventContext";

interface RaffleItem {
  id: string;
  event_id: string;
  item_number: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  sponsor: string | null;
  item_value: number | null;
  is_over_21: boolean;
  is_local_pickup_only: boolean;
  is_available: boolean;
  draw_count: number;
  created_at: string;
}

type SortField = "item_number" | "name" | "price" | "category" | "created_at";
type SortDirection = "asc" | "desc";

function AdminRaffleItems() {
  const { selectedEventId } = useEvent();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<RaffleItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<RaffleItem>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchItems(selectedEventId);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedEventId && !currentItem.event_id) {
      setCurrentItem((prev) => ({ ...prev, event_id: selectedEventId }));
    }
  }, [selectedEventId]);

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

  const fetchItems = async (selectedEventId: string) => {
    try {
      console.log("Fetching items for event:", selectedEventId);
      const { data, error } = await supabase
        .from("raffle_items")
        .select("*")
        .eq("event_id", selectedEventId)
        .order("item_number", { ascending: true });

      if (error) throw error;
      console.log("Fetched items:", data);
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
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
      const { error: uploadError } = await supabase.storage
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
      await fetchItems(selectedEventId || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem.id) {
        const updateData = {
          event_id: currentItem.event_id,
          item_number: currentItem.item_number,
          name: currentItem.name,
          description: currentItem.description,
          price: currentItem.price,
          image_url: currentItem.image_url,
          category: currentItem.category,
          sponsor: currentItem.sponsor || null,
          item_value: currentItem.item_value || null,
          is_over_21: currentItem.is_over_21 || false,
          is_local_pickup_only: currentItem.is_local_pickup_only || false,
          is_available: currentItem.is_available !== false,
          draw_count: currentItem.draw_count || 1,
        };

        const { error } = await supabase
          .from("raffle_items")
          .update(updateData)
          .eq("id", currentItem.id)
          .select();

        if (error) throw error;
      } else {
        const insertData = {
          event_id: currentItem.event_id,
          item_number: currentItem.item_number,
          name: currentItem.name,
          description: currentItem.description,
          price: currentItem.price,
          image_url: currentItem.image_url,
          category: currentItem.category,
          sponsor: currentItem.sponsor || null,
          item_value: currentItem.item_value || null,
          is_over_21: currentItem.is_over_21 || false,
          is_local_pickup_only: currentItem.is_local_pickup_only || false,
          is_available: currentItem.is_available !== false,
          draw_count: currentItem.draw_count || 1,
        };

        const { error } = await supabase
          .from("raffle_items")
          .insert([insertData])
          .select();

        if (error) throw error;
      }
      setIsEditing(false);
      setCurrentItem({});
      await fetchItems(selectedEventId || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item");
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedItems = items
    .filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.item_number.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.sponsor?.toLowerCase().includes(searchLower) ?? false)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
        <h1 className="text-2xl font-bold text-purple-600">
          Manage Raffle Items
        </h1>
        <button
          onClick={() => {
            setCurrentItem({ event_id: selectedEventId });
            setIsEditing(true);
          }}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-md hover:from-pink-600 hover:to-purple-600 transition-colors cursor-pointer"
        >
          Add New Item
        </button>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm border border-pink-100 mb-6"
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
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_over_21"
                  checked={currentItem.is_over_21 || false}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      is_over_21: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_over_21"
                  className="ml-2 block text-sm text-gray-700"
                >
                  21+ Only
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_local_pickup_only"
                  checked={currentItem.is_local_pickup_only || false}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      is_local_pickup_only: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_local_pickup_only"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Local Pickup Only
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={currentItem.is_available !== false}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      is_available: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_available"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Available
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Draws
              </label>
              <input
                type="number"
                value={currentItem.draw_count || 1}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    draw_count: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                required
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
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-pink-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-pink-100">
                <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("item_number")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Item #</span>
                        <span>{getSortIcon("item_number")}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <span>{getSortIcon("name")}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Category</span>
                        <span>{getSortIcon("category")}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Price</span>
                        <span>{getSortIcon("price")}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider"
                    >
                      Image
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider"
                    >
                      Sponsor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-purple-600 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pink-100">
                  {filteredAndSortedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.item_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-purple-600">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {item.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-10 w-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sponsor || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-purple-600 hover:text-purple-700 cursor-pointer mr-3"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRaffleItems;
