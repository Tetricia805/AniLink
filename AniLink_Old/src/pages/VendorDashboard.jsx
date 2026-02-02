import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as productsApi from '@/api/products';
import * as ordersApi from '@/api/orders';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        productsApi.getProducts().catch(() => ({ data: { products: [] } })),
        ordersApi.getOrders().catch(() => ({ data: { orders: [] } }))
      ]);

      const products = productsRes?.data?.products || [];
      const orders = ordersRes?.data?.orders || [];

      const totalRevenue = orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'active').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        completedOrders: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
        totalRevenue,
        recentOrders
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-2">Vendor Dashboard</h1>
            <p className="text-xl opacity-90">Welcome back, {user?.name || 'Vendor'}!</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">All products</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProducts}</div>
                <p className="text-xs text-muted-foreground">Currently listed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">All orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From completed orders</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentOrders.map((order) => (
                      <div key={order._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">Order #{order._id.slice(-6)}</p>
                            <p className="text-xs text-gray-600">
                              {order.farmer?.name || 'Customer'}
                            </p>
                            <p className="text-xs text-gray-600">
                              UGX {order.totalAmount?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <Badge variant={
                            order.status === 'completed' || order.status === 'delivered' 
                              ? 'default' 
                              : order.status === 'pending' 
                              ? 'secondary' 
                              : 'outline'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Link to="/vendor-products">
                      <Button className="w-full mt-4" size="sm" variant="outline">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
                <CardDescription>Order status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Completed</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.completedOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/vendor-products">
                  <Button variant="outline" className="w-full">Manage Products</Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline" className="w-full">View Orders</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full">Profile Settings</Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full">Browse Marketplace</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default VendorDashboard;

