# Toán Tử Null

## Tổng Quan
Các toán tử để xử lý giá trị null, kiểm tra boolean và so sánh giá trị khác biệt trong các truy vấn MongoDB.

## Toán Tử Is (`is`)

Xử lý kiểm tra null và so sánh giá trị boolean.

### Cú Pháp
```
trường.is.giá_trị
```

### Các Giá Trị Hỗ Trợ
- `null` - Khớp với giá trị null
- `not_null` - Khớp với giá trị không phải null
- `true` - Khớp với giá trị boolean true
- `false` - Khớp với giá trị boolean false

### Ví Dụ
```typescript
// Kiểm tra Null
email.is.null        // { email: null }
email.is.not_null    // { email: { $ne: null } }

// Kiểm tra Boolean
active.is.true       // { active: true }
deleted.is.false     // { deleted: false }
```

## Toán Tử Khác Biệt (`isdistinct`)

Kiểm tra xem giá trị của một trường có khác với giá trị được chỉ định hay không.

### Cú Pháp
```
trường.isdistinct.giá_trị
```

### Ví Dụ
```typescript
// Kiểm tra giá trị khác biệt
status.isdistinct.pending    // { status: { $ne: "pending" } }
category.isdistinct.default  // { category: { $ne: "default" } }
```

## Tích Hợp với Toán Tử Logic

Các toán tử null có thể kết hợp với các toán tử logic:

```typescript
// Kết hợp với AND
and=(
  email.is.not_null,
  status.isdistinct.deleted
)

// Kết hợp với OR
or=(
  active.is.true,
  status.isdistinct.archived
)
```

## Tương Đương MongoDB

| Toán Tử REST  | Tương Đương MongoDB |
|---------------|-------------------|
| is.null       | { field: null }  |
| is.not_null   | { field: { $ne: null } } |
| is.true       | { field: true }  |
| is.false      | { field: false } |
| isdistinct    | { field: { $ne: value } } |