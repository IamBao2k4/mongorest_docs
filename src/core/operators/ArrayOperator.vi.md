# Toán Tử Truy Vấn MongoDB REST

## Toán Tử Mảng

Các toán tử mảng cung cấp chức năng để truy vấn các trường mảng trong tài liệu MongoDB.

### Các Toán Tử Có Sẵn

#### Toán Tử In (`in`)
Khớp với bất kỳ giá trị nào tồn tại trong mảng được chỉ định.

```typescript
// Cách sử dụng: trường.in.(giá_trị1,giá_trị2,...)
tags.in.(red,blue,green)  
// MongoDB: { tags: { $in: ['red', 'blue', 'green'] } }
```

#### Toán Tử Chứa (`cs`)
Khớp với các mảng chứa tất cả các giá trị được chỉ định.

```typescript
// Cách sử dụng: trường.cs.(giá_trị1,giá_trị2,...)
categories.cs.(electronics,gaming)
// MongoDB: { categories: { $all: ['electronics', 'gaming'] } }
```

#### Toán Tử Được Chứa Trong (`cd`)
Khớp với các mảng hoàn toàn nằm trong các giá trị được chỉ định.

```typescript
// Cách sử dụng: trường.cd.(giá_trị1,giá_trị2,...)
permissions.cd.(read,write,delete)
// MongoDB: { permissions: { $in: ['read', 'write', 'delete'] } }
```

#### Toán Tử Giao Nhau (`ov`)
Khớp với các mảng có ít nhất một phần tử chung với các giá trị được chỉ định.

```typescript
// Cách sử dụng: trường.ov.(giá_trị1,giá_trị2,...)
interests.ov.(sports,music)
// MongoDB: { interests: { $elemMatch: { $in: ['sports', 'music'] } } }
```

### Định Dạng Giá Trị

Các giá trị mảng nên được cung cấp trong danh sách được phân tách bằng dấu phẩy và được bao quanh bởi dấu ngoặc đơn:

```
(giá_trị1,giá_trị2,giá_trị3)
```

### Ví Dụ

```typescript
// Tìm tài liệu có thẻ 'urgent' hoặc 'important'
tags.in.(urgent,important)

// Tìm tài liệu chứa tất cả danh mục được chỉ định
categories.cs.(books,fiction)

// Tìm tài liệu có quyền là tập con của các giá trị cho phép
permissions.cd.(read,write,admin)

// Tìm tài liệu có sở thích trùng với các giá trị đã cho
interests.ov.(sports,music,art)
```

### Chuyển Đổi Kiểu Dữ Liệu

- Giá trị chuỗi được giữ nguyên dạng chuỗi
- Giá trị số được chuyển thành số
- Giá trị boolean (`true`, `false`) được chuyển thành boolean
- `null` được giữ nguyên là null

### Tích Hợp với Toán Tử Logic

Các toán tử mảng có thể được kết hợp với các toán tử logic:

```typescript
// Khớp tài liệu thỏa mãn một trong hai điều kiện thẻ
or=(tags.in.(urgent),tags.cs.(important,critical))

// Khớp tài liệu thỏa mãn cả hai điều kiện
and=(categories.cs.(books),permissions.cd.(read,write))
```