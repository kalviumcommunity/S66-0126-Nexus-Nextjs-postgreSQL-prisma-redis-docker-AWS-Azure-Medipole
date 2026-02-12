# Code Review Checklist

This checklist ensures consistent and thorough code reviews for all pull requests.

## 🎯 **Pre-Review Verification**

Before starting the review, verify that:

- [ ] PR has a clear, descriptive title
- [ ] PR description is complete and follows the template
- [ ] Related issue/ticket is linked
- [ ] All required checklist items are addressed
- [ ] Screenshots/evidence are provided when relevant

## 🔍 **Code Quality Review**

### TypeScript & Type Safety

- [ ] No `any` types unless absolutely necessary with justification
- [ ] Proper type definitions for props, state, and return values
- [ ] No implicit `any` (TypeScript strict mode compliance)
- [ ] Generic types used appropriately
- [ ] Union types and interfaces are well-defined

### Code Structure & Organization

- [ ] Component structure follows project conventions
- [ ] Proper separation of concerns (components, hooks, utilities)
- [ ] No overly complex functions (> 50 lines recommended max)
- [ ] Duplicated code has been extracted into reusable functions/components
- [ ] File organization follows established patterns

### Naming Conventions

- [ ] Variables, functions, and components use descriptive names
- [ ] Consistent naming patterns (camelCase, PascalCase, etc.)
- [ ] Boolean variables prefixed with `is`, `has`, `can`, etc.
- [ ] Constants use UPPER_SNAKE_CASE
- [ ] No abbreviated or unclear variable names

### Performance Considerations

- [ ] Proper use of `useMemo`, `useCallback` for expensive operations
- [ ] No unnecessary re-renders
- [ ] Efficient array/object operations
- [ ] Proper dependency arrays in hooks
- [ ] Bundle size impact is reasonable

## 🛡️ **Security Review**

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] Proper input validation and sanitization
- [ ] No XSS vulnerabilities (proper escaping of user input)
- [ ] CSRF protection implemented where needed
- [ ] Authentication/authorization checks are in place
- [ ] Error messages don't expose sensitive information
- [ ] Secure headers configured (if applicable)

## 🧪 **Testing Review**

- [ ] Adequate test coverage for new functionality
- [ ] Tests are meaningful and not just "code coverage chasing"
- [ ] Edge cases are tested
- [ ] Error scenarios are handled in tests
- [ ] Integration tests cover critical user flows
- [ ] Test names are descriptive and follow conventions

## 📱 **UI/UX Review**

- [ ] Responsive design works across different screen sizes
- [ ] Accessibility standards are followed (ARIA labels, semantic HTML)
- [ ] Color contrast meets WCAG guidelines
- [ ] Keyboard navigation works properly
- [ ] Loading states and error messages are user-friendly
- [ ] No layout shifts or visual glitches
- [ ] Consistent with design system and existing UI patterns

## 📚 **Documentation Review**

- [ ] Code comments explain complex logic or non-obvious decisions
- [ ] Public APIs are documented
- [ ] README updates included if functionality changes
- [ ] Inline documentation is clear and helpful
- [ ] Changelog updated for user-facing changes

## 🔧 **Technical Implementation Review**

### React/Next.js Specific

- [ ] Proper use of React hooks and lifecycle methods
- [ ] Server-side rendering considerations (getServerSideProps, etc.)
- [ ] Client-side only code properly handled with dynamic imports
- [ ] No direct DOM manipulation (using React's virtual DOM)
- [ ] Proper key props in lists

### State Management

- [ ] State management approach is appropriate for complexity
- [ ] No unnecessary state in components
- [ ] Proper lifting of state when needed
- [ ] Context API used appropriately (not overused)

### API Integration

- [ ] Proper error handling for API calls
- [ ] Loading states implemented
- [ ] Request caching strategies considered
- [ ] API response types are properly defined
- [ ] No sensitive data logged or exposed

## 🚀 **Deployment & Operations Review**

- [ ] Environment variables are properly used
- [ ] No hardcoded URLs or environment-specific values
- [ ] Build process completes successfully
- [ ] No console errors or warnings in production build
- [ ] Performance metrics are acceptable
- [ ] Rollback strategy is clear if needed

## 🤝 **Team Collaboration Review**

- [ ] Code is understandable by other team members
- [ ] Complex decisions are explained in comments or PR description
- [ ] Follows established team conventions and patterns
- [ ] Breaking changes are clearly communicated
- [ ] Migration path provided for breaking changes

## ✅ **Final Approval Checklist**

Before approving, ensure:

- [ ] All automated checks pass (lint, type-check, tests)
- [ ] Manual testing confirms functionality works as expected
- [ ] No outstanding questions or concerns
- [ ] Code meets project quality standards
- [ ] Ready for merge to target branch

## 📝 **Review Feedback Guidelines**

When providing feedback:

- ✅ **Use constructive language** - Focus on solutions, not problems
- ✅ **Be specific** - Point to exact lines and suggest alternatives
- ✅ **Explain the "why"** - Help authors understand reasoning
- ✅ **Balance nitpicks with major issues** - Use appropriate severity levels
- ✅ **Acknowledge good practices** - Positive reinforcement encourages quality

## 🚨 **Blocker Issues (Must be fixed before merge)**

Request changes if any of these are present:

- Security vulnerabilities
- Critical bugs or broken functionality
- Major performance regressions
- Type safety violations in strict mode
- Missing error handling for critical operations
- Hardcoded secrets or credentials

## ⚠️ **High Priority Issues (Should be addressed)**

Request changes for:

- Code that's difficult to understand or maintain
- Inconsistent naming or patterns
- Missing tests for new functionality
- Accessibility issues
- Performance concerns that impact user experience

## 💡 **Suggestions (Nice to have improvements)**

Comments for:

- Alternative approaches that might be better
- Code organization improvements
- Additional test cases
- Documentation enhancements
- Future refactoring opportunities

---

**Review completed by:** @reviewer-name  
**Review date:** YYYY-MM-DD  
**Time spent:** X minutes
