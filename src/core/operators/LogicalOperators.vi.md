# Toán Tử Logic

## Toán Tử Phủ Định

Toán tử Phủ định cung cấp chức năng phủ định logic cho các truy vấn MongoDB. Nó đảo ngược kết quả của một toán tử khác.

### Cách Sử Dụng

Toán tử Phủ định (`not`) yêu cầu một toán tử bên trong để phủ định kết quả của nó.

```typescript
// Sử dụng cơ bản
status.not.eq.active    // { status: { $not: { $eq: "active" } } }

// Với toán tử so sánh
age.not.gt.18          // { age: { $not: { $gt: 18 } } }

// Với so khớp mẫu
name.not.like.John%    // { name: { $not: /^John.*/ } }
```

### Cú Pháp

```
trường.not.toán_tử.giá_trị
```

Trong đó:
- `trường`: Trường cần truy vấn
- `not`: Toán tử phủ định
- `toán_tử`: Toán tử bên trong cần phủ định
- `giá_trị`: Giá trị để so sánh

### Tương Đương MongoDB

Toán tử được chuyển đổi thành toán tử `$not` của MongoDB:

```javascript
{ trường: { $not: truyVấnBênTrong } }
```

### Ví Dụ

```typescript
// Phủ định so sánh bằng
email.not.eq.test@example.com

// Phủ định so khớp mẫu
description.not.like.%test%

// Phủ định so sánh
price.not.lt.100

// Phủ định chứa mảng
tags.not.in.(draft,review)
```

### Xử Lý Lỗi

Toán tử Phủ định yêu cầu một toán tử bên trong. Sử dụng nó mà không có toán tử bên trong sẽ gây ra lỗi:

```typescript
// Điều này sẽ gây ra lỗi
status.not.active  // Lỗi: Toán tử Phủ định yêu cầu một toán tử bên trong
```

### Tích Hợp với Các Toán Tử Khác

Toán tử Phủ định có thể được kết hợp với các toán tử logic khác:

```typescript
// Biểu thức logic phức tạp
or=(
  status.not.eq.active,
  age.not.lt.18
)

and=(
  category.not.in.(draft,deleted),
  date.not.lt.2024-01-01
)
```