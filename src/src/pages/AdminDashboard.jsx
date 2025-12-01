import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Download,
  Activity,
  Bell,
  Brain,
  FileText,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import * as adminApi from '@/api/admin';
import { getMe } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState({ orders: false, appointments: false });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    loadData();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await getMe();
      if (response.status === 'success' && response.data.user.role !== 'admin') {
        toast({
          title: 'Access Denied',
          description: 'This page is only accessible to administrators.',
          variant: 'destructive'
        });
        navigate('/');
      }
    } catch (error) {
      navigate('/');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, activityRes] = await Promise.all([
        adminApi.getAdminOverview(),
        adminApi.getRecentActivity()
      ]);
      setOverview(overviewRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setExportLoading(prev => ({ ...prev, [type]: true }));
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const blob = type === 'orders'
        ? await adminApi.exportOrdersCSV(params)
        : await adminApi.exportAppointmentsCSV(params);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: `${type} data exported successfully`
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || 'Failed to export data',
        variant: 'destructive'
      });
    } finally {
      setExportLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentStatusCount = (status) => {
    if (!overview?.appointments) return 0;
    const stat = overview.appointments.find(s => s._id === status);
    return stat?.count || 0;
  };

  const getOrderStatusCount = (status) => {
    if (!overview?.orders) return 0;
    const stat = overview.orders.find(s => s._id === status);
    return stat?.count || 0;
  };

  const getTotalOrderVolume = () => {
    if (!overview?.orders) return 0;
    return overview.orders.reduce((sum, order) => sum + (order.totalVolume || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Monitor platform activity, user metrics, and export data for analysis
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-3xl font-bold">{overview?.users?.total || 0}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Farmers: {overview?.users?.farmers || 0}</span>
                      <span>Vets: {overview?.users?.vets || 0}</span>
                      <span>Vendors: {overview?.users?.vendors || 0}</span>
                    </div>
                  </div>
                  <Users className="h-12 w-12 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Appointments</p>
                    <p className="text-3xl font-bold">
                      {getAppointmentStatusCount('confirmed') + getAppointmentStatusCount('pending')}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="default" className="text-xs">
                        Confirmed: {getAppointmentStatusCount('confirmed')}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Pending: {getAppointmentStatusCount('pending')}
                      </Badge>
                    </div>
                  </div>
                  <Calendar className="h-12 w-12 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Orders</p>
                    <p className="text-3xl font-bold">{getOrderStatusCount('completed')}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Volume: {formatCurrency(getTotalOrderVolume())}
                    </p>
                  </div>
                  <ShoppingBag className="h-12 w-12 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Unread Notifications</p>
                    <p className="text-3xl font-bold">{overview?.unreadNotifications || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">Requires attention</p>
                  </div>
                  <Bell className="h-12 w-12 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Appointments Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Appointments Status</span>
                </CardTitle>
                <CardDescription>Breakdown of appointment statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map(status => {
                    const count = getAppointmentStatusCount(status);
                    const total = overview?.appointments?.reduce((sum, s) => sum + (s.count || 0), 0) || 1;
                    const percentage = (count / total) * 100;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize font-medium">{status}</span>
                          <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === 'completed' ? 'bg-green-600' :
                              status === 'confirmed' ? 'bg-blue-600' :
                              status === 'pending' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Orders Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Orders Status</span>
                </CardTitle>
                <CardDescription>Breakdown of order statuses and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map(status => {
                    const stat = overview?.orders?.find(s => s._id === status);
                    const count = stat?.count || 0;
                    const volume = stat?.totalVolume || 0;
                    const total = overview?.orders?.reduce((sum, s) => sum + (s.count || 0), 0) || 1;
                    const percentage = (count / total) * 100;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="capitalize font-medium">{status}</span>
                          <div className="text-right">
                            <span className="text-gray-600">{count} orders</span>
                            {volume > 0 && (
                              <span className="text-gray-500 ml-2">({formatCurrency(volume)})</span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === 'completed' ? 'bg-green-600' :
                              status === 'confirmed' ? 'bg-blue-600' :
                              status === 'pending' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest appointments, orders, and health records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recent Appointments */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Appointments</span>
                  </h3>
                  <div className="space-y-2">
                    {recentActivity?.appointments?.length > 0 ? (
                      recentActivity.appointments.slice(0, 5).map(appt => (
                        <div key={appt._id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{appt.farmer?.name || 'Unknown'}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {appt.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {appt.vet?.user?.name || 'Vet'} • {formatDate(appt.scheduledFor)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent appointments</p>
                    )}
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Orders</span>
                  </h3>
                  <div className="space-y-2">
                    {recentActivity?.orders?.length > 0 ? (
                      recentActivity.orders.slice(0, 5).map(order => (
                        <div key={order._id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{order.farmer?.name || 'Unknown'}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {formatCurrency(order.total)} • {formatDate(order.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent orders</p>
                    )}
                  </div>
                </div>

                {/* Recent Health Records */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Health Records</span>
                  </h3>
                  <div className="space-y-2">
                    {recentActivity?.healthRecords?.length > 0 ? (
                      recentActivity.healthRecords.slice(0, 5).map(record => (
                        <div key={record._id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{record.recordType?.replace('_', ' ')}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {record.species}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {record.farmer?.name || 'Unknown'} • {formatDate(record.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent health records</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Exports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Data Exports</span>
              </CardTitle>
              <CardDescription>Export orders and appointments data as CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from">From Date (Optional)</Label>
                    <Input
                      id="from"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="to">To Date (Optional)</Label>
                    <Input
                      id="to"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => handleExport('orders')}
                    disabled={exportLoading.orders}
                    variant="outline"
                  >
                    {exportLoading.orders ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Orders CSV
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleExport('appointments')}
                    disabled={exportLoading.appointments}
                    variant="outline"
                  >
                    {exportLoading.appointments ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Appointments CSV
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Leave date fields empty to export all records. CSV files will be downloaded automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

