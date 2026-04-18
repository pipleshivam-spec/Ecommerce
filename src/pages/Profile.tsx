import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { User, Package, Heart, Settings, LogOut, ShoppingBag, TrendingUp } from 'lucide-react';
import { getAllOrders, Order } from '@/hooks/useOrders';

interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) { navigate('/login'); return; }
    const u = JSON.parse(userRaw);
    setUser(u);
    const uid = String(u.id);
    const all = getAllOrders();
    const userOrders = all.filter(o => String(o.user_id) === uid || o.user_email === u.email);
    setOrders(userOrders);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const totalSpent = orders.reduce((s, o) => s + o.total_amount, 0);
  const pending = orders.filter(o => o.status === 'confirmed' || o.status === 'processing' || o.status === 'shipped').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Layout>
      <section className="pt-28 pb-16 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container-main max-w-6xl">
          {/* Profile Header */}
          <div className="glass-card p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{(user.role || 'customer').toUpperCase()}</span>
                  {user.created_at && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Member since {new Date(user.created_at).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-50 text-red-600 transition-colors border border-red-200">
                <LogOut size={16} /><span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: orders.length, icon: Package, color: 'blue', onClick: () => navigate('/orders') },
              { label: 'Active Orders', value: pending, icon: ShoppingBag, color: 'yellow', onClick: () => navigate('/orders') },
              { label: 'Delivered', value: delivered, icon: TrendingUp, color: 'green', onClick: () => navigate('/orders') },
              { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: Heart, color: 'purple', onClick: () => navigate('/orders') },
            ].map(({ label, value, icon: Icon, color, onClick }) => (
              <div key={label} onClick={onClick} className="glass-card p-5 hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`p-2 bg-${color}-100 rounded-lg w-fit mb-3`}>
                  <Icon className={`text-${color}-600`} size={20} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="glass-card">
            <div className="border-b border-gray-200">
              <div className="flex gap-6 px-6">
                {['overview', 'orders', 'settings'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 transition-colors text-sm font-medium ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name', value: user.name },
                        { label: 'Email Address', value: user.email },
                        { label: 'Phone Number', value: user.phone || 'Not provided' },
                        { label: 'Account Type', value: (user.role || 'customer').charAt(0).toUpperCase() + (user.role || 'customer').slice(1) },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">{label}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button onClick={() => navigate('/orders')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left">
                        <Package className="mb-2 text-primary" size={24} />
                        <p className="font-medium">View Orders</p>
                        <p className="text-sm text-muted-foreground">Track your purchases</p>
                      </button>
                      <button onClick={() => navigate('/products')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left">
                        <ShoppingBag className="mb-2 text-primary" size={24} />
                        <p className="font-medium">Shop Now</p>
                        <p className="text-sm text-muted-foreground">Browse products</p>
                      </button>
                      <button onClick={() => navigate('/wishlist')} className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left">
                        <Heart className="mb-2 text-primary" size={24} />
                        <p className="font-medium">Wishlist</p>
                        <p className="text-sm text-muted-foreground">Saved items</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <button onClick={() => navigate('/products')} className="px-6 py-3 bg-primary text-white rounded-full hover:opacity-90">Shop Now</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">#{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">{order.items.length} item(s)</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₹{order.total_amount.toFixed(2)}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {orders.length > 5 && (
                        <button onClick={() => navigate('/orders')} className="w-full py-3 text-primary text-sm font-medium hover:underline">
                          View all {orders.length} orders →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="text-center py-12">
                  <Settings size={48} className="mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
                  <p className="text-muted-foreground">Manage your account preferences</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
