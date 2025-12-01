export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Welcome to Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            1,234
          </p>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Revenue
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            $12,345
          </p>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Active Projects
          </h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            42
          </p>
        </div>
      </div>
    </div>
  );
}
