import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <AppHeader />
      <main className="container py-6">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};

export default AppLayout;
