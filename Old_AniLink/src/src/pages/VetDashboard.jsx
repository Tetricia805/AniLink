import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as appointmentsApi from '@/api/appointments';
import * as vetApi from '@/api/vet';

const VetDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    todayAppointments: [],
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const appointmentsRes = await appointmentsApi.getMyAppointments().catch(() => ({ data: { appointments: [] } }));
      const appointments = appointmentsRes?.data?.appointments || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayApts = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });

      const upcoming = appointments
        .filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= today && (apt.status === 'confirmed' || apt.status === 'pending');
        })
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5);

      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        todayAppointments: todayApts,
        upcomingAppointments: upcoming
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
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-2">Veterinarian Dashboard</h1>
            <p className="text-xl opacity-90">Welcome back, Dr. {user?.name || 'Veterinarian'}!</p>
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
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmedAppointments}</div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedAppointments}</div>
                <p className="text-xs text-muted-foreground">Finished</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>Appointments scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.todayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No appointments today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.todayAppointments.map((apt) => (
                      <div key={apt._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{apt.farmer?.name || 'Farmer'}</p>
                            <p className="text-xs text-gray-600">{apt.appointmentTime}</p>
                            <p className="text-xs text-gray-600">{apt.reason || 'General consultation'}</p>
                          </div>
                          <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                            {apt.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next scheduled visits</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.upcomingAppointments.map((apt) => (
                      <div key={apt._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">{apt.farmer?.name || 'Farmer'}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(apt.appointmentDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">{apt.appointmentTime}</p>
                          </div>
                          <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                            {apt.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Link to="/booking">
                      <Button className="w-full mt-4" size="sm" variant="outline">
                        Manage Appointments
                      </Button>
                    </Link>
                  </div>
                )}
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
                <Link to="/vet-onboarding">
                  <Button variant="outline" className="w-full">Update Profile</Button>
                </Link>
                <Link to="/booking">
                  <Button variant="outline" className="w-full">View Appointments</Button>
                </Link>
                <Link to="/health-records">
                  <Button variant="outline" className="w-full">Health Records</Button>
                </Link>
                <Link to="/messages">
                  <Button variant="outline" className="w-full">Messages</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default VetDashboard;

