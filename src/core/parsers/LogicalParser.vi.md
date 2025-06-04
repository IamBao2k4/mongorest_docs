Tài liệu này bao gồm hệ thống phân tích truy vấn cho MongoDB REST API, bao gồm phân tích Sắp xếp và các phép toán Logic.

## Bộ Phân Tích Sắp Xếp

Xử lý chuyển đổi tham số sắp xếp dạng chuỗi thành thông số sắp xếp MongoDB.

### Cách Sử Dụng

```typescript
const parser = new OrderParser();
const sortSpec = parser.parseOrder("age.desc,height.asc");
// Kết quả: { age: -1, height: 1 }
```

### Cú Pháp Sắp Xếp

- Định dạng: `tênTrường.hướng`
- Nhiều trường: Phân tách bằng dấu phẩy
- Hướng: `asc` (mặc định) hoặc `desc`

Ví dụ:
```
age.desc           // Sắp xếp tuổi giảm dần
name.asc           // Sắp xếp tên tăng dần
height             // Sắp xếp chiều cao tăng dần (mặc định)
age.desc,name.asc  // Sắp xếp theo tuổi giảm dần, sau đó theo tên tăng dần
```

## Bộ Phân Tích Logic

Xử lý các phép toán logic (VÀ, HOẶC, KHÔNG) cho lọc truy vấn.

### Cách Sử Dụng

```typescript
const parser = new LogicalParser();
const query = parser.parseLogical("or=(age.lt.18,age.gt.21)");
// Kết quả: { $or: [{ age: { $lt: 18 } }, { age: { $gt: 21 } }] }
```

### Các Phép Toán Logic

#### Phép HOẶC
```
or=(điều_kiện1,điều_kiện2)
```
Ví dụ:
```
or=(age.lt.18,age.gt.21)
```

#### Phép VÀ
```
and=(điều_kiện1,điều_kiện2)
```
Ví dụ:
```
and=(status.eq.active,age.gt.18)
```

#### Phép KHÔNG
```
not.điều_kiện
not.and=(điều_kiện1,điều_kiện2)
not.or=(điều_kiện1,điều_kiện2)
```
Ví dụ:
```
not.age.eq.25
not.and=(status.eq.active,age.lt.18)
```

### Điều Kiện Lồng Nhau

Bộ phân tích hỗ trợ các phép toán logic lồng nhau:

```
or=(age.lt.18,and=(status.eq.active,score.gt.90))
```

## Đầu Ra MongoDB

### Thông Số Sắp Xếp
- Tăng dần: `1`
- Giảm dần: `-1`

### Toán Tử Logic
- HOẶC: `$or`
- VÀ: `$and`
- KHÔNG: `$not`

## Giới Hạn

### Bộ Phân Tích Sắp Xếp
- Không hỗ trợ chỉ thị NULLS FIRST/LAST
- Không hỗ trợ sắp xếp trường lồng nhau
- Sắp xếp tăng dần mặc định

### Bộ Phân Tích Logic
- Biểu thức lồng nhau phức tạp cần được đặt trong ngoặc đúng cách
- Tên trường không thể chứa dấu chấm
- Giá trị được tự động chuyển đổi kiểu (chuỗi, số, boolean)