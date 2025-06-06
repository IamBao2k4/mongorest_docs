# RBAC Pattern Specification

*MongoREST Role-Based Access Control Pattern Definition - Version 1.0.0*

---

## 📋 Mục Lục

1. [Giới Thiệu](#giới-thiệu)
2. [Cú Pháp Cơ Bản](#cú-pháp-cơ-bản)
3. [Operators và Ký Tự Đặc Biệt](#operators-và-ký-tự-đặc-biệt)
4. [Truy Cập Array và Object](#truy-cập-array-và-object)
5. [Conditional Patterns](#conditional-patterns)
6. [Context và Ownership](#context-và-ownership)
7. [Advanced Patterns](#advanced-patterns)
8. [Validation Rules](#validation-rules)
9. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)

---

## 🎯 Giới Thiệu

RBAC Pattern Specification định nghĩa cú pháp để xác định quyền truy cập vào các trường dữ liệu trong MongoDB documents, bao gồm cả nested objects và arrays với độ sâu lên đến 4 tầng.

### Nguyên Tắc Thiết Kế
- **Đơn giản**: Cú pháp dễ hiểu và sử dụng
- **Linh hoạt**: Hỗ trợ các trường hợp phức tạp
- **An toàn**: Ngăn chặn truy cập trái phép
- **Hiệu quả**: Tối ưu hóa performance

---

## 📝 Cú Pháp Cơ Bản

### Truy Cập Trường Đơn Giản
```
fieldName
```
**Ví dụ**: `name`, `email`, `status`

### Truy Cập Nested Object
```
parentField.childField
```
**Ví dụ**: `profile.name`, `settings.theme`, `address.city`

### Truy Cập Sâu (4 tầng)
```
level1.level2.level3.level4
```
**Ví dụ**: `user.profile.address.coordinates.lat`

---

## 🔤 Operators và Ký Tự Đặc Biệt

### 1. Basic Operators

| Ký Tự | Tên | Chức Năng | Ví Dụ |
|-------|-----|-----------|-------|
| `.` | **Dot Notation** | Truy cập thuộc tính nested | `profile.name` |
| `*` | **Wildcard** | Tất cả fields hoặc elements | `profile.*` |
| `!` | **Negation** | Loại trừ field | `!password` |
| `?` | **Optional** | Field có thể có hoặc không | `profile.phone?` |

### 2. Array Access Operators

| Pattern | Chức Năng | Ví Dụ |
|---------|-----------|-------|
| `.*` | Tất cả elements trong array | `books.*` |
| `[n]` | Element tại vị trí n | `books[0]` |
| `[n:m]` | Elements từ vị trí n đến m | `books[0:2]` |
| `[*]` | Tương đương với `.*` | `books[*].title` |
| `[-n]` | Element từ cuối lên | `books[-1]` |

### 3. Special Characters

| Ký Tự | Chức Năng | Ví Dụ |
|-------|-----------|-------|
| `()` | Nhóm điều kiện | `(name \| email)` |
| `{}` | Chọn specific fields | `{name, age}` |
| `~` | Fuzzy matching | `~profile.*` |
| `^` | Bắt đầu với | `^admin.*` |
| `$` | Kết thúc với | `.*\.email$` |

---

## 📊 Truy Cập Array và Object

### Array của Primitive Values
```javascript
// RBAC Config
"attributes": ["tags", "skills", "medals"]

// Data
{
  "tags": ["javascript", "mongodb", "nodejs"],
  "skills": ["programming", "design"],
  "medals": ["gold", "silver"]
}

// Result: Toàn bộ arrays được truy cập
```

### Array của Objects
```javascript
// RBAC Config
"attributes": ["books.*.title", "books.*.author"]

// Data
{
  "books": [
    {"title": "Book 1", "author": "Author 1", "price": 20},
    {"title": "Book 2", "author": "Author 2", "price": 30}
  ]
}

// Result: Chỉ title và author được truy cập, price bị loại bỏ
```

### Deep Nested Arrays
```javascript
// RBAC Config
"attributes": ["orders.*.items.*.product.name"]

// Data
{
  "orders": [
    {
      "items": [
        {"product": {"name": "Product 1", "price": 100}},
        {"product": {"name": "Product 2", "price": 200}}
      ]
    }
  ]
}

// Result: Chỉ product names được truy cập
```

### Wildcard Patterns

#### Object Wildcard
```javascript
// Pattern: "profile.*"
// Kết quả: Tất cả fields trong profile object
{
  "profile": {
    "name": "John",      // ✅ Included
    "age": 30,           // ✅ Included  
    "email": "john@...", // ✅ Included
    "phone": "123..."    // ✅ Included
  }
}
```

#### Deep Wildcard
```javascript
// Pattern: "profile.**"
// Kết quả: Tất cả fields ở mọi level trong profile
{
  "profile": {
    "name": "John",
    "address": {
      "street": "123 Main St",     // ✅ Included
      "coordinates": {
        "lat": 10.123,             // ✅ Included
        "lng": 106.456             // ✅ Included
      }
    }
  }
}
```

---

## 🔀 Conditional Patterns

### AND Condition
```javascript
// Pattern: "profile.name & profile.age"
// Cả name và age phải được include
"attributes": ["profile.name", "profile.age"]
```

### Exclusion Patterns
```javascript
// Pattern: "profile.* & !profile.password"
// Tất cả profile fields trừ password
"attributes": ["profile.*", "!profile.password"]
```

## 👤 Context và Ownership

### Self Context
```javascript
// Pattern: "@self.orders.*"
// Chỉ orders của chính user đó
"attributes": ["@self.orders.*"]
```

### Owner Context
```javascript
// Pattern: "@owner.private.*"
// Chỉ owner mới truy cập được private data
"attributes": ["@owner.private.*"]
```

### Team Context
```javascript
// Pattern: "@team.projects.*"
// Dữ liệu của team
"attributes": ["@team.projects.*"]
```

### Public Context
```javascript
// Pattern: "@public.profile.*"
// Dữ liệu public cho mọi người
"attributes": ["@public.profile.*"]
```

### Admin Context
```javascript
// Pattern: "@admin.system.*"
// Chỉ admin mới truy cập được
"attributes": ["@admin.system.*"]
```

---

## 🚀 Advanced Patterns

### Type-Specific Access
```javascript
// Chỉ cho phép truy cập fields có type cụ thể
"attributes": [
  "profile.age:num",      // Chỉ nếu age là number
  "profile.name:str",     // Chỉ nếu name là string
  "isActive:bool",        // Chỉ nếu isActive là boolean
  "tags:arr",             // Chỉ nếu tags là array
  "settings:obj"          // Chỉ nếu settings là object
]
```

### Range Access
```javascript
// Truy cập theo range
"attributes": [
  "books[0:5].*",         // 5 books đầu
  "reviews[-10:].*",      // 10 reviews cuối
  "orders[1:3].items.*"   // Orders từ vị trí 1 đến 3
]
```

### Template Variables
```javascript
// Sử dụng biến động
"attributes": [
  "%%userId%%.profile.*",
  "teams.%%teamId%%.members.*"
]
```

### Namespace Patterns
```javascript
// Phân tách theo namespace
"attributes": [
  "user::profile.*",
  "admin::system.*",
  "public::content.*"
]
```

---

## ✅ Validation Rules

### Valid Patterns ✅
```javascript
"profile.name"                    // ✅ Basic nested
"books.*.title"                   // ✅ Array wildcard
"settings.*"                      // ✅ Object wildcard
"@self.orders.*"                  // ✅ Context pattern
"profile.address.coordinates.*"   // ✅ Deep nesting
"books[0:5].author.name"         // ✅ Array range
"(name | email)"                 // ✅ OR condition
"profile.* & !profile.password"  // ✅ Exclusion
```

### Invalid Patterns ❌
```javascript
".profile.name"           // ❌ Bắt đầu bằng dot
"profile."                // ❌ Kết thúc bằng dot
"books.**.title"          // ❌ Double wildcard giữa path
"@invalid.field"          // ❌ Context không hợp lệ
"profile..name"           // ❌ Double dots
"books.[].title"          // ❌ Empty brackets
```

### Operator Precedence (Thứ tự ưu tiên)
1. **Parentheses** `()` - Cao nhất
2. **Negation** `!`
3. **Array Access** `[]`
4. **Dot Notation** `.`
5. **Wildcards** `*`, `**`
6. **AND** `&`
7. **OR** `|` - Thấp nhất

---

## 🌟 Ví Dụ Thực Tế

### E-commerce Platform

#### Customer Role
```json
{
  "user_role": "customer",
  "attributes": [
    "_id",
    "profile.name",
    "profile.avatar",
    "orders.*.orderNumber",
    "orders.*.status",
    "orders.*.items.*.product.name",
    "orders.*.items.*.product.price",
    "reviews.*.rating",
    "reviews.*.comment",
    "@self.profile.*",
    "!profile.email",
    "!profile.phone"
  ]
}
```

#### Admin Role
```json
{
  "user_role": "admin",
  "attributes": ["*"]
}
```

#### Seller Role
```json
{
  "user_role": "seller",
  "attributes": [
    "_id",
    "profile.*",
    "@self.products.*",
    "@self.orders.*.customer.name",
    "@self.orders.*.items.*",
    "analytics.sales.*",
    "!analytics.competitors.*"
  ]
}
```

### Social Media Platform

#### Public User
```json
{
  "user_role": "user",
  "attributes": [
    "_id",
    "profile.name",
    "profile.avatar",
    "profile.bio",
    "posts.*.content",
    "posts.*.media.*.url",
    "posts.*.likes.count",
    "posts.*.comments[0:10].*",
    "@public.*",
    "!posts.*.analytics.*"
  ]
}
```

#### Moderator
```json
{
  "user_role": "moderator",
  "attributes": [
    "*",
    "posts.*.analytics.flagged",
    "users.*.reports.*",
    "content.*.moderation.*",
    "@admin.system.logs.*"
  ]
}
```

### Enterprise System

#### Employee
```json
{
  "user_role": "employee",
  "attributes": [
    "_id",
    "@self.profile.*",
    "@self.projects.*.name",
    "@self.projects.*.tasks.*",
    "@team.members.*.profile.{name, email}",
    "@team.projects.*.status",
    "company.departments.*.name",
    "!salary.*",
    "!performance.reviews.*"
  ]
}
```

#### HR Manager
```json
{
  "user_role": "hr_manager",
  "attributes": [
    "*",
    "employees.*.profile.*",
    "employees.*.salary.*",
    "employees.*.performance.*",
    "departments.*.budgets.*",
    "@admin.hr.*"
  ]
}
```

### Healthcare System

#### Patient
```json
{
  "user_role": "patient",
  "attributes": [
    "_id",
    "@self.profile.*",
    "@self.medical.appointments.*",
    "@self.medical.prescriptions.*.medication.name",
    "@self.medical.reports.*.summary",
    "doctors.*.profile.{name, speciality}",
    "!medical.reports.*.detailed.*",
    "!medical.history.sensitive.*"
  ]
}
```

#### Doctor
```json
{
  "user_role": "doctor",
  "attributes": [
    "_id",
    "patients.*.profile.{name, age, gender}",
    "patients.*.medical.history.*",
    "patients.*.medical.reports.*",
    "@assigned.patients.*",
    "hospital.departments.*.equipment.*",
    "!patients.*.financial.*",
    "!hospital.admin.*"
  ]
}
```

---

## 📚 Reserved Keywords

| Keyword | Ý Nghĩa | Sử Dụng |
|---------|---------|---------|
| `ALL` | Tất cả fields | `ALL` hoặc `*` |
| `NONE` | Không có field nào | `NONE` |
| `SELF` | Dữ liệu của chính mình | `SELF.*` |
| `PUBLIC` | Dữ liệu public | `PUBLIC.*` |
| `PRIVATE` | Dữ liệu private | `PRIVATE.*` |
| `SYSTEM` | Dữ liệu hệ thống | `SYSTEM.*` |
| `TEAM` | Dữ liệu team | `TEAM.*` |
| `ADMIN` | Quyền admin | `ADMIN.*` |

---

## 🔍 Pattern Matching Algorithm

### Bước 1: Parse Pattern
```javascript
// Input: "profile.address.coordinates.*"
// Output: ["profile", "address", "coordinates", "*"]
```

### Bước 2: Validate Syntax
```javascript
// Check for invalid characters, double dots, etc.
```

### Bước 3: Apply Context
```javascript
// Resolve @self, @team, etc. based on user context
```

### Bước 4: Match Against Data
```javascript
// Traverse object structure and apply patterns
```

### Bước 5: Filter Result
```javascript
// Return only allowed fields
```

---

## 🎯 Best Practices

### 1. Security First
- Luôn sử dụng whitelist approach (chỉ định rõ những gì được phép)
- Tránh overly permissive patterns như `*` trừ khi thực sự cần thiết
- Regular audit patterns để đảm bảo security compliance

### 2. Performance Optimization
- Sử dụng specific patterns thay vì wildcards khi có thể
- Đặt patterns phổ biến nhất ở đầu list
- Cache compiled patterns để tránh re-parsing

### 3. Maintainability
- Sử dụng descriptive comments trong config
- Group related patterns together
- Version control cho RBAC configs

### 4. Testing
- Test với real data structures
- Verify edge cases (empty arrays, null objects)
- Performance test với large datasets

---

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial specification
- Basic patterns support
- Array và object wildcards
- Context-aware patterns
- Conditional operators

### Planned Features
- **v1.1.0**: Advanced type checking
- **v1.2.0**: Dynamic patterns với runtime variables
- **v1.3.0**: Pattern inheritance và composition
- **v2.0.0**: GraphQL-style field selection

---

*© 2025 MongoREST Project - RBAC Pattern Specification*