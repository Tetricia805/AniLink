
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Menu, X, User, ShoppingBag, Calendar, MapPin, Stethoscope, Users, Bell, MessageCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { register, login } from '@/api/auth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login: authLogin, logout: authLogout } = useAuth();

  const regions = ['Central', 'Eastern', 'Western', 'Northern'];
  const livestockSpecies = ['cattle', 'goats', 'sheep', 'poultry', 'swine', 'rabbits', 'fish', 'camels'];

  // Helper function to get dashboard path based on role
  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'vet':
        return '/dashboard/vet';
      case 'vendor':
        return '/dashboard/vendor';
      case 'farmer':
      default:
        return '/dashboard';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
      const response = await login({ email, password });
      if (response.status === 'success') {
        const { user: userData, token } = response.data;
        authLogin(userData, token);
        setIsLoginOpen(false);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        // Redirect to appropriate dashboard
        const dashboardPath = getDashboardPath(userData.role);
        navigate(dashboardPath);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const role = formData.get('role') || 'farmer';
    const region = formData.get('region');
    const district = formData.get('district');
    const primarySpecies = formData.getAll('primarySpecies');
    const locationLat = formData.get('locationLat');
    const locationLng = formData.get('locationLng');
    const payload = {
      name,
      email,
      phone,
      password,
      role,
      region,
      district
    };
    if (primarySpecies.length) {
      payload.farmerProfile = { primarySpecies };
    }
    if (locationLat && locationLng) {
      payload.location = {
        coordinates: [parseFloat(locationLng), parseFloat(locationLat)]
      };
    }
    
    try {
      const response = await register(payload);
      if (response.status === 'success') {
        const { user: userData, token } = response.data;
        authLogin(userData, token);
        setIsSignupOpen(false);
        toast({
          title: 'Account created!',
          description: 'Welcome to AniLink.',
        });
        // Redirect to appropriate dashboard
        const dashboardPath = getDashboardPath(userData.role);
        navigate(dashboardPath);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.msg || 
        'Registration failed. Please try again.';
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      navigate('/');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const baseNavItems = [
    { name: 'Find Vets', path: '/vets', icon: MapPin },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
  ];

  const navItems = React.useMemo(() => {
    const items = [...baseNavItems];
    
    // Add dashboard link for authenticated users
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      items.push({
        name: 'Dashboard',
        path: dashboardPath,
        icon: BarChart3
      });
    }
    
    // Add authenticated user items
    if (user) {
      items.push(
        { name: 'Book Appointment', path: '/booking', icon: Calendar },
        { name: 'My Herds', path: '/herds', icon: Users },
        { name: 'Health Records', path: '/health-records', icon: Heart },
        { name: 'Messages', path: '/messages', icon: MessageCircle },
        { name: 'AI Checker', path: '/ai-symptom-checker', icon: Stethoscope }
      );
    }
    
    // Role-specific items
    if (user && (user.role === 'vet' || user.role === 'admin')) {
      items.push({
        name: 'Vet Profile',
        path: '/vet-onboarding',
        icon: Stethoscope
      });
    }
    if (user && (user.role === 'vendor' || user.role === 'admin')) {
      items.push({
        name: 'My Products',
        path: '/vendor-products',
        icon: ShoppingBag
      });
    }
    if (user && user.role === 'admin') {
      items.push({
        name: 'Admin Dashboard',
        path: '/admin',
        icon: BarChart3
      });
    }
    return items;
  }, [baseNavItems, user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center space-x-2"
            >
              <div className="relative">
                <Heart className="h-8 w-8 text-green-600 fill-current" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold text-gradient">AniLink</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-green-600 ${
                    location.pathname === item.path
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-md text-sm font-medium text-green-700 hover:bg-green-100"
                >
                  <User className="h-4 w-4 text-green-600" />
                  <span>{user.name}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Login</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Login to AniLink</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required disabled={isLoading} />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required disabled={isLoading} />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">Sign Up</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join AniLink</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSignup} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" required disabled={isLoading} />
                        </div>
                        <div>
                          <Label htmlFor="role">Account Type</Label>
                          <select
                            id="role"
                            name="role"
                            defaultValue="farmer"
                            disabled={isLoading}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="farmer">Farmer</option>
                            <option value="vet">Veterinarian</option>
                            <option value="vendor">Vendor</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="signup-email">Email</Label>
                          <Input id="signup-email" name="email" type="email" required disabled={isLoading} />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" name="phone" type="tel" placeholder="+256700000000" required disabled={isLoading} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="region">Region</Label>
                          <select
                            id="region"
                            name="region"
                            required
                            disabled={isLoading}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">Select region</option>
                            {regions.map((region) => (
                              <option key={region} value={region}>{region}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="district">District</Label>
                          <Input id="district" name="district" placeholder="e.g. Wakiso" required disabled={isLoading} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="locationLat">Latitude (optional)</Label>
                          <Input id="locationLat" name="locationLat" type="number" step="0.00001" disabled={isLoading} />
                        </div>
                        <div>
                          <Label htmlFor="locationLng">Longitude (optional)</Label>
                          <Input id="locationLng" name="locationLng" type="number" step="0.00001" disabled={isLoading} />
                        </div>
                      </div>
                      <div>
                        <Label>Primary Livestock (optional)</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {livestockSpecies.map((species) => (
                            <label key={species} className="flex items-center space-x-1 text-sm">
                              <input
                                type="checkbox"
                                name="primarySpecies"
                                value={species}
                                disabled={isLoading}
                              />
                              <span className="capitalize">{species}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <Input id="signup-password" name="password" type="password" required disabled={isLoading} />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t"
          >
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {!user && (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setIsLoginOpen(true)}>
                    Login
                  </Button>
                  <Button size="sm" onClick={() => setIsSignupOpen(true)}>
                    Sign Up
                  </Button>
                </div>
              )}
              {user && (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Link
                    to="/notifications"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-md bg-green-50 text-sm font-medium text-green-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    View Profile
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
