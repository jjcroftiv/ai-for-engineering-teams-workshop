'use client';

import { Suspense, useState } from 'react';
import { CustomerSelector } from '@/components/CustomerSelector';
import { CustomerManager } from '@/components/CustomerManager';
import { ToastProvider } from '@/components/Toast';
import { mockCustomers, Customer } from '@/data/mock-customers';

// Component showcase with CustomerSelector
const CustomerSelectorDemo = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-green-600 text-sm font-medium">✅ CustomerSelector implemented!</p>
      <CustomerSelector 
        customers={mockCustomers}
        onCustomerSelect={setSelectedCustomer}
        initialSelectedCustomer={null}
      />
      {selectedCustomer && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Selected Customer:</h4>
          <p className="text-blue-800">{selectedCustomer.name} - {selectedCustomer.company}</p>
        </div>
      )}
    </div>
  );
};

const DashboardWidgetDemo = ({ widgetName, exerciseNumber }: { widgetName: string, exerciseNumber: number }) => {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
      {widgetName}
      <br />
      <span className="text-xs">Exercise {exerciseNumber}</span>
    </div>
  );
};

export default function Home() {
  const [showManager, setShowManager] = useState(false);

  if (showManager) {
    return (
      <ToastProvider>
        <div className="min-h-screen">
          <CustomerManager />
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Customer Intelligence Dashboard
              </h1>
              <p className="text-gray-600">
                AI for Engineering Teams Workshop - Your Progress
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowManager(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Launch Customer Manager
              </button>
            </div>
          </div>
        </header>

        {/* Progress Indicator */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Workshop Progress</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ Setup Complete - Next.js app is running</p>
            <p>✅ Exercise 3: CustomerCard component implemented</p>
            <p>✅ Exercise 4: CustomerSelector integration completed</p>
            <p>✅ Phase 2: Customer Management CRUD implemented</p>
            <div className="ml-4 space-y-1 text-xs text-green-600">
              <p>• CustomerList with grid/list views</p>
              <p>• CustomerForm with validation</p>
              <p>• CustomerManager with full CRUD operations</p>
              <p>• Toast notifications and confirmation dialogs</p>
            </div>
            <p className="text-gray-400">⏳ Exercise 5: Domain Health widget</p>
            <p className="text-gray-400">⏳ Exercise 9: Production-ready features</p>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900 mb-2">🎉 Customer Management System Ready!</h2>
              <p className="text-blue-800 mb-4">
                Complete CRUD interface with advanced features including search, filtering, pagination, and health score monitoring.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div className="space-y-2">
                  <p><strong>Features Implemented:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Create, Read, Update, Delete operations</li>
                    <li>Grid and list view modes</li>
                    <li>Advanced search and filtering</li>
                    <li>Pagination with full navigation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p><strong>UI/UX Features:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Toast notifications for feedback</li>
                    <li>Confirmation dialogs for safety</li>
                    <li>Form validation with error handling</li>
                    <li>Responsive design & accessibility</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Component Showcase Area */}
        <div className="space-y-8">
          {/* CustomerSelector Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">CustomerSelector Component</h3>
            <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
              <CustomerSelectorDemo />
            </Suspense>
          </section>

          {/* Dashboard Widgets Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Dashboard Widgets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardWidgetDemo widgetName="Domain Health Widget" exerciseNumber={5} />
              <DashboardWidgetDemo widgetName="Market Intelligence" exerciseNumber={6} />
              <DashboardWidgetDemo widgetName="Predictive Alerts" exerciseNumber={8} />
            </div>
          </section>

          {/* Getting Started */}
          <section className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to Continue Building?</h3>
            <p className="text-blue-800 mb-4">
              The customer management foundation is complete! Continue with the workshop exercises to build domain health monitoring and predictive features.
            </p>
            <div className="text-sm text-blue-700">
              <p className="mb-1"><strong>Completed:</strong> Customer CRUD operations with advanced UI</p>
              <p className="mb-1"><strong>Next:</strong> Exercise 5 - Domain Health monitoring widget</p>
              <p className="text-xs text-blue-600">💡 Tip: Use the &ldquo;Launch Customer Manager&rdquo; button above to explore the full interface!</p>
            </div>
          </section>
        </div>
      </div>
    </ToastProvider>
  );
}
