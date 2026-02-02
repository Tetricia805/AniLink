import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  ShoppingBag, 
  Calendar, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as herdsApi from '@/api/herds';
import * as appointmentsApi from '@/api/appointments';
import * as ordersApi from '@/api/orders';
import * as healthRecordsApi from '@/api/healthRecords';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    herds: 0,
    animals: 0,
    appointments: 0,
    healthRecords: 0,
    orders: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [herdsRes, appointmentsRes, ordersRes, recordsRes] = await Promise.all([
        herdsApi.getHerds().catch(() => ({ data: { herds: [] } })),
        appointmentsApi.getMyAppointments().catch(() => ({ data: { appointments: [] } })),
        ordersApi.getOrders().catch(() => ({ data: { orders: [] } })),
        healthRecordsApi.getHealthRecords().catch(() => ({ data: { records: [] } }))
      ]);

      const herds = herdsRes?.data?.herds || [];
      const appointments = appointmentsRes?.data?.appointments || [];
      const orders = ordersRes?.data?.orders || [];
      const records = recordsRes?.data?.records || [];

      // Count animals from herds
      const totalAnimals = herds.reduce((sum, herd) => sum + (herd.animals?.length || 0), 0);

      // Get upcoming appointments
      const upcoming = appointments
        .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5);

      setStats({
        herds: herds.length,
        animals: totalAnimals,
        appointments: appointments.length,
        healthRecords: records.length,
        orders: orders.length,
        upcomingAppointments: upcoming
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Plus, label: 'Add Herd', path: '/herds', color: 'bg-green-500' },
    { icon: Calendar, label: 'Book Appointment', path: '/booking', color: 'bg-blue-500' },
    { icon: FileText, label: 'Health Records', path: '/health-records', color: 'bg-purple-500' },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace', color: 'bg-orange-500' },
  ];

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
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Farmer'}!</h1>
            <p className="text-xl opacity-90">Manage your livestock and track your farm's health</p>
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
                <CardTitle className="text-sm font-medium">Total Herds</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.herds}</div>
                <p className="text-xs text-muted-foreground">Livestock groups</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.animals}</div>
                <p className="text-xs text-muted-foreground">Individual livestock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.appointments}</div>
                <p className="text-xs text-muted-foreground">Total bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.healthRecords}</div>
                <p className="text-xs text-muted-foreground">Medical records</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.path}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${action.color} text-white p-6 rounded-lg cursor-pointer`}
                      >
                        <action.icon className="h-8 w-8 mb-2" />
                        <p className="font-semibold">{action.label}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your next vet visits</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming appointments</p>
                    <Link to="/booking">
                      <Button className="mt-4" size="sm">Book Now</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.upcomingAppointments.map((apt) => (
                      <div key={apt._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">
                              {apt.vet?.user?.name || 'Veterinarian'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(apt.appointmentDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">
                              {apt.appointmentTime}
                            </p>
                          </div>
                          <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                            {apt.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Link to="/booking">
                      <Button className="w-full mt-4" size="sm" variant="outline">
                        View All
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

