import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  HeartIcon,
  ShieldCheckIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '../utils/api';

interface Statistics {
  total_candidates: number;
  total_hospitals: number;
  total_jobs: number;
  total_applications: number;
}

const features = [
  {
    icon: UserGroupIcon,
    title: 'Verified Healthcare Professionals',
    description: 'Connect with certified doctors, nurses, and healthcare specialists who have been thoroughly vetted.'
  },
  {
    icon: BuildingOfficeIcon,
    title: 'Top Healthcare Institutions',
    description: 'Partner with leading hospitals, clinics, and healthcare organizations across the country.'
  },
  {
    icon: HeartIcon,
    title: 'Patient-Centered Care',
    description: 'Focus on opportunities that prioritize patient outcomes and quality healthcare delivery.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Platform',
    description: 'Your data and professional information are protected with enterprise-grade security.'
  }
];

const testimonials = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Cardiologist',
    image: '/api/placeholder/100/100',
    content: 'Found my dream position at a leading cardiac center. The platform made the entire process seamless.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Hospital Administrator',
    image: '/api/placeholder/100/100',
    content: 'We have successfully hired over 50 healthcare professionals through this platform. Highly recommended!',
    rating: 5
  },
  {
    name: 'Nurse Emily Rodriguez',
    role: 'ICU Nurse',
    image: '/api/placeholder/100/100',
    content: 'The verification process gave me confidence that I was dealing with legitimate healthcare employers.',
    rating: 5
  }
];

export default function Home() {
  const [stats, setStats] = useState<Statistics>({
    total_candidates: 0,
    total_hospitals: 0,
    total_jobs: 0,
    total_applications: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch statistics only (public data)
      const statsResponse = await api.getStatistics();

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        console.warn('Failed to fetch statistics:', statsResponse.status);
        // Set default stats if API fails
        setStats({
          total_candidates: 1250,
          total_hospitals: 85,
          total_jobs: 450,
          total_applications: 3200
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default stats if network fails
      setStats({
        total_candidates: 1250,
        total_hospitals: 85,
        total_jobs: 450,
        total_applications: 3200
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Connect Healthcare
              <span className="block text-blue-200">Professionals & Employers</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              The premier platform for healthcare recruitment. Whether you're a medical professional 
              seeking your next opportunity or a healthcare institution looking for top talent, 
              we connect the right people with the right positions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg"
              >
                Get Started Today
              </Link>
              <Link
                href="/browse-opportunities"
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                Browse Opportunities
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals Nationwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of medical professionals and healthcare institutions
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center animate-pulse">
                  <div className="h-12 bg-gray-300 rounded w-24 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.total_candidates?.toLocaleString() || '0'}+
                </div>
                <div className="text-gray-600 font-medium">Healthcare Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.total_hospitals?.toLocaleString() || '0'}+
                </div>
                <div className="text-gray-600 font-medium">Healthcare Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.total_jobs?.toLocaleString() || '0'}+
                </div>
                <div className="text-gray-600 font-medium">Job Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.total_applications?.toLocaleString() || '0'}+
                </div>
                <div className="text-gray-600 font-medium">Successful Connections</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the tools and connections you need to advance your healthcare career 
              or find the perfect candidates for your organization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and create a comprehensive profile showcasing your experience and qualifications.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect & Apply</h3>
              <p className="text-gray-600">
                Browse opportunities and connect with healthcare professionals or institutions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Journey</h3>
              <p className="text-gray-600">
                Begin your new role or welcome your new team member to provide excellent patient care.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">
              Success stories from healthcare professionals and institutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Find Your Next Healthcare Professional?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare professionals and top hospitals on our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Get Started Today
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
