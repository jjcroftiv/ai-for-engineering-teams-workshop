# CLAUDE.md - AI for Engineering Teams Workshop

## Project Overview

This is the **AI for Engineering Teams Workshop** repository - a practical training environment where students build a **Customer Intelligence Dashboard** using spec-driven development with AI agents. The project demonstrates how to transform ideas into AI-ready specifications and implement them iteratively.

### Core Purpose
- Educational workshop teaching spec-driven development with AI
- Builds a Customer Intelligence Dashboard through progressive exercises 
- Focuses on methodology over just completing tasks
- Demonstrates production-ready AI-assisted development workflows

## Architecture & Tech Stack

### Frontend Framework
- **Next.js 15** with App Router (latest stable)
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling (@tailwindcss/postcss)
- Geist font family (Sans & Mono) from Google Fonts

### Development Environment
- **VS Code Dev Containers** (recommended setup)
- **Node.js LTS** (20.x via devcontainer)
- Pre-configured with Claude Code, GitHub Copilot, and Cline extensions
- Auto-forwarded port 3000 for development server

### Data Layer
- Mock customer data in `/src/data/mock-customers.ts`
- TypeScript interfaces for Customer, health scores, domains
- Future integration points for API Ninjas and real data sources

## Directory Structure

```
├── src/                          # Next.js application source
│   ├── app/                      # App Router (layout, page, globals.css)
│   └── data/                     # Mock data and future API integration
├── public/                       # Static assets (SVG icons)
├── exercises/                    # Workshop exercises (01-10)
├── requirements/                 # Feature requirements and specifications  
├── specs/                        # Generated AI specifications (student output)
├── templates/                    # Specification templates for AI prompts
├── .devcontainer/               # VS Code dev container configuration
└── [config files]              # Next.js, TypeScript, ESLint, PostCSS configs
```

### Key Directories Explained

**`/exercises/`**: 10 progressive workshop exercises from spec-writing to production dashboard
**`/requirements/`**: Business requirements that feed into AI specification generation
**`/specs/`**: Where students save AI-generated specifications during workshops
**`/templates/`**: Reusable specification template for consistent AI prompts
**`/src/app/`**: Standard Next.js App Router structure with progress tracking UI

## Development Commands

```bash
# Install dependencies  
npm install

# Start development server (auto-opens browser on port 3000)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Workshop Methodology

### Spec-Driven Development Process
1. **Write clear specifications** using `/templates/spec-template.md`
2. **Store generated specs** in `/specs/` directory
3. **Implement components** using specs as AI prompts
4. **Build iteratively** through guided exercises

### AI Integration Pattern
- Use `@templates/spec-template.md` for consistent specification structure
- Reference `@requirements/[feature].md` for business context
- Generate implementations with `@specs/[feature]-spec.md` and `@data/mock-customers.ts`
- Follow template structure: Context → Requirements → Constraints → Acceptance Criteria

## Component Architecture

### Current Implementation Status
The main page (`/src/app/page.tsx`) includes:
- **Progress tracking UI** showing workshop completion status
- **Dynamic component loading** with error boundaries
- **CustomerCard showcase area** (populated after Exercise 3)
- **Dashboard widget placeholders** for future exercises

### Data Model
```typescript
interface Customer {
  id: string;
  name: string;
  company: string;
  healthScore: number; // 0-100 with color coding
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[]; // For health monitoring
  createdAt?: string;
  updatedAt?: string;
}
```

### Component Strategy
- Health score color coding: Red (0-30), Yellow (31-70), Green (71-100)
- Responsive design with mobile-first approach
- Domain health monitoring integration points
- TypeScript-first development with strict type checking

## Exercise Progression

### Phase 1: Foundation (Exercises 1-3)
- **01**: Thinking in Specs - CustomerSelector specification
- **02a**: Accessibility considerations
- **02b**: Claude memory and context management  
- **02c**: Code quality standards
- **03**: First AI-generated CustomerCard component

### Phase 2: Integration (Exercises 4-7)
- **04**: CustomerSelector implementation and integration
- **05**: Incremental enhancement workflows
- **06**: Customer management integration
- **07**: Market intelligence composition patterns

### Phase 3: Production (Exercises 8-10)
- **08**: Health score calculator implementation
- **09**: Predictive alerts system
- **10**: Production-ready dashboard completion

## Development Best Practices

### Code Quality
- ESLint configured with Next.js and TypeScript rules
- Strict TypeScript configuration with path mapping (`@/*` → `./src/*`)
- Format on save enabled
- Manual extension updates for stability

### Code Quality Standards
- Use descriptive variable and function names (no abbreviations like `btn`, `usr`)
- Add TypeScript interfaces for all props and data structures
- Include JSDoc comments for complex functions
- Follow consistent naming conventions (camelCase for variables, PascalCase for components)
- Implement proper error boundaries and error handling
- Use meaningful commit messages and code comments

### React-Specific Quality Rules
- Prefer named exports over default exports for components
- Use custom hooks for reusable logic
- Implement proper loading and error states for async operations
- Add prop validation with TypeScript interfaces
- Use semantic JSX element names that describe purpose, not appearance

### Accessibility Standards (WCAG 2.1 AA)
- All interactive elements must be keyboard accessible
- Proper semantic HTML structure with heading hierarchy
- ARIA labels and descriptions for complex UI components
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Visible focus indicators for all interactive elements
- Alternative text for images and icons
- Screen reader friendly content structure

### AI Assistant Guidelines
- Always reference existing mock data in `/src/data/`
- Use specification templates for consistency
- Follow the established component patterns
- Implement responsive designs with Tailwind CSS
- Maintain TypeScript strict mode compliance

### Git Workflow
- Clean main branch (production-ready)
- Atomic commits with descriptive messages
- Progressive feature development through exercises
- Regular checkpoints after each exercise completion

## Quick Start for AI Assistants

1. **Understanding the codebase**: Read `/README.md` and examine `/src/app/page.tsx` for current status
2. **Component development**: Use `/templates/spec-template.md` with relevant `/requirements/*.md` files
3. **Data integration**: Reference `/src/data/mock-customers.ts` for Customer interface
4. **Implementation**: Follow Next.js 15 + React 19 + TypeScript + Tailwind CSS patterns
5. **Testing**: Run `npm run dev` and check `http://localhost:3000` for visual validation

## Common Patterns

### Specification Generation
```
Write a [ComponentName] spec using @templates/spec-template.md and @requirements/[component].md
```

### Component Implementation  
```
Implement [ComponentName] using @data/mock-customers.ts and @specs/[component]-spec.md
```

### Git Commits
```
git add -A && git commit -m "feat: implement [ComponentName] component"
```

This workshop emphasizes learning **methodology** over task completion - focus on understanding the spec-driven development process and AI-assisted workflows rather than rushing through exercises.

## Memory Notes

### Workshop Workflow
- Using @templates/spec-template.md stores generated specs in @specs/
- Workshop uses Next.js 15, React 19, TypeScript, and Tailwind CSS
