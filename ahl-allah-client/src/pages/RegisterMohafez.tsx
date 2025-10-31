import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

export function RegisterMohafez() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    country: '',
    city: '',
    birthyear: '',
    gender: '',
    arabicName: '',
    summery: '',
    ejaza: '',
    myEjazaEnum: '1',
    degree: '0',
    language: '1',
    phoneNumber: '',
    whatsappPhoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.registerMohafez({
        ...formData,
        birthyear: parseInt(formData.birthyear),
        myEjazaEnum: parseInt(formData.myEjazaEnum),
        degree: parseInt(formData.degree),
        language: parseInt(formData.language),
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register as Mohafez
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                id="name"
                name="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="arabicName" className="block text-sm font-medium text-gray-700">
                Arabic Name
              </label>
              <input
                id="arabicName"
                name="arabicName"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.arabicName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country *
              </label>
              <input
                id="country"
                name="country"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                id="city"
                name="city"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="birthyear" className="block text-sm font-medium text-gray-700">
                Birth Year *
              </label>
              <input
                id="birthyear"
                name="birthyear"
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.birthyear}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="whatsappPhoneNumber" className="block text-sm font-medium text-gray-700">
                WhatsApp Number
              </label>
              <input
                id="whatsappPhoneNumber"
                name="whatsappPhoneNumber"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.whatsappPhoneNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="myEjazaEnum" className="block text-sm font-medium text-gray-700">
                Ejaza Type *
              </label>
              <select
                id="myEjazaEnum"
                name="myEjazaEnum"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.myEjazaEnum}
                onChange={handleChange}
              >
                <option value="1">Quran</option>
                <option value="2">Hadith</option>
                <option value="3">Both</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                id="language"
                name="language"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="1">Arabic</option>
                <option value="2">English</option>
                <option value="3">All</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="summery" className="block text-sm font-medium text-gray-700">
              Summary *
            </label>
            <textarea
              id="summery"
              name="summery"
              required
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.summery}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="ejaza" className="block text-sm font-medium text-gray-700">
              Ejaza *
            </label>
            <textarea
              id="ejaza"
              name="ejaza"
              required
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.ejaza}
              onChange={handleChange}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Mohafez'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Login
            </Link>
            {' | '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register as Normal User
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

