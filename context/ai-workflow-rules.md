# AI Workflow Rules

## Prompting Strategy
1. **Be specific** — include exact file paths, component names, and expected behavior
2. **Provide context** — reference existing schema, types, or components when building new features
3. **Iterate in small chunks** — one feature at a time, test before moving on
4. **Use the context files** — reference `architecture-context.md` for data flow, `ui-context.md` for design system

## AI-Assisted Coding Workflow

### Phase 1: Foundation (Manual)
- Initialize project with `shadcn/ui` template
- Configure Clerk middleware and Convex client
- Define database schema in `convex/schema.ts`
- Set up environment variables
- Run initial build to verify setup

### Phase 2: Feature Development (AI-Assisted)
- Describe the feature in natural language
- Reference existing schema/components
- Let AI generate the implementation
- Review and refine the generated code
- Test the feature end-to-end

### Phase 3: Polish (Mixed)
- Use AI for refactoring and optimization
- Add error handling and edge cases
- Improve UI/UX with AI suggestions
- Write tests for critical paths

## Code Generation Rules
- Generate complete, working code — no placeholders or TODOs
- Use existing types and utilities — don't reinvent
- Follow the project's naming conventions
- Add JSDoc comments for complex functions
- Include error handling by default

## Review Checklist
Before accepting AI-generated code:
- [ ] TypeScript compiles without errors
- [ ] No hardcoded values that should be env vars
- [ ] Proper error handling included
- [ ] Follows existing code patterns
- [ ] No unnecessary dependencies added
- [ ] Responsive design considered
- [ ] Accessibility (a11y) basics covered