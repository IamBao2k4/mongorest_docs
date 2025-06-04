# Bộ Phân Tích Truy Vấn MongoDB REST

...phần hiện có cho OrderParser và LogicalParser...

## Bộ Phân Tích Bộ Lọc

Xử lý chuyển đổi biểu thức lọc kiểu PostgREST thành điều kiện truy vấn MongoDB.

### Cách Sử Dụng

```typescript
const parser = new FilterParser();
const filter = parser.parseFilter("age", "lt.18");
const query = parser.convertFilter(filter);
// Kết quả: { age: { $lt: 18 } }
```

### Các Toán Tử Được Hỗ Trợ

#### Toán Tử So Sánh
- `eq` - Bằng
- `neq` - Không bằng
- `gt` - Lớn hơn
- `gte` - Lớn hơn hoặc bằng
- `lt` - Nhỏ hơn
- `lte` - Nhỏ hơn hoặc bằng

```
age.eq.25         // { age: { $eq: 25 } }
price.gt.100      // { price: { $gt: 100 } }
```

#### Toán Tử Văn Bản
- `like` - So khớp mẫu (phân biệt chữ hoa chữ thường)
- `ilike` - So khớp mẫu (không phân biệt chữ hoa chữ thường)
- `match` - So khớp biểu thức chính quy
- `imatch` - So khớp biểu thức chính quy không phân biệt chữ hoa chữ thường

```
name.like.John%   // { name: /^John.*/ }
email.ilike.%gmail.com  // { email: /.*gmail\.com$/i }
```

#### Toán Tử Mảng
- `in` - Giá trị trong mảng
- `contains` - Mảng chứa giá trị
- `contained` - Mảng được chứa trong
- `overlap` - Các mảng có phần tử chung

```
status.in.(active,pending)   // { status: { $in: ['active', 'pending'] } }
tags.contains.urgent        // { tags: 'urgent' }
```

#### Toán Tử Null
- `is` - Là null/không phải null
- `isdistinct` - Khác biệt/không khác biệt

```
email.is.null     // { email: null }
name.isdistinct   // { name: { $ne: null } }
```

### Bổ Ngữ

Hỗ trợ bổ ngữ `any` và `all` cho các phép toán mảng:

```
tags.like(any).(urgent,important)  // Khớp với bất kỳ thẻ nào
status.in(all).(draft,review)      // Khớp với tất cả trạng thái
```

### Cú Pháp Bộ Lọc

Định dạng cơ bản: `trường.toán_tử.giá_trị`

Ví dụ:
```
age.gt.21
name.like.John%
tags.contains.urgent
status.in.(active,pending)
```

### Chuyển Đổi Kiểu

Bộ phân tích tự động xử lý chuyển đổi kiểu cho:
- Số
- Boolean
- Giá trị null
- Mảng
- Biểu thức chính quy

### Xử Lý Lỗi

```typescript
// Ném lỗi cho các toán tử không xác định
parser.convertFilter({ field: "age", operator: "invalid", value: "25" });
// Lỗi: Toán tử không xác định: invalid
```

### Tích Hợp với Phép Toán Logic

Các bộ lọc có thể được kết hợp với các toán tử logic:

```
and=(age.gt.21,status.eq.active)
or=(category.in.(A,B),price.lt.100)
```