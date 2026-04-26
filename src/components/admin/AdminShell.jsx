import { NavLink, Outlet } from "react-router-dom";
import { FiBox, FiGrid, FiShoppingBag, FiUsers } from "react-icons/fi";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/admin/users", label: "Users", icon: FiUsers },
];

const AdminShell = () => {
  return (
    <div className="flex min-h-[70vh] flex-col gap-6 lg:flex-row">
      {/* Sidebar */}
      <aside className="flex shrink-0 flex-row gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900 lg:w-56 lg:flex-col lg:overflow-x-visible">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminShell;
