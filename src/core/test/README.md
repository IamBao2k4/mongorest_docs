# MongoRest Core Test Suite

Comprehensive test suite for the MongoRest Core system using Jest and TypeScript.

## 📁 Test Structure

```
test/
├── 🧪 Unit Tests
│   ├── bootstrap.test.ts          # Core bootstrap system tests
│   ├── core.test.ts               # Main NewCore class tests
│   ├── query-converter.test.ts    # URL params to intermediate query conversion
│   ├── rbac-validator.test.ts     # Role-based access control tests
│   ├── adapter-registry.test.ts   # Database adapter management tests
│   ├── relationship-registry.test.ts # Relationship management tests
│   ├── types.test.ts              # Type definitions and validation tests
│   └── adapters/
│       └── mongodb-adapter.test.ts # MongoDB adapter specific tests
├── 🔗 Integration Tests
│   └── integration.test.ts        # End-to-end system integration tests
├── 🎭 Test Utilities
│   ├── mocks/
│   │   └── mockDatabaseAdapter.ts # Mock adapter for testing
│   ├── setup.ts                  # Global test setup and utilities
│   └── run-tests.ts              # Test runner script
├── ⚙️  Configuration
│   ├── jest.config.js            # Jest configuration
│   └── README.md                 # This file
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Advanced Commands

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration

# Run core tests with custom runner
npm run test:core

# Run core tests in watch mode
npm run test:core:watch

# Generate coverage report for core
npm run test:core:coverage
```

### Custom Test Runner

```bash
# Using the custom test runner directly
cd src/core
tsx test/run-tests.ts                # Run all tests
tsx test/run-tests.ts unit           # Run unit tests only
tsx test/run-tests.ts integration    # Run integration tests only
tsx test/run-tests.ts coverage       # Run with coverage
tsx test/run-tests.ts watch          # Run in watch mode
tsx test/run-tests.ts help           # Show help
```

## 📊 Coverage Reports

Coverage reports are generated in multiple formats:

- **HTML Report**: `src/core/coverage/lcov-report/index.html`
- **Console Output**: Displayed after test run
- **LCOV Format**: `src/core/coverage/lcov.info`

### Coverage Thresholds

The test suite enforces minimum coverage thresholds:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🧪 Test Categories

### Unit Tests

Individual component tests that focus on specific functionality:

- **Bootstrap Tests**: System initialization and configuration
- **Core Tests**: Main query processing pipeline
- **Query Converter Tests**: URL parameter parsing and conversion
- **RBAC Validator Tests**: Permission and access control
- **Adapter Registry Tests**: Database adapter management
- **Relationship Registry Tests**: Table relationship management
- **Types Tests**: TypeScript type definitions and interfaces
- **MongoDB Adapter Tests**: MongoDB-specific functionality

### Integration Tests

End-to-end tests that verify complete system functionality:

- **Query Pipeline**: Complete request → response flow
- **Adapter Integration**: Multi-adapter scenarios
- **RBAC Integration**: Permission enforcement
- **Relationship Enhancement**: Join processing
- **Error Handling**: Failure scenarios and recovery
- **Performance**: Load and concurrency testing

## 🎭 Test Utilities

### Mock Database Adapter

The `MockDatabaseAdapter` provides a complete test implementation:

```typescript
import { MockDatabaseAdapter } from './mocks/mockDatabaseAdapter';

const adapter = new MockDatabaseAdapter();

// Mock specific behaviors
adapter.mockValidationFailure([errors]);
adapter.mockExecutionFailure(new Error('Test error'));
adapter.mockConnectionFailure();
```

### Custom Matchers

The test suite includes custom Jest matchers:

```typescript
expect(query).toBeValidQuery();
expect(result).toBeValidResult();
```

### Global Test Utilities

Utility functions available in all tests:

```typescript
// Create mock objects
const date = global.testUtils.createMockDate('2023-01-01');
const query = global.testUtils.createMockQuery({ collection: 'users' });
const result = global.testUtils.createMockResult([{ id: 1 }]);
```

## ⚙️ Configuration

### Jest Configuration

Key configuration options in `jest.config.js`:

- **Test Pattern**: `**/test/**/*.test.ts`
- **Setup File**: `test/setup.ts`
- **Timeout**: 10 seconds
- **Coverage**: Enabled with HTML and LCOV reports
- **Environment**: Node.js

### Environment Variables

Test-specific environment variables:

```bash
NODE_ENV=test           # Automatically set during tests
QUIET_TESTS=true        # Suppress console output in tests
```

## 🔧 Development Guidelines

### Writing Tests

1. **Structure**: Follow AAA pattern (Arrange, Act, Assert)
2. **Naming**: Use descriptive test names
3. **Isolation**: Each test should be independent
4. **Cleanup**: Use `beforeEach`/`afterEach` for setup/teardown

Example test structure:

```typescript
describe('ComponentName', () => {
  let component: ComponentType;

  beforeEach(() => {
    // Arrange
    component = new ComponentType();
  });

  afterEach(() => {
    // Cleanup
    component.dispose();
  });

  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = component.methodName(input);
      
      // Assert
      expect(result).toBe('expected output');
    });

    it('should handle error case', () => {
      // Arrange & Act & Assert
      expect(() => component.methodName(null)).toThrow();
    });
  });
});
```

### Test Organization

- **Group related tests** using `describe` blocks
- **Use meaningful descriptions** for test suites and cases
- **Test both success and failure scenarios**
- **Include edge cases and boundary conditions**
- **Verify error messages and types**

### Mocking Guidelines

- **Mock external dependencies** (databases, APIs, file system)
- **Use Jest spies** for tracking function calls
- **Reset mocks** between tests
- **Verify mock interactions** when relevant

## 🚨 Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in Jest config
2. **Memory leaks**: Ensure proper cleanup in `afterEach`
3. **Module resolution**: Check TypeScript paths and Jest moduleNameMapper
4. **Coverage not updating**: Clear Jest cache with `jest --clearCache`

### Debug Mode

Run tests with debugging:

```bash
# Debug specific test file
npx jest --runInBand bootstrap.test.ts

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Logs and Output

Control test output verbosity:

```bash
# Verbose output
npm run test -- --verbose

# Silent mode (errors only)
npm run test -- --silent

# Show coverage details
npm run test:coverage -- --verbose
```

## 📈 Metrics and Quality

### Test Metrics

The test suite tracks:

- **Test Count**: Total number of test cases
- **Coverage Percentage**: Code covered by tests
- **Execution Time**: Test run duration
- **Success Rate**: Passing vs failing tests

### Quality Gates

Tests must pass these gates:

- ✅ All tests passing
- ✅ Coverage thresholds met
- ✅ No console errors/warnings
- ✅ TypeScript compilation successful
- ✅ Linting rules satisfied

### Continuous Integration

The test suite is designed for CI/CD integration:

```yaml
# Example GitHub Actions step
- name: Run Tests
  run: |
    npm run test:coverage
    npm run test:integration
```

## 🤝 Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Update existing tests** if behavior changes
3. **Maintain coverage** above thresholds
4. **Add integration tests** for new workflows
5. **Update documentation** as needed

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [MongoRest Core Architecture](../README.md)