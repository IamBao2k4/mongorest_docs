# Toán Tử Văn Bản

## Tổng Quan
Toán tử văn bản cung cấp chức năng so khớp mẫu và biểu thức chính quy cho các truy vấn MongoDB. Các toán tử này hỗ trợ tìm kiếm phân biệt và không phân biệt chữ hoa chữ thường bằng ký tự đại diện và mẫu regex.

## Các Toán Tử Có Sẵn

### Toán Tử Like (`like`)
So khớp mẫu phân biệt chữ hoa chữ thường sử dụng ký tự đại diện.

```typescript
// So khớp mẫu cơ bản
name.like.John*        // Khớp với: "John", "Johnny", "Johnson", v.v.
email.like.*@gmail.com // Khớp với: "user@gmail.com", "test@gmail.com", v.v.
```

### Toán Tử ILike (`ilike`)
So khớp mẫu không phân biệt chữ hoa chữ thường sử dụng ký tự đại diện.

```typescript
// So khớp không phân biệt chữ hoa chữ thường
title.ilike.*book*    // Khớp với: "Handbook", "BOOKS", "notebook", v.v.
code.ilike.ABC*       // Khớp với: "ABC123", "abc", "ABCDEF", v.v.
```

### Toán Tử Match (`match`)
So khớp biểu thức chính quy phân biệt chữ hoa chữ thường.

```typescript
// So khớp biểu thức chính quy
description.match.^urgent    // Khớp với chuỗi bắt đầu bằng "urgent"
tag.match.[A-Z]{3}          // Khớp với đúng 3 chữ cái in hoa
```

### Toán Tử IMatch (`imatch`)
So khớp biểu thức chính quy không phân biệt chữ hoa chữ thường.

```typescript
// So khớp regex không phân biệt chữ hoa chữ thường
name.imatch.^(john|jane)    // Khớp với: "John", "JANE", "jane", v.v.
status.imatch.(active|pending) // Khớp với "active" hoặc "pending" ở mọi kiểu chữ
```

## Cú Pháp Ký Tự Đại Diện

Cho toán tử `like` và `ilike`:
- `*` - Khớp với bất kỳ chuỗi ký tự nào
- Các ký tự đặc biệt được tự động escape

Ví dụ:
```typescript
// Ví dụ về so khớp mẫu
title.like.The*        // Khớp với tiêu đề bắt đầu bằng "The"
name.like.*son         // Khớp với tên kết thúc bằng "son"
code.like.ABC*123      // Khớp với mã bắt đầu bằng "ABC" và kết thúc bằng "123"
```

## Hỗ Trợ Biểu Thức Chính Quy

Cho toán tử `match` và `imatch`:
- Hỗ trợ đầy đủ cú pháp regex của MongoDB
- Không tự động escape ký tự đặc biệt
- Phân biệt chữ hoa chữ thường được điều khiển bởi lựa chọn toán tử

## Tương Đương MongoDB

| Toán Tử REST | Tương Đương MongoDB |
|--------------|-------------------|
| like         | { $regex: pattern } |
| ilike        | { $regex: pattern, $options: 'i' } |
| match        | { $regex: pattern } |
| imatch       | { $regex: pattern, $options: 'i' } |

## Tích Hợp với Toán Tử Logic

```typescript
// Kết hợp với OR
or=(
  name.like.John*,
  name.like.Jane*
)

// Kết hợp với AND
and=(
  title.ilike.*book*,
  status.match.^(active|pending)
)
```

## Lưu Ý Bảo Mật

- Các ký tự đặc biệt được tự động escape cho toán tử `like`/`ilike`
- Biểu thức chính quy nên được sử dụng cẩn thận để tránh vấn đề hiệu suất
- Nên xem xét sử dụng chỉ mục cho các trường văn bản được tìm kiếm thường xuyên