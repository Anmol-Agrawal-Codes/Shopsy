const AppFooter = () => {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-900">
      <div className="container flex flex-col items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300 md:flex-row">
        <p>© {new Date().getFullYear()} Shopsy Pro. All rights reserved.</p>
        <p>Built with React, Firebase, Tailwind CSS, and secure route guards.</p>
      </div>
    </footer>
  );
};

export default AppFooter;
