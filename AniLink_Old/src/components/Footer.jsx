
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-green-500 fill-current" />
              <span className="text-xl font-bold">AniLink</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting animals with professional veterinary care across Uganda. 
              Your trusted partner in animal health and wellness.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-green-500 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <span className="text-lg font-semibold">Quick Links</span>
            <div className="flex flex-col space-y-2">
              <Link to="/vets" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Find Veterinarians
              </Link>
              <Link to="/marketplace" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Pet Marketplace
              </Link>
              <Link to="/booking" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Book Appointment
              </Link>
              <Link to="/health-records" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Health Records
              </Link>
              <Link to="/ai-symptom-checker" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                AI Symptom Checker
              </Link>
              <Link to="/fmd-checker" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                FMD Checker
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <span className="text-lg font-semibold">Services</span>
            <div className="flex flex-col space-y-2">
              <span className="text-gray-400 text-sm">Pet Health Records</span>
              <span className="text-gray-400 text-sm">Vaccination Tracking</span>
              <span className="text-gray-400 text-sm">Farm Animal Care</span>
              <span className="text-gray-400 text-sm">Pet Adoption</span>
              <span className="text-gray-400 text-sm">Animal Feeds</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <span className="text-lg font-semibold">Contact Us</span>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="text-gray-400 text-sm">+256 700 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="text-gray-400 text-sm">info@anilink.ug</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-gray-400 text-sm">Kampala, Uganda</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 AniLink. All rights reserved. | 
            <span className="text-green-500 ml-1">Connecting Animals with Care</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
