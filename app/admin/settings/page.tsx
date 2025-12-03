'use client';

import React, { useState, useEffect } from 'react';
import { Settings, settingsApi, UpdateSettingsDto } from '@/lib/api/settings.api';
import PermissionGate from '@/app/components/guards/PermissionGate';
import { PERMISSIONS } from '@/config/permissions';
import { useHeader } from '@/lib/contexts/HeaderContext';
import { useSettings } from '@/lib/contexts/SettingsContext';

const SettingsPage = () => {
  const { setTitle } = useHeader();
  const { settings, loading } = useSettings();
  const [formData, setFormData] = useState<Partial<Settings>>({});
  const [saving, setSaving] = useState(false);

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
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updateData: UpdateSettingsDto = {
        siteName: formData.siteName,
        siteDescription: formData.siteDescription,
        maintenanceMode: formData.maintenanceMode,
        allowRegistration: formData.allowRegistration,
        emailVerificationRequired: formData.emailVerificationRequired,
        defaultUserRole: formData.defaultUserRole,
        sessionTimeout: formData.sessionTimeout,
        maxLoginAttempts: formData.maxLoginAttempts,
        passwordMinLength: formData.passwordMinLength,
        passwordRequireUppercase: formData.passwordRequireUppercase,
        passwordRequireLowercase: formData.passwordRequireLowercase,
        passwordRequireNumbers: formData.passwordRequireNumbers,
        passwordRequireSpecialChars: formData.passwordRequireSpecialChars,
      };
      await settingsApi.update(updateData);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings', error);
      alert('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
      <div className="container mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  id="siteName"
                  value={formData.siteName || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <input
                  type="text"
                  name="siteDescription"
                  id="siteDescription"
                  value={formData.siteDescription || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  id="maintenanceMode"
                  checked={formData.maintenanceMode || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                  Maintenance Mode
                </label>
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Registration Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="allowRegistration"
                  id="allowRegistration"
                  checked={formData.allowRegistration || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                  Allow New User Registration
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="emailVerificationRequired"
                  id="emailVerificationRequired"
                  checked={formData.emailVerificationRequired || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="emailVerificationRequired" className="ml-2 block text-sm text-gray-900">
                  Require Email Verification
                </label>
              </div>
              <div>
                <label htmlFor="defaultUserRole" className="block text-sm font-medium text-gray-700">
                  Default User Role ID
                </label>
                <input
                  type="text"
                  name="defaultUserRole"
                  id="defaultUserRole"
                  value={formData.defaultUserRole || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                  Session Timeout (seconds)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  id="sessionTimeout"
                  value={formData.sessionTimeout || ''}
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
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Password Requirements</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  name="passwordMinLength"
                  id="passwordMinLength"
                  value={formData.passwordMinLength || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="passwordRequireUppercase"
                  id="passwordRequireUppercase"
                  checked={formData.passwordRequireUppercase || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="passwordRequireUppercase" className="ml-2 block text-sm text-gray-900">
                  Require Uppercase Letters
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="passwordRequireLowercase"
                  id="passwordRequireLowercase"
                  checked={formData.passwordRequireLowercase || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="passwordRequireLowercase" className="ml-2 block text-sm text-gray-900">
                  Require Lowercase Letters
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="passwordRequireNumbers"
                  id="passwordRequireNumbers"
                  checked={formData.passwordRequireNumbers || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="passwordRequireNumbers" className="ml-2 block text-sm text-gray-900">
                  Require Numbers
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="passwordRequireSpecialChars"
                  id="passwordRequireSpecialChars"
                  checked={formData.passwordRequireSpecialChars || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="passwordRequireSpecialChars" className="ml-2 block text-sm text-gray-900">
                  Require Special Characters
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </PermissionGate>
  );
};

export default SettingsPage;
