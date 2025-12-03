'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { ISetting } from '@/lib/db/models/Setting';
import PermissionGate from '@/app/components/guards/PermissionGate';
import { PERMISSIONS } from '@/config/permissions';
import { useHeader } from '@/lib/contexts/HeaderContext';
import { useSettings } from '@/lib/contexts/SettingsContext';

const SettingsPage = () => {
  const { setTitle } = useHeader();
  const { settings, loading } = useSettings();
  const [formData, setFormData] = useState<Partial<ISetting>>({});

  useEffect(() => {
    setTitle('Application Settings');
  }, [setTitle]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings', formData);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings', error);
      alert('Failed to update settings.');
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
      <div className="container mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
              App Name
            </label>
            <input
              type="text"
              name="appName"
              id="appName"
              value={formData.appName || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="appLogo" className="block text-sm font-medium text-gray-700">
              App Logo URL
            </label>
            <input
              type="text"
              name="appLogo"
              id="appLogo"
              value={formData.appLogo || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              id="companyName"
              value={formData.companyName || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700">
              Company Logo URL
            </label>
            <input
              type="text"
              name="companyLogo"
              id="companyLogo"
              value={formData.companyLogo || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="jwt_access_token_secret" className="block text-sm font-medium text-gray-700">
              JWT Access Token Secret
            </label>
            <input
              type="text"
              name="jwt_access_token_secret"
              id="jwt_access_token_secret"
              value={formData.jwt_access_token_secret || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="jwt_access_token_expires_in" className="block text-sm font-medium text-gray-700">
              JWT Access Token Expires In
            </label>
            <input
              type="text"
              name="jwt_access_token_expires_in"
              id="jwt_access_token_expires_in"
              value={formData.jwt_access_token_expires_in || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="jwt_refresh_token_secret" className="block text-sm font-medium text-gray-700">
              JWT Refresh Token Secret
            </label>
            <input
              type="text"
              name="jwt_refresh_token_secret"
              id="jwt_refresh_token_secret"
              value={formData.jwt_refresh_token_secret || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="jwt_refresh_token_expires_in" className="block text-sm font-medium text-gray-700">
              JWT Refresh Token Expires In
            </label>
            <input
              type="text"
              name="jwt_refresh_token_expires_in"
              id="jwt_refresh_token_expires_in"
              value={formData.jwt_refresh_token_expires_in || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
              Max Login Attempts
            </label>
            <input
              type="number"
              name="maxLoginAttempts"
              id="maxLoginAttempts"
              value={formData.maxLoginAttempts || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="lockoutDuration" className="block text-sm font-medium text-gray-700">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              name="lockoutDuration"
              id="lockoutDuration"
              value={formData.lockoutDuration || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Settings
          </button>
        </form>
      </div>
    </PermissionGate>
  );
};

export default SettingsPage;
