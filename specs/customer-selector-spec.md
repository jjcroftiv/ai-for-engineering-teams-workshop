# Spec Template for Workshop

Copy this template for all workshop exercises:

## Feature: CustomerSelector Component

### Context
- Main customer selection interface for the Customer Intelligence Dashboard
- Container component that manages customer display, search, and selection state
- Used by customer success managers and support teams who need to quickly identify and select customers from a large dataset
- Serves as the primary navigation component for accessing individual customer details and health monitoring
- Critical component that handles 100+ customers efficiently while maintaining responsive performance

### Requirements
- **Functional requirements:**
  - Display multiple CustomerCard components in a clean, organized layout
  - Implement search/filter functionality for customers by name or company
  - Provide visual selection state with clear highlighting of the selected customer
  - Persist customer selection across page interactions and component re-renders
  - Handle loading states during search operations
  - Support keyboard navigation for accessibility
- **User interface requirements:**
  - Responsive grid layout that adapts to screen sizes (1 column mobile, 2-3 columns tablet, 3-4 columns desktop)
  - Search input field with clear placeholder text and search icon
  - Selected customer visual feedback with border highlighting or background color change
  - Smooth transitions for search filtering and selection states
  - Loading skeleton or spinner during data operations
- **Data requirements:**
  - Consume Customer data from `src/data/mock-customers.ts`
  - Support real-time search filtering without API calls (client-side filtering)
  - Maintain selected customer state using React state management
  - Handle empty search results with appropriate messaging
- **Integration requirements:**
  - Integrate seamlessly with existing CustomerCard components
  - Provide callback mechanism for parent components to respond to customer selection
  - Support future integration with API endpoints for customer data fetching
  - Prepare for state management integration (Context API or external state store)

### Constraints
- Technical stack and frameworks (Next.js 15, React 19, TypeScript, Tailwind CSS)
- Performance requirements: Must render 100+ customers without performance degradation, implement virtualization if necessary
- Design constraints: Responsive breakpoints at 640px (mobile), 768px (tablet), 1024px (desktop), maintain consistent spacing with existing page layout
- File structure: Component should be placed in `src/components/` directory with CustomerSelector.tsx naming
- Props interface must include callback for customer selection and optional initial selected customer
- TypeScript definitions must be strictly typed for Customer objects and selection callbacks
- Security considerations: Sanitize search input to prevent XSS, validate customer data before rendering

### Acceptance Criteria
- [ ] Displays all customers using CustomerCard components in responsive grid layout
- [ ] Search functionality filters customers by name and company in real-time
- [ ] Selected customer is visually highlighted with clear indication
- [ ] Customer selection state persists during search operations and page interactions
- [ ] Handles empty search results with appropriate user feedback
- [ ] Responsive design works correctly on mobile, tablet, and desktop breakpoints
- [ ] Keyboard navigation allows users to select customers without mouse interaction
- [ ] Loading states are handled gracefully during search operations
- [ ] Component integrates properly with existing page layout and CustomerCard components
- [ ] TypeScript interfaces are properly defined for all props and state
- [ ] Performance remains smooth with 100+ customers displayed
- [ ] Edge cases handled: no customers, invalid search terms, network errors (future API integration)