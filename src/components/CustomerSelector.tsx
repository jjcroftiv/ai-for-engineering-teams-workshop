'use client';

import { useState, useMemo, useCallback, KeyboardEvent } from 'react';
import { Customer } from '@/data/mock-customers';
import { CustomerCard } from './CustomerCard';

interface CustomerSelectorProps {
  customers: Customer[];
  onCustomerSelect?: (customer: Customer | null) => void;
  initialSelectedCustomer?: Customer | null;
  loading?: boolean;
}

interface SelectableCustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customer: Customer) => void;
  tabIndex: number;
}

function SelectableCustomerCard({ customer, isSelected, onSelect, tabIndex }: SelectableCustomerCardProps) {
  const handleClick = useCallback(() => {
    onSelect(customer);
  }, [customer, onSelect]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(customer);
    }
  }, [customer, onSelect]);

  return (
    <div
      className={`cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg ${
        isSelected 
          ? 'ring-2 ring-blue-500 ring-offset-2 transform scale-[1.02]' 
          : 'hover:transform hover:scale-[1.01] hover:shadow-lg'
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role="button"
      aria-label={`Select customer ${customer.name} from ${customer.company}`}
      aria-pressed={isSelected}
    >
      <CustomerCard customer={customer} />
    </div>
  );
}

export function CustomerSelector({ 
  customers, 
  onCustomerSelect, 
  initialSelectedCustomer = null,
  loading = false 
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialSelectedCustomer);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchLower) ||
      customer.company.toLowerCase().includes(searchLower)
    );
  }, [customers, searchTerm]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    const newSelection = selectedCustomer?.id === customer.id ? null : customer;
    setSelectedCustomer(newSelection);
    onCustomerSelect?.(newSelection);
  }, [selectedCustomer, onCustomerSelect]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Basic XSS prevention - sanitize input
    const sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setSearchTerm(sanitizedValue);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search customers by name or company..."
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            aria-label="Search customers"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg 
                className="h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </div>
        
        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {searchTerm ? (
              `${filteredCustomers.length} customer${filteredCustomers.length === 1 ? '' : 's'} found`
            ) : (
              `${customers.length} total customer${customers.length === 1 ? '' : 's'}`
            )}
          </span>
          {selectedCustomer && (
            <span className="text-blue-600 font-medium">
              Selected: {selectedCustomer.name}
            </span>
          )}
        </div>
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? `No customers match "${searchTerm}". Try a different search term.`
              : 'No customers available at this time.'
            }
          </p>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          role="grid"
          aria-label="Customer selection grid"
        >
          {filteredCustomers.map((customer) => (
            <SelectableCustomerCard
              key={customer.id}
              customer={customer}
              isSelected={selectedCustomer?.id === customer.id}
              onSelect={handleCustomerSelect}
              tabIndex={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}