# Tài Liệu Bộ Phân Tích Select

Lớp `SelectParser` xử lý phân tích mệnh đề SELECT cho phép chiếu MongoDB.

## Tổng Quan

`SelectParser` có trách nhiệm chuyển đổi lựa chọn trường dựa trên chuỗi thành đối tượng chiếu MongoDB. Nó hỗ trợ nhiều định dạng lựa chọn bao gồm lựa chọn trường cơ bản, đặt bí danh và lựa chọn đường dẫn JSON.

## Cách Sử Dụng

```typescript
const parser = new SelectParser();
const projection = parser.parseSelect("fieldA,fieldB");
```

## Định Dạng Mệnh Đề Select

### Lựa Chọn Cơ Bản
Tên trường đơn giản phân tách bằng dấu phẩy:
```typescript
"firstName,age,email" → { firstName: 1, age: 1, email: 1 }
```

### Lựa Chọn Tất Cả Trường
Sử dụng dấu sao hoặc chuỗi rỗng:
```typescript
"*" → {}  // Trả về tất cả trường
"" → {}   // Trả về tất cả trường
```

### Đặt Bí Danh Trường
Sử dụng dấu hai chấm để phân tách bí danh và tên trường:
```typescript
"displayName:first_name" → { first_name: 1 }
```

### Hỗ Trợ Đường Dẫn JSON
Hỗ trợ ký hiệu đường dẫn JSON:
```typescript
"data->field" → { data: 1 }
```

## Tham Chiếu Phương Thức

### parseSelect(selectClause: string): Record<string, 1 | 0>

Tham số:
- `selectClause`: Chuỗi chứa các lựa chọn trường, phân tách bằng dấu phẩy

Trả về:
- Một đối tượng chiếu MongoDB trong đó mỗi trường được chọn được ánh xạ tới 1

Trường hợp đặc biệt:
- Trả về đối tượng rỗng `{}` khi selectClause rỗng hoặc "*"
- Xử lý bí danh trường bằng ký hiệu dấu hai chấm
- Loại bỏ toán tử đường dẫn JSON khỏi tên trường