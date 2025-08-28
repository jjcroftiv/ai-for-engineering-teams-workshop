/**
 * React hooks for CustomerService integration
 * 
 * Provides React hooks for easy integration with the CustomerService.
 * Handles loading states, errors, and data synchronization.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  customerService, 
  CustomerCreateInput, 
  CustomerUpdateInput, 
  CustomerFilterOptions,
  PaginatedResponse
} from '@/services/CustomerService';
import { Customer } from '@/data/mock-customers';

/**
 * Hook for fetching paginated customers with filtering
 */
export function useCustomers(
  options: CustomerFilterOptions & { page?: number; limit?: number } = {}
) {
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await customerService.getCustomers({
      page: 1,
      limit: 10,
      ...options
    });

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to fetch customers');
    }

    setLoading(false);
  }, [
    options.page,
    options.limit,
    options.subscriptionTier,
    options.healthScoreMin,
    options.healthScoreMax,
    options.company,
    options.searchTerm
  ]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers: data,
    loading,
    error,
    refetch: fetchCustomers
  };
}

/**
 * Hook for fetching a single customer by ID
 */
export function useCustomer(id: string | null) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCustomer(null);
      setLoading(false);
      setError(null);
      return;
    }

    async function fetchCustomer() {
      setLoading(true);
      setError(null);

      const result = await customerService.getCustomerById(id!);

      if (result.success && result.data) {
        setCustomer(result.data);
      } else {
        setError(result.error || 'Failed to fetch customer');
        setCustomer(null);
      }

      setLoading(false);
    }

    fetchCustomer();
  }, [id]);

  return { customer, loading, error };
}

/**
 * Hook for customer CRUD operations
 */
export function useCustomerOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = useCallback(async (input: CustomerCreateInput): Promise<Customer | null> => {
    setLoading(true);
    setError(null);

    const result = await customerService.createCustomer(input);

    if (result.success && result.data) {
      setLoading(false);
      return result.data;
    } else {
      setError(result.error || 'Failed to create customer');
      setLoading(false);
      return null;
    }
  }, []);

  const updateCustomer = useCallback(async (
    id: string, 
    input: CustomerUpdateInput
  ): Promise<Customer | null> => {
    setLoading(true);
    setError(null);

    const result = await customerService.updateCustomer(id, input);

    if (result.success && result.data) {
      setLoading(false);
      return result.data;
    } else {
      setError(result.error || 'Failed to update customer');
      setLoading(false);
      return null;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const result = await customerService.deleteCustomer(id);

    if (result.success) {
      setLoading(false);
      return true;
    } else {
      setError(result.error || 'Failed to delete customer');
      setLoading(false);
      return false;
    }
  }, []);

  return {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    loading,
    error,
    clearError: () => setError(null)
  };
}

/**
 * Hook for customer search functionality
 */
export function useCustomerSearch() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await customerService.searchCustomers(searchTerm);

    if (result.success && result.data) {
      setCustomers(result.data);
    } else {
      setError(result.error || 'Failed to search customers');
      setCustomers([]);
    }

    setLoading(false);
  }, []);

  return {
    customers,
    searchCustomers,
    loading,
    error,
    clearResults: () => setCustomers([])
  };
}

/**
 * Hook for customer statistics
 */
export function useCustomerStats() {
  const [stats, setStats] = useState<{
    total: number;
    byTier: { basic: number; premium: number; enterprise: number };
    averageHealthScore: number;
    healthDistribution: { healthy: number; warning: number; critical: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await customerService.getCustomerStats();

    if (result.success && result.data) {
      setStats(result.data);
    } else {
      setError(result.error || 'Failed to fetch customer statistics');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

/**
 * Hook for customers filtered by health score ranges
 */
export function useCustomersByHealthScore(
  minScore: number = 0, 
  maxScore: number = 100,
  enabled: boolean = true
) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCustomers([]);
      return;
    }

    async function fetchCustomers() {
      setLoading(true);
      setError(null);

      const result = await customerService.getCustomersByHealthScore(minScore, maxScore);

      if (result.success && result.data) {
        setCustomers(result.data);
      } else {
        setError(result.error || 'Failed to fetch customers by health score');
        setCustomers([]);
      }

      setLoading(false);
    }

    fetchCustomers();
  }, [minScore, maxScore, enabled]);

  return { customers, loading, error };
}