# Spec Template for Workshop

Copy this template for all workshop exercises:

## Feature: CustomerCard Component

### Context
- Individual customer display component for the Customer Intelligence Dashboard
- Used within CustomerSelector container component to provide at-a-glance customer information
- Serves as the foundation for domain health monitoring integration
- Primary users are customer success managers and support teams who need quick customer identification and health assessment

### Requirements
- **Functional requirements:**
  - Display customer name, company name, and health score
  - Show customer domains (websites) for health monitoring context
  - Display domain count when customer has multiple domains
  - Implement color-coded health indicator based on score ranges
- **User interface requirements:**
  - Clean, card-based visual design with domain information
  - Color-coded health indicators: Red (0-30), Yellow (31-70), Green (71-100)
  - Basic responsive design for mobile and desktop breakpoints
- **Data requirements:**
  - Consume mock data from `src/data/mock-customers.ts`
  - Support Customer interface with optional `domains` array of website URLs
  - Handle customers with single or multiple domains
- **Integration requirements:**
  - Integrate seamlessly within CustomerSelector container component
  - Prepare structure for future domain health monitoring features

### Constraints
- Technical stack and frameworks (Next.js 15, React 19, TypeScript, Tailwind CSS)
- Performance requirements (fast rendering for multiple cards in list view)
- Design constraints (responsive breakpoints, consistent card sizing)
- File structure: Component should be placed in `src/components/` directory
- Props interface must include Customer type with optional domains array
- TypeScript definitions must be strictly typed for all customer properties
- Security considerations: Sanitize any user-generated content in customer data

### Acceptance Criteria
- [ ] Displays customer name, company name, and health score correctly
- [ ] Shows color-coded health indicator (red/yellow/green) based on score ranges
- [ ] Renders customer domains with appropriate count display for multiple domains
- [ ] Responsive design works on mobile and desktop breakpoints
- [ ] Integrates properly within CustomerSelector component
- [ ] Uses TypeScript interface for Customer data structure
- [ ] Handles edge cases: missing domains, invalid health scores, long company names
- [ ] Component is reusable and follows established naming conventions