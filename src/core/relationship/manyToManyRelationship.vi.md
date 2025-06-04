# Tài Liệu ManyToManyRelationship

## Tổng Quan

Lớp `ManyToManyRelationship` triển khai quan hệ nhiều-nhiều trong MongoDB sử dụng bảng trung gian. Nó kế thừa lớp `Relationship` cơ sở để xử lý các mối quan hệ phức tạp giữa các collection thông qua một collection trung gian.

## Cấu Trúc Lớp

```typescript
class ManyToManyRelationship extends Relationship {
  private junctionConfig: JunctionConfig;
}
```

## Cấu Hình

### Cấu Hình Bảng Trung Gian
```typescript
{
  table: string;      // Tên bảng trung gian
  localKey: string;   // Trường trong bảng trung gian liên kết với nguồn
  foreignKey: string; // Trường trong bảng trung gian liên kết với đích
}
```

### Ví Dụ Cấu Hình
```typescript
const relationship = new ManyToManyRelationship({
  name: "categories",
  targetTable: "categories",
  localField: "_id",
  foreignField: "_id",
  type: "many-to-many",
  junction: {
    table: "product_categories",
    localKey: "product_id",
    foreignKey: "category_id"
  }
});
```

## Phương Thức

### generateJoinCondition
Trả về cấu hình join cho quan hệ:
```typescript
generateJoinCondition(): JoinCondition
// Trả về: { localField, foreignField, joinType: 'left' }
```

### generateLookupStage
Tạo các giai đoạn pipeline tổng hợp MongoDB cho join nhiều-nhiều:
```typescript
generateLookupStage(embedRequest: EmbedRequest): any[]
```

#### Các Giai Đoạn Được Tạo
1. Junction Lookup: Join nguồn với bảng trung gian
2. Target Lookup: Join kết quả trung gian với bảng đích
3. Dọn dẹp: Xóa các trường trung gian tạm thời

#### Ví Dụ Pipeline
```typescript
[
  {
    $lookup: {
      from: "product_categories",
      localField: "_id",
      foreignField: "product_id",
      as: "_junction"
    }
  },
  {
    $lookup: {
      from: "categories",
      localField: "_junction.category_id",
      foreignField: "_id",
      as: "categories"
    }
  },
  {
    $unset: "_junction"
  }
]
```

### isMultiResult
```typescript
isMultiResult(): boolean
// Luôn trả về true cho quan hệ nhiều-nhiều
```

## Ví Dụ Sử Dụng

```typescript
// Định nghĩa quan hệ
const productCategories = new ManyToManyRelationship({
  name: "categories",
  targetTable: "categories",
  localField: "_id",
  foreignField: "_id",
  type: "many-to-many",
  junction: {
    table: "product_categories",
    localKey: "product_id",
    foreignKey: "category_id"
  }
});

// Tạo các giai đoạn lookup
const stages = productCategories.generateLookupStage({
  table: "categories",
  fields: ["name", "description"]
});
```