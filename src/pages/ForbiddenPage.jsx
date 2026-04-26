import { Link } from "react-router-dom";

const ForbiddenPage = () => {
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center dark:border-red-900 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-red-600">403 - Access denied</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        You do not have permission to access this page.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary"
      >
        Back to Shop
      </Link>
    </section>
  );
};

export default ForbiddenPage;
