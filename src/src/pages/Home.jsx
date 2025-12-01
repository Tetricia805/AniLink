
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  ShoppingBag, 
  Calendar, 
  Shield, 
  Clock, 
  Users, 
  Star,
  ArrowRight,
  Phone,
  Stethoscope,
  PawPrint,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Home = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Find Local Vets',
      description: 'Discover qualified veterinarians and clinics in your region with detailed profiles and reviews.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: ShoppingBag,
      title: 'Pet Marketplace',
      description: 'Buy pets, animal feeds, and veterinary supplies from trusted vendors across Uganda.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Schedule appointments for pets and farm animals with automated reminders.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Shield,
      title: 'Health Records',
      description: 'Digital health records, vaccination tracking, and treatment history management.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/health-records'
    },
    {
      icon: Stethoscope,
      title: 'AI Symptom Checker',
      description: 'AI-powered preliminary health assessment to help identify potential health issues.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/ai-symptom-checker'
    },
    {
      icon: AlertCircle,
      title: 'FMD Checker',
      description: 'Specialized tool for detecting Foot-and-Mouth Disease signs in cattle.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/fmd-checker'
    }
  ];

  const stats = [
    { number: '500+', label: 'Veterinarians', icon: Stethoscope },
    { number: '10,000+', label: 'Happy Pets', icon: PawPrint },
    { number: '50+', label: 'Districts Covered', icon: MapPin },
    { number: '24/7', label: 'Emergency Support', icon: Phone }
  ];

  const testimonials = [
    {
      name: 'Sarah Nakato',
      location: 'Kampala',
      rating: 5,
      text: 'AniLink helped me find an amazing vet for my dog. The booking system is so convenient!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'James Okello',
      location: 'Mbarara',
      rating: 5,
      text: 'As a farmer, this platform has been invaluable for my cattle. Quick access to professional care.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Dr. Mary Achieng',
      location: 'Jinja',
      rating: 5,
      text: 'AniLink has expanded my practice reach. I can now serve more animals across the region.',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 hero-pattern">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  🇺🇬 Proudly Serving Uganda
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Connecting
                  <span className="text-gradient block">Animals with Care</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Uganda's premier veterinary platform. Find qualified vets, book appointments, 
                  shop for pets and feeds, all in one comprehensive digital solution.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gradient-bg hover:shadow-lg transition-all">
                  <Link to="/vets">
                    Find Veterinarians
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-green-200 hover:bg-green-50">
                  <Link to="/marketplace">
                    Explore Marketplace
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-green-100 border-2 border-white flex items-center justify-center">
                      <Heart className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Trusted by 10,000+ pet owners</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">4.9/5 rating</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img  
                  className="rounded-2xl shadow-2xl w-full floating-animation" 
                  alt="Veterinarian caring for animals in Uganda"
                 src="https://images.unsplash.com/photo-1454017158274-a1239577f5c3" />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center space-y-2"
                >
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need for
              <span className="text-gradient block">Animal Care</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive veterinary services and marketplace solutions designed for Uganda's unique needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const FeatureCard = (
                <Card className="h-full card-hover border-0 shadow-lg cursor-pointer">
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`h-8 w-8 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
              );
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {feature.link ? (
                    <Link to={feature.link}>
                      {FeatureCard}
                    </Link>
                  ) : (
                    FeatureCard
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">How AniLink Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to connect with professional veterinary care
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Search & Discover',
                description: 'Find veterinarians, clinics, or browse our marketplace based on your location and needs.',
                icon: MapPin
              },
              {
                step: '2',
                title: 'Book & Connect',
                description: 'Schedule appointments, chat with vets, or purchase products directly through our platform.',
                icon: Calendar
              },
              {
                step: '3',
                title: 'Care & Track',
                description: 'Receive professional care and track your animal\'s health records digitally.',
                icon: Heart
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="text-center space-y-4"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Icon className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">What Our Community Says</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from pet owners, farmers, and veterinarians across Uganda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6">"{testimonial.text}"</p>
                    <div className="flex items-center space-x-3">
                      <img  
                        className="w-12 h-12 rounded-full object-cover" 
                        alt={`${testimonial.name} profile picture`}
                       src="https://images.unsplash.com/photo-1590769620285-6926a01c2a58" />
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Connect Your Animals with Professional Care?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied pet owners and farmers who trust AniLink 
              for their animal healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                <Link to="/vets">
                  Find a Veterinarian
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                <Link to="/marketplace">
                  Browse Marketplace
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
