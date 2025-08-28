'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Customer } from '@/data/mock-customers';
import { CustomerCreateInput, CustomerUpdateInput } from '@/services/CustomerService';
import { useCustomers, useCustomerOperations, useCustomerStats } from '@/hooks/useCustomerService';
import { CustomerList } from './CustomerList';
import { CustomerForm } from './CustomerForm';
import { ConfirmDialog } from './ConfirmDialog';
import { useSuccessToast, useErrorToast } from './Toast';
import { LoadingButton } from './LoadingButton';
import Button from './Button';

type ViewMode = 'list' | 'create' | 'edit' | 'details';

interface CustomerManagerProps {
  className?: string;
}

/**
 * CustomerManager - Main dashboard for comprehensive customer management
 * Integrates all customer CRUD operations with a cohesive interface
 */
export function CustomerManager({ className = '' }: CustomerManagerProps) {
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    customer: Customer | null;
  }>({ isOpen: false, customer: null });

  // Data hooks
  const { customers, loading: customersLoading, error: customersError, refetch } = useCustomers();
  const { createCustomer, updateCustomer, deleteCustomer, loading: operationLoading, error: operationError, clearError } = useCustomerOperations();
  const { stats, loading: statsLoading } = useCustomerStats();

  // Toast hooks
  const showSuccessToast = useSuccessToast();
  const showErrorToast = useErrorToast();

  // Computed values
  const customerList = useMemo(() => customers?.data || [], [customers]);
  const totalCustomers = useMemo(() => customers?.pagination?.total || 0, [customers]);

  // Event handlers
  const handleCreateNew = useCallback(() => {
    setSelectedCustomer(null);
    setViewMode('create');
    clearError();
  }, [clearError]);

  const handleEdit = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('edit');
    clearError();
  }, [clearError]);

  const handleViewDetails = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('details');
  }, []);

  const handleDeleteClick = useCallback((customer: Customer) => {
    setDeleteConfirmation({ isOpen: true, customer });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmation.customer) return;

    const success = await deleteCustomer(deleteConfirmation.customer.id);
    
    if (success) {
      showSuccessToast(
        'Customer deleted',
        `${deleteConfirmation.customer.name} has been removed from your customer list.`
      );
      setDeleteConfirmation({ isOpen: false, customer: null });
      refetch();
    } else {
      showErrorToast(
        'Delete failed',
        operationError || 'Unable to delete customer. Please try again.'
      );
    }
  }, [deleteConfirmation.customer, deleteCustomer, operationError, showSuccessToast, showErrorToast, refetch]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmation({ isOpen: false, customer: null });
  }, []);

  const handleFormSubmit = useCallback(async (data: CustomerCreateInput | CustomerUpdateInput) => {
    try {
      if (viewMode === 'create') {
        const newCustomer = await createCustomer(data as CustomerCreateInput);
        if (newCustomer) {
          showSuccessToast(
            'Customer created',
            `${newCustomer.name} has been added to your customer list.`
          );
          setViewMode('list');
          refetch();
        } else {
          showErrorToast(
            'Creation failed',
            operationError || 'Unable to create customer. Please check the form and try again.'
          );
        }
      } else if (viewMode === 'edit' && selectedCustomer) {
        const updatedCustomer = await updateCustomer(selectedCustomer.id, data as CustomerUpdateInput);
        if (updatedCustomer) {
          showSuccessToast(
            'Customer updated',
            `${updatedCustomer.name} has been successfully updated.`
          );
          setViewMode('list');
          setSelectedCustomer(null);
          refetch();
        } else {
          showErrorToast(
            'Update failed',
            operationError || 'Unable to update customer. Please check the form and try again.'
          );
        }
      }
    } catch (error) {
      showErrorToast(
        'Unexpected error',
        'Something went wrong. Please try again.'
      );
    }
  }, [viewMode, selectedCustomer, createCustomer, updateCustomer, operationError, showSuccessToast, showErrorToast, refetch]);

  const handleFormCancel = useCallback(() => {
    setViewMode('list');
    setSelectedCustomer(null);
    clearError();
  }, [clearError]);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedCustomer(null);
  }, []);

  // Clear operation errors when view mode changes
  useEffect(() => {
    if (viewMode === 'list') {
      clearError();
    }
  }, [viewMode, clearError]);

  const getHealthScoreColor = (score: number): string => {
    if (score >= 71) return 'text-green-600';
    if (score >= 31) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number): string => {
    if (score >= 71) return 'bg-green-100';
    if (score >= 31) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Render different views
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              disabled={operationLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to customers
            </button>
          </div>
          
          <div className="flex justify-center">
            <CustomerForm
              customer={viewMode === 'edit' ? selectedCustomer : null}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              loading={operationLoading}
              error={operationError}
            />
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedCustomer) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to customers
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Customer Details</h2>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(selectedCustomer)} variant="secondary" size="small">
                    Edit
                  </Button>
                  <Button onClick={() => handleDeleteClick(selectedCustomer)} variant="danger" size="small">
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.name}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCustomer.company}</dd>
                  </div>
                  
                  {selectedCustomer.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${selectedCustomer.email}`} className="text-blue-600 hover:text-blue-500">
                          {selectedCustomer.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Subscription Tier</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedCustomer.subscriptionTier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        selectedCustomer.subscriptionTier === 'premium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCustomer.subscriptionTier?.charAt(0).toUpperCase()}{selectedCustomer.subscriptionTier?.slice(1)}
                      </span>
                    </dd>
                  </div>
                </div>

                {/* Health & Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Health & Status</h3>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Health Score</dt>
                    <dd className="mt-1">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full ${getHealthScoreBg(selectedCustomer.healthScore)}`}>
                          <span className={`text-lg font-semibold ${getHealthScoreColor(selectedCustomer.healthScore)}`}>
                            {selectedCustomer.healthScore}
                          </span>
                          <span className="text-sm text-gray-600 ml-1">/100</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedCustomer.healthScore >= 71 ? 'Healthy' :
                           selectedCustomer.healthScore >= 31 ? 'Warning' : 'Critical'}
                        </span>
                      </div>
                    </dd>
                  </div>
                  
                  {selectedCustomer.domains && selectedCustomer.domains.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Monitored Domains ({selectedCustomer.domains.length})</dt>
                      <dd className="mt-1">
                        <div className="flex flex-wrap gap-2">
                          {selectedCustomer.domains.map((domain, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                            >
                              {domain}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  )}
                  
                  {selectedCustomer.createdAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Customer Since</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </dd>
                    </div>
                  )}
                  
                  {selectedCustomer.updatedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(selectedCustomer.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your customer relationships and monitor their health scores
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <LoadingButton
                onClick={handleCreateNew}
                variant="primary"
                isLoading={customersLoading}
                className="w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Customer
              </LoadingButton>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Healthy Customers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.healthDistribution.healthy}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Need Attention</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.healthDistribution.warning + stats.healthDistribution.critical}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Health Score</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.averageHealthScore}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow">
          <CustomerList
            customers={customerList}
            loading={customersLoading}
            error={customersError}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onViewDetails={handleViewDetails}
            showActions={true}
          />
        </div>

        {/* Empty state */}
        {!customersLoading && customerList.length === 0 && !customersError && (
          <div className="bg-white rounded-lg shadow">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No customers yet</h3>
              <p className="mt-1 text-gray-500">Get started by adding your first customer.</p>
              <div className="mt-6">
                <Button onClick={handleCreateNew} variant="primary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Customer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deleteConfirmation.customer?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={operationLoading}
        details={deleteConfirmation.customer ? [
          `Customer: ${deleteConfirmation.customer.name}`,
          `Company: ${deleteConfirmation.customer.company}`,
          `All associated data will be permanently removed`
        ] : []}
      />
    </div>
  );
}