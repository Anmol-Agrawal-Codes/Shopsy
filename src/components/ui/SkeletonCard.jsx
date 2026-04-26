const SkeletonCard = () => {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 h-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="mb-2 h-4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mb-4 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-9 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
};

export default SkeletonCard;
