'use client';

import { useState, useCallback, useEffect } from 'react';
import { Customer } from '@/data/mock-customers';
import { CustomerCreateInput, CustomerUpdateInput } from '@/services/CustomerService';
import { LoadingButton } from './LoadingButton';
import Button from './Button';

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: CustomerCreateInput | CustomerUpdateInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  title?: string;
}

interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  subscriptionTier?: string;
  domains?: string;
  general?: string;
}

interface FormData {
  name: string;
  company: string;
  email: string;
  subscriptionTier: 'basic' | 'premium' | 'enterprise';
  domains: string[];
}

/**
 * CustomerForm component for creating and editing customers
 * Features comprehensive validation, error handling, and accessibility
 */
export function CustomerForm({
  customer = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  title
}: CustomerFormProps) {
  const isEditing = !!customer;
  const formTitle = title || (isEditing ? 'Edit Customer' : 'Create New Customer');

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: customer?.name || '',
    company: customer?.company || '',
    email: customer?.email || '',
    subscriptionTier: customer?.subscriptionTier || 'basic',
    domains: customer?.domains || []
  });

  const [newDomain, setNewDomain] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    name: false,
    company: false,
    email: false,
    subscriptionTier: false,
    domains: false
  });

  // Update form data when customer prop changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        company: customer.company || '',
        email: customer.email || '',
        subscriptionTier: customer.subscriptionTier || 'basic',
        domains: customer.domains || []
      });
    } else {
      setFormData({
        name: '',
        company: '',
        email: '',
        subscriptionTier: 'basic',
        domains: []
      });
    }
    setTouched({
      name: false,
      company: false,
      email: false,
      subscriptionTier: false,
      domains: false
    });
    setErrors({});
    setNewDomain('');
  }, [customer]);

  // Validation functions
  const validateField = useCallback((field: keyof FormData, value: string | string[]): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || (value as string).trim() === '') return 'Name is required';
        if ((value as string).trim().length < 2) return 'Name must be at least 2 characters';
        if ((value as string).trim().length > 100) return 'Name must be less than 100 characters';
        break;
        
      case 'company':
        if (!value || (value as string).trim() === '') return 'Company is required';
        if ((value as string).trim().length < 2) return 'Company name must be at least 2 characters';
        if ((value as string).trim().length > 100) return 'Company name must be less than 100 characters';
        break;
        
      case 'email':
        if (value && (value as string).trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test((value as string).trim())) return 'Please enter a valid email address';
        }
        break;
        
      case 'domains':
        // Domain validation is handled separately in addDomain function
        break;
    }
    return undefined;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Additional validation for domains
    if (formData.domains.length > 0) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}(\.[a-zA-Z]{2,})*)$/;
      const invalidDomain = formData.domains.find(domain => !domainRegex.test(domain));
      if (invalidDomain) {
        newErrors.domains = `Invalid domain format: ${invalidDomain}`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Event handlers
  const handleInputChange = useCallback((field: keyof FormData, value: string | 'basic' | 'premium' | 'enterprise') => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [formData, validateField]);

  const addDomain = useCallback(() => {
    const domain = newDomain.trim();
    if (!domain) return;

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}(\.[a-zA-Z]{2,})*)$/;
    if (!domainRegex.test(domain)) {
      setErrors(prev => ({ ...prev, domains: 'Please enter a valid domain (e.g., example.com)' }));
      return;
    }

    // Check for duplicates
    if (formData.domains.includes(domain)) {
      setErrors(prev => ({ ...prev, domains: 'This domain has already been added' }));
      return;
    }

    // Add domain
    setFormData(prev => ({
      ...prev,
      domains: [...prev.domains, domain]
    }));
    setNewDomain('');
    
    // Clear domain errors
    setErrors(prev => ({ ...prev, domains: undefined }));
  }, [newDomain, formData.domains]);

  const removeDomain = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.filter((_, i) => i !== index)
    }));
    
    // Clear domain errors
    setErrors(prev => ({ ...prev, domains: undefined }));
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      // Mark all fields as touched to show validation errors
      setTouched({
        name: true,
        company: true,
        email: true,
        subscriptionTier: true,
        domains: true
      });
      return;
    }

    try {
      // Prepare submission data
      const submissionData: CustomerCreateInput | CustomerUpdateInput = {
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim() || undefined,
        subscriptionTier: formData.subscriptionTier,
        domains: formData.domains.length > 0 ? formData.domains : undefined
      };

      await onSubmit(submissionData);
    } catch (err) {
      // Error handling is managed by parent component
      console.error('Form submission error:', err);
    }
  }, [formData, validateForm, onSubmit]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  const getHealthScoreColor = (tier: string): string => {
    switch (tier) {
      case 'enterprise': return 'text-green-600';
      case 'premium': return 'text-blue-600';
      case 'basic': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTierDescription = (tier: string): string => {
    switch (tier) {
      case 'enterprise': return 'Full feature access with priority support';
      case 'premium': return 'Enhanced features with standard support';
      case 'basic': return 'Core features with community support';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{formTitle}</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
          aria-label="Close form"
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form content - scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General error */}
          {(error || errors.general) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Form Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error || errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-2">
            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700">
              Customer Name *
            </label>
            <input
              id="customer-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.name && errors.name
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Enter customer's full name"
              disabled={loading}
              required
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!(touched.name && errors.name)}
            />
            {touched.name && errors.name && (
              <p id="name-error" className="text-sm text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company *
            </label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              onBlur={() => handleBlur('company')}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.company && errors.company
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Enter company name"
              disabled={loading}
              required
              aria-describedby={errors.company ? "company-error" : undefined}
              aria-invalid={!!(touched.company && errors.company)}
            />
            {touched.company && errors.company && (
              <p id="company-error" className="text-sm text-red-600" role="alert">
                {errors.company}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.email && errors.email
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="customer@company.com"
              disabled={loading}
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!(touched.email && errors.email)}
            />
            {touched.email && errors.email && (
              <p id="email-error" className="text-sm text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Subscription Tier */}
          <div className="space-y-2">
            <label htmlFor="subscription-tier" className="block text-sm font-medium text-gray-700">
              Subscription Tier
            </label>
            <select
              id="subscription-tier"
              value={formData.subscriptionTier}
              onChange={(e) => handleInputChange('subscriptionTier', e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <p className={`text-sm ${getHealthScoreColor(formData.subscriptionTier)}`}>
              {getTierDescription(formData.subscriptionTier)}
            </p>
          </div>

          {/* Domains */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Domains to Monitor
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>
            
            {/* Add domain input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDomain();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example.com"
                disabled={loading}
              />
              <Button
                type="button"
                onClick={addDomain}
                variant="secondary"
                disabled={!newDomain.trim() || loading}
              >
                Add
              </Button>
            </div>

            {/* Domain list */}
            {formData.domains.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {formData.domains.length} domain{formData.domains.length === 1 ? '' : 's'} added:
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.domains.map((domain, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {domain}
                      <button
                        type="button"
                        onClick={() => removeDomain(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                        aria-label={`Remove ${domain}`}
                        disabled={loading}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {errors.domains && (
              <p className="text-sm text-red-600" role="alert">
                {errors.domains}
              </p>
            )}
          </div>

          {/* Health Score Preview */}
          {isEditing && customer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Health Score</h4>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${
                  customer.healthScore >= 71 ? 'bg-green-500' :
                  customer.healthScore >= 31 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-lg font-semibold text-gray-900">
                  {customer.healthScore}
                </span>
                <span className="text-sm text-gray-600">/100</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Health score is automatically calculated based on subscription tier, domains, and other factors.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 bg-gray-50">
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={loading}
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={() => {}}
          variant="primary"
          isLoading={loading}
          loadingText={isEditing ? 'Updating...' : 'Creating...'}
          disabled={loading}
          type="submit"
        >
          {isEditing ? 'Update Customer' : 'Create Customer'}
        </LoadingButton>
      </div>
    </div>
  );
}