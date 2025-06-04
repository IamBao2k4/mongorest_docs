# Tài Liệu Lớp Relationship

## Tổng Quan

Lớp `Relationship` là một lớp trừu tượng cơ sở đại diện cho các mối quan hệ giữa các collection MongoDB. Nó cung cấp chức năng cốt lõi để tạo điều kiện kết nối và các giai đoạn lookup cho pipeline tổng hợp MongoDB.

## Cách Sử Dụng

```typescript
const relationship = new CustomRelationship({
  name: "authorBooks",
  targetTable: "books",
  localField: "authorId",
  foreignField: "_id",
  type: "one-to-many"
});
```

## Cấu Trúc Lớp

```typescript
abstract class Relationship {
  protected definition: RelationshipDefinition;
  
  abstract generateJoinCondition(): JoinCondition;
  abstract generateLookupStage(embedRequest: EmbedRequest): any;
  abstract isMultiResult(): boolean;
}
```

## Thuộc Tính

### Thành Viên Protected
- `definition`: Đối tượng cấu hình quan hệ

### Getters
- `name`: Lấy tên quan hệ
- `targetTable`: Lấy tên collection đích
- `localField`: Lấy tên trường local
- `foreignField`: Lấy tên trường foreign
- `type`: Lấy loại quan hệ

## Phương Thức

### Phương Thức Trừu Tượng

#### `generateJoinCondition(): JoinCondition`
Phải được triển khai để tạo điều kiện kết nối MongoDB.

#### `generateLookupStage(embedRequest: EmbedRequest): any`
Phải được triển khai để tạo giai đoạn $lookup MongoDB.

#### `isMultiResult(): boolean`
Phải được triển khai để chỉ ra nếu quan hệ trả về nhiều kết quả.

### Phương Thức Cốt Lõi

#### `validate(): boolean`
Xác thực định nghĩa quan hệ có đầy đủ các trường bắt buộc:
```typescript
validate(): boolean
// Trả về true nếu có đầy đủ các trường bắt buộc
```

#### `protected getJoinType(embedRequest: EmbedRequest): "inner" | "left" | "right"`
Xác định loại join từ yêu cầu nhúng:
```typescript
getJoinType(embedRequest) // Trả về "inner", "left", hoặc "right"
```

#### `protected generateBasePipeline(embedRequest: EmbedRequest): any[]`
Tạo các giai đoạn pipeline tổng hợp MongoDB bao gồm:
- Lọc (`$match`)
- Sắp xếp (`$sort`)
- Phân trang (`$skip`, `$limit`) 
- Chiếu trường (`$project`)

## Ví Dụ Triển Khai

```typescript
class OneToManyRelationship extends Relationship {
  generateJoinCondition() {
    return {
      localField: this.localField,
      foreignField: this.foreignField
    };
  }

  generateLookupStage(embedRequest) {
    return {
      $lookup: {
        from: this.targetTable,
        ...this.generateJoinCondition()
      }
    };
  }

  isMultiResult() {
    return true;
  }
}
```