# Tài Liệu Toán Tử

## Toán Tử Cơ Sở (BaseOperator)

BaseOperator là một lớp trừu tượng làm nền tảng cho tất cả các toán tử truy vấn trong hệ thống. Nó cung cấp các chức năng chung để phân tích cú pháp và chuyển đổi giá trị truy vấn.

### Cấu Trúc Lớp

```typescript
abstract class BaseOperator {
    abstract readonly name: string;
    abstract convert(field: string, value: any): Record<string, any>;
}
```

### Thuộc Tính

- `name` (trừu tượng): Một chuỗi định danh cho toán tử.

### Phương Thức

#### `convert(field: string, value: any): Record<string, any>`
Phương thức trừu tượng phải được triển khai bởi các lớp con. Nó chuyển đổi trường và giá trị đầu vào thành đối tượng truy vấn MongoDB.

#### `protected parseValue(value: string): any`
Phương thức tiện ích để phân tích cú pháp chuỗi thành các kiểu dữ liệu phù hợp:
- Chuyển đổi "null" thành `null`
- Chuyển đổi "true"/"false" thành giá trị boolean
- Chuyển đổi chuỗi số thành số
- Giữ nguyên các chuỗi khác

Ví dụ:
```typescript
parseValue("null")     // trả về null
parseValue("true")     // trả về true
parseValue("123")      // trả về 123
parseValue("hello")    // trả về "hello"
```

#### `protected parseArray(value: string): any[]`
Phân tích cú pháp biểu diễn chuỗi của mảng theo định dạng kiểu PostgreSQL.

Hỗ trợ hai định dạng:
- Định dạng dấu ngoặc đơn: `(1,2,3)`
- Định dạng dấu ngoặc nhọn: `{1,2,3}`

Ví dụ:
```typescript
parseArray("(1,2,3)")   // trả về [1, 2, 3]
parseArray("{1,2,3}")   // trả về [1, 2, 3]
```

### Cách Sử Dụng

Lớp này được thiết kế để được kế thừa bởi các triển khai toán tử cụ thể. Ví dụ:

```typescript
class EqualsOperator extends BaseOperator {
    readonly name = "eq";
    
    convert(field: string, value: any): Record<string, any> {
        return { [field]: this.parseValue(value) };
    }
}
```