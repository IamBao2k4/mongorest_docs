# Tài Liệu JoinParser

## Tổng Quan

Lớp `JoinParser` xử lý việc phân tích và xử lý các biểu thức nhúng cho các mối quan hệ MongoDB. Nó chuyển đổi cú pháp nhúng kiểu REST thành các giai đoạn pipeline tổng hợp MongoDB.

## Cấu Trúc Lớp

```typescript
class JoinParser {
  private registry: RelationshipRegistry;
}
```

## Constructor

```typescript
constructor(registry: RelationshipRegistry)
```

Khởi tạo parser với một instance của registry quan hệ.

## Phương Thức

### parseEmbedExpression

```typescript
parseEmbedExpression(sourceTable: string, expression: string): EmbedRequest | null
```

Phân tích các biểu thức nhúng như `"posts(id,title,comments(id,content))"`.

#### Tham Số
- `sourceTable`: Tên collection nguồn
- `expression`: Chuỗi biểu thức nhúng

#### Giá Trị Trả Về
- Đối tượng `EmbedRequest` hoặc `null` nếu không hợp lệ

#### Cú Pháp Biểu Thức
```
tableName!joinHint(field1,field2,...)
```
- `tableName`: Tên bảng liên quan
- `joinHint`: Loại join tùy chọn (left/inner/right)
- `fields`: Danh sách trường phân cách bằng dấu phẩy

#### Ví Dụ
```typescript
// Nhúng cơ bản
"posts(id,title)"

// Với gợi ý join
"posts!inner(id,title)"

// Nhúng lồng nhau
"posts(id,title,comments(id,content))"
```

### generateLookupStages

```typescript
generateLookupStages(sourceTable: string, embedRequest: EmbedRequest): any[]
```

Tạo các giai đoạn pipeline tổng hợp MongoDB cho việc nhúng.

#### Tham Số
- `sourceTable`: Tên collection nguồn
- `embedRequest`: Đối tượng yêu cầu nhúng đã được phân tích

#### Giá Trị Trả Về
Mảng các giai đoạn tổng hợp MongoDB bao gồm:
- Giai đoạn `$lookup` cho việc join
- Giai đoạn `$unwind` cho quan hệ nhiều-một
- Giai đoạn `$addFields` cho định dạng kết quả

## Ví Dụ Sử Dụng

```typescript
const parser = new JoinParser(relationshipRegistry);

// Phân tích biểu thức nhúng
const embedRequest = parser.parseEmbedExpression(
  "users",
  "posts!inner(id,title)"
);

// Tạo các giai đoạn lookup
const stages = parser.generateLookupStages("users", embedRequest);
```