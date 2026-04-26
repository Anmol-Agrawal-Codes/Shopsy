import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { listAllUsers } from "../../services/adminService";
import PageLoader from "../../components/ui/PageLoader";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await listAllUsers();
        if (!cancelled) setUsers(data);
      } catch {
        toast.error("Failed to load users");
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Users ({users.length})</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, or role..."
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
      />

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="whitespace-nowrap px-4 py-3 font-medium">{u.displayName || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                    {u.role || "user"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {u.createdAt?.seconds
                    ? new Date(u.createdAt.seconds * 1000).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminUsersPage;
