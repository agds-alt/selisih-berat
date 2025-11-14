export default function ProtectedLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded skeleton mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded skeleton"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-24 bg-gray-200 rounded skeleton"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full skeleton"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded skeleton mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded skeleton"></div>
            </div>
          ))}
        </div>

        {/* Main Content Card Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Table Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-32 bg-gray-200 rounded skeleton"></div>
            <div className="flex space-x-3">
              <div className="h-10 w-24 bg-gray-200 rounded skeleton"></div>
              <div className="h-10 w-24 bg-gray-200 rounded skeleton"></div>
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded skeleton"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded skeleton"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded skeleton"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded skeleton"></div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="h-4 w-32 bg-gray-200 rounded skeleton"></div>
            <div className="flex space-x-2">
              <div className="h-10 w-10 bg-gray-200 rounded skeleton"></div>
              <div className="h-10 w-10 bg-gray-200 rounded skeleton"></div>
              <div className="h-10 w-10 bg-gray-200 rounded skeleton"></div>
            </div>
          </div>
        </div>

        {/* Loading Spinner Overlay */}
        <div className="fixed inset-0 bg-black/5 flex items-center justify-center pointer-events-none z-40">
          <div className="bg-white rounded-full p-6 shadow-2xl">
            <div className="relative w-16 h-16">
              {/* Spinner */}
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>

              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">⚖️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
