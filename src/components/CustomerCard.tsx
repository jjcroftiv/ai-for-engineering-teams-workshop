import { Customer } from '@/data/mock-customers';

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const getHealthScoreColor = (score: number): string => {
    if (score >= 0 && score <= 30) return 'bg-red-500';
    if (score >= 31 && score <= 70) return 'bg-yellow-500';
    if (score >= 71 && score <= 100) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getHealthScoreTextColor = (score: number): string => {
    if (score >= 0 && score <= 30) return 'text-red-700';
    if (score >= 31 && score <= 70) return 'text-yellow-700';
    if (score >= 71 && score <= 100) return 'text-green-700';
    return 'text-gray-600';
  };

  const formatDomains = (domains?: string[]): string => {
    if (!domains || domains.length === 0) return '';
    if (domains.length === 1) return domains[0];
    return `${domains[0]} (+${domains.length - 1} more)`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {customer.name}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {customer.company}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
          <div
            className={`w-3 h-3 rounded-full ${getHealthScoreColor(customer.healthScore)}`}
            title={`Health Score: ${customer.healthScore}`}
          />
          <span className={`text-sm font-medium ${getHealthScoreTextColor(customer.healthScore)}`}>
            {customer.healthScore}
          </span>
        </div>
      </div>

      {customer.domains && customer.domains.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {customer.domains.length === 1 ? 'Domain' : 'Domains'}
          </div>
          <div className="text-sm text-gray-700">
            {formatDomains(customer.domains)}
          </div>
        </div>
      )}
    </div>
  );
}