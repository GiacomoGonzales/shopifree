import AdminLayout from '../components/layout/AdminLayout'

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome to Shopifree Admin Panel</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <span className="text-xs text-emerald-500 font-semibold">+12.5%</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">1,234</p>
          </div>

          {/* Total Stores */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
              <span className="text-xs text-emerald-500 font-semibold">+8.2%</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Active Stores</p>
            <p className="text-3xl font-bold text-white">567</p>
          </div>

          {/* Total Products */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <span className="text-xs text-emerald-500 font-semibold">+15.3%</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold text-white">12,890</p>
          </div>

          {/* Total Orders */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-xs text-red-500 font-semibold">-2.4%</span>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-white">8,456</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <span>👤</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">New user registered</p>
                  <p className="text-slate-400 text-xs">john@example.com</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">2 minutes ago</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <span>🏪</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">New store created</p>
                  <p className="text-slate-400 text-xs">TechStore</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">15 minutes ago</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <span>📦</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Product published</p>
                  <p className="text-slate-400 text-xs">iPhone 15 Pro</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">1 hour ago</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Firebase</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Cloudinary</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">SendGrid</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full">
                  Operational
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                📧 Send Platform Announcement
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                🔧 System Maintenance Mode
              </button>
              <button className="w-full text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                📊 Export Analytics Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 