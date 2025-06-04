# Toán Tử So Sánh

## Tổng Quan

Toán tử so sánh cung cấp chức năng để so sánh giá trị trong các truy vấn MongoDB. Các toán tử này là một phần của hệ thống phân tích truy vấn và xử lý các phép so sánh khác nhau.

## Các Toán Tử Có Sẵn

### Toán Tử Bằng (`eq`)
Khớp với các giá trị bằng với giá trị được chỉ định.

```typescript
name.eq.John      // { name: "John" }
age.eq.25         // { age: 25 }
```

### Toán Tử Không Bằng (`neq`)
Khớp với các giá trị không bằng với giá trị được chỉ định.

```typescript
status.neq.pending    // { status: { $ne: "pending" } }
count.neq.0          // { count: { $ne: 0 } }
```

### Toán Tử Lớn Hơn (`gt`)
Khớp với các giá trị lớn hơn giá trị được chỉ định.

```typescript
age.gt.18        // { age: { $gt: 18 } }
price.gt.100     // { price: { $gt: 100 } }
```

### Toán Tử Lớn Hơn Hoặc Bằng (`gte`)
Khớp với các giá trị lớn hơn hoặc bằng giá trị được chỉ định.

```typescript
score.gte.90     // { score: { $gte: 90 } }
date.gte.2024-01-01  // { date: { $gte: "2024-01-01" } }
```

### Toán Tử Nhỏ Hơn (`lt`)
Khớp với các giá trị nhỏ hơn giá trị được chỉ định.

```typescript
age.lt.21        // { age: { $lt: 21 } }
price.lt.50      // { price: { $lt: 50 } }
```

### Toán Tử Nhỏ Hơn Hoặc Bằng (`lte`)
Khớp với các giá trị nhỏ hơn hoặc bằng giá trị được chỉ định.

```typescript
quantity.lte.100  // { quantity: { $lte: 100 } }
weight.lte.50.5   // { weight: { $lte: 50.5 } }
```

## Xử Lý Kiểu Dữ Liệu

Tất cả các toán tử so sánh tự động xử lý chuyển đổi kiểu cho:
- Số
- Chuỗi
- Boolean
- Ngày tháng
- Giá trị Null

## Sử Dụng với Toán Tử Logic

Các toán tử so sánh có thể kết hợp với toán tử logic cho các truy vấn phức tạp:

```typescript
// Khớp tuổi từ 18 đến 30
and=(age.gte.18,age.lte.30)

// Khớp giá nhỏ hơn 50 hoặc lớn hơn 100
or=(price.lt.50,price.gt.100)
```

## Tương Đương MongoDB

| Toán Tử REST | Toán Tử MongoDB |
|--------------|-----------------|
| eq           | $eq            |
| neq          | $ne            |
| gt           | $gt            |
| gte          | $gte           |
| lt           | $lt            |
| lte          | $lte           |

## Ví Dụ

```typescript
// So sánh cơ bản
age.eq.25
price.gt.100
date.lte.2024-01-01

// Với chuyển đổi kiểu
active.eq.true
count.neq.null

// So sánh số
score.gte.90
quantity.lt.5
```