const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default EmptyState;
