# Cross-Collection RBAC Implementation

Cross-Collection RBAC extension cho MongoREST cho phép xử lý patterns phức tạp với relationships giữa các collections khác nhau.

## 🎯 Features

### ✅ Đã Implement
- **Cross-Collection Pattern Detection**: Tự động detect khi pattern reference đến collection khác
- **Schema-Based Validation**: Sử dụng existing SchemaLoader để validate field existence
- **Infinite Loop Prevention**: Max depth limiting và visited collection tracking
- **Granular Error Handling**: Skip chỉ problematic cross-collection parts
- **Array Data Processing**: Full support cho array of objects
- **Real-time Analysis**: Pattern analysis without caching (theo yêu cầu)
- **Fallback Mechanism**: Automatic fallback to standard processing khi có error

### 🔧 Core Components

1. **CrossCollectionSchemaResolver**: Interface với existing SchemaLoader
2. **PatternAnalyzer**: Real-time pattern analysis để detect cross-collection references
3. **CrossCollectionContextManager**: Manage processing context và prevent infinite loops
4. **CrossCollectionProcessor**: Main processor cho cross-collection patterns
5. **EnhancedRBACPatternHandler**: Extended handler với cross-collection support

## 📂 File Structure

```
src/core/rbac/
├── cross-collection-types.ts           # Type definitions
├── cross-collection-schema-resolver.ts  # Schema validation utilities
├── cross-collection-context-manager.ts # Context management
├── pattern-analyzer.ts                 # Pattern analysis logic
├── cross-collection-processor.ts       # Main processing logic
├── enhanced-rbac-pattern-handler.ts    # Enhanced handler
├── rbac-validator.ts                   # Updated với cross-collection functions
├── demo.ts                             # Demo và test examples
└── index.ts                            # Exports
```

## 🚀 Usage Examples

### Basic Cross-Collection Filtering

```typescript
import { filterArrayByRBACWithCrossCollection } from './rbac-validator';

const productsData = [
  {
    id: 1,
    name: "Product 1",
    price: 100,
    product_reviews: [
      { content: { text: "Great!" }, rating: 5 },
      { content: { text: "Good" }, rating: 4 }
    ]
  }
];

// Pattern với cross-collection reference
const result = filterArrayByRBACWithCrossCollection(
  "products",
  "read",
  jwtToken,
  productsData
);

// Expected result: Filtered data với chỉ allowed fields
```

### Pattern Analysis

```typescript
import { analyzePatterns } from './rbac-validator';

const patterns = [
  "name",
  "price",
  "product_reviews.content.text",        // Cross-collection
  "product_reviews.author.profile.name"  // Multi-level cross-collection
];

const analysis = analyzePatterns(patterns, "products");
console.log(analysis);
// {
//   hasIssues: false,
//   hasCrossCollection: true,
//   maxDepth: 2,
//   collections: ["product_reviews", "users"],
//   issues: []
// }
```

### Enhanced Validation

```typescript
import { validateRBACAccessWithCrossCollection } from './rbac-validator';

const validation = validateRBACAccessWithCrossCollection(
  "products",
  "read",
  jwtToken,
  productsData,
  ["name", "price", "product_reviews.content.text"]
);

console.log(validation);
// {
//   isValid: true,
//   allowedFields: ["name", "price", "product_reviews.content.text"],
//   deniedFields: [],
//   patterns: [...],
//   filteredData: [...]
// }
```

### Direct Handler Usage

```typescript
import { getEnhancedPatternHandler } from './rbac-validator';

const handler = getEnhancedPatternHandler();
const result = handler.processWithCollection(
  dataArray,
  patterns,
  userContext,
  "products"
);
```

## 🔍 Pattern Examples

### Simple Cross-Collection
```
"product_reviews.content.text"
  └── product_reviews: collection name
      └── content.text: fields trong product_reviews collection
```

### Multi-Level Cross-Collection
```
"product_reviews.author.profile.name"
  └── product_reviews: collection 1
      └── author: collection 2 reference
          └── profile.name: fields trong users collection
```

### Mixed Patterns
```
[
  "name",                                  // Normal field
  "price",                                 // Normal field
  "product_reviews.content.text",          // Cross-collection
  "product_reviews.rating",                // Cross-collection
  "category.name"                          // Cross-collection
]
```

## ⚡ Performance Features

### Infinite Loop Prevention
- **Max Depth Limiting**: Default 5 levels, configurable
- **Visited Collection Tracking**: Prevent circular references
- **Early Termination**: Stop processing khi detect issues

### Error Handling Strategy
- **Granular Skipping**: Skip chỉ problematic cross-collection parts
- **Fallback Processing**: Automatic fallback to standard RBAC
- **Comprehensive Logging**: Debug-friendly error messages

### Memory Optimization
- **No Caching**: Real-time analysis (theo requirement)
- **Efficient Schema Access**: Leverage existing SchemaLoader cache
- **Minimal Memory Footprint**: Clean processing contexts

## 🔧 Configuration

### Schema Requirements
Schemas phải được load vào SchemaLoader trước khi sử dụng cross-collection features.

### RBAC Configuration
Sử dụng existing `mongorestrbacjson.json` format. Cross-collection patterns được define như normal patterns.

### Debug Mode
```typescript
const handler = new EnhancedRBACPatternHandler(true); // Enable debug
```

## 🚨 Limitations & Considerations

### Current Limitations
1. **Max Depth**: Limited to 5 levels (configurable)
2. **Collection Existence**: Must exist trong SchemaLoader
3. **Permission Model**: Same permission model cho tất cả collections trong chain
4. **Data Structure**: Expects array of objects cho main input

### Best Practices
1. **Pattern Design**: Keep cross-collection patterns simple
2. **Performance**: Limit nested relationships depth
3. **Error Handling**: Always handle potential fallbacks
4. **Testing**: Test với various data structures

## 🧪 Testing

### Run Demos
```typescript
import { runAllDemos } from './demo';
runAllDemos();
```

### Test Scenarios
- Basic cross-collection filtering
- Multi-level relationships
- Error handling và fallbacks
- Performance với large datasets
- Pattern analysis accuracy

## 🔄 Integration với Existing Code

### Backward Compatibility
Tất cả existing RBAC functions vẫn hoạt động như cũ. Cross-collection features là addition, không breaking changes.

### Migration Guide
1. **Import Functions**: Import new functions từ rbac-validator
2. **Update Patterns**: Add cross-collection patterns vào RBAC config
3. **Test Thoroughly**: Validate với existing data
4. **Monitor Performance**: Check impact trên existing queries

## 🛠️ Troubleshooting

### Common Issues

**1. Collection Not Found**
```
Error: Collection 'product_reviews' not found
```
**Solution**: Ensure collection schema exists trong SchemaLoader

**2. Max Depth Exceeded**
```
Error: Max depth 5 reached
```
**Solution**: Reduce pattern complexity or increase maxDepth

**3. Circular Reference**
```
Error: Circular reference detected: product_reviews already visited
```
**Solution**: Check pattern logic for infinite loops

**4. Permission Denied**
```
Error: No permissions for collection: product_reviews
```
**Solution**: Add appropriate RBAC rules cho target collection

### Debug Tips
1. **Enable Debug Mode**: Set debug=true trong handler constructor
2. **Analyze Patterns**: Use `analyzePatterns()` để check pattern validity
3. **Check Logs**: Monitor console output cho detailed error info
4. **Test Incrementally**: Start với simple patterns, then add complexity

## 📝 Future Enhancements

### Planned Features
- **Caching Strategy**: Optional pattern analysis caching
- **Performance Metrics**: Built-in performance monitoring
- **Advanced Relationships**: Support cho more complex relationship types
- **Query Optimization**: Smart query planning cho cross-collection access

---

**Status**: ✅ **PRODUCTION READY**

Implementation hoàn thành và tested. Ready cho integration vào main MongoREST system.
