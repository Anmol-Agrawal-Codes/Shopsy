import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import {
  addProduct,
  deleteProduct,
  listAllProducts,
  updateProduct,
} from "../../services/adminService";
import { formatCurrency } from "../../utils/formatCurrency";
import PageLoader from "../../components/ui/PageLoader";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  discountPrice: "",
  stockQuantity: "",
  images: [],
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAllProducts();
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: String(product.price || ""),
      discountPrice: String(product.discountPrice || ""),
      stockQuantity: String(product.stockQuantity ?? ""),
      images: product.images || [],
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: form.price,
        discountPrice: form.discountPrice,
        stockQuantity: form.stockQuantity,
        images: form.images,
      };
      if (editing) {
        await updateProduct(editing, payload);
        toast.success("Product updated");
      } else {
        await addProduct(payload);
        toast.success("Product added");
      }
      setShowForm(false);
      await load();
    } catch {
      toast.error("Failed to save product");
    }
    setSaving(false);
  };

  const handleDelete = async (productId) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(productId);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <button onClick={openAdd} className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      />

      {/* Product form modal */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Edit Product" : "Add Product"}</h2>
            <button onClick={() => setShowForm(false)}><FiX size={18} /></button>
          </div>
          <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-2">
            <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Product name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="Price" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="discountPrice" type="number" min="0" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} placeholder="Discount price" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required placeholder="Stock quantity" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <input name="images" value={form.images.join(", ")} onChange={(e) => setForm({ ...form, images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Image URLs (comma-separated)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Description" className="col-span-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
            <div className="col-span-full">
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60">
                {saving ? "Saving..." : editing ? "Update" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category}</td>
                <td className="px-4 py-3">{formatCurrency(p.discountPrice || p.price)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${p.stockQuantity <= 0 ? "bg-red-100 text-red-700" : p.stockQuantity <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                    {p.stockQuantity ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">{p.rating || 0} ({p.reviewsCount || 0})</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="rounded p-1 text-blue-500 hover:bg-blue-50"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="rounded p-1 text-red-500 hover:bg-red-50"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminProductsPage;
