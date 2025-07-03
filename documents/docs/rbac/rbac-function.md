---
sidebar_position: 1
---

# Các Hàm RBAC

Tài liệu này mô tả các hàm có sẵn trong lớp `RbacValidator` cho các hoạt động Kiểm Soát Truy Cập Dựa Trên Vai Trò (RBAC).

## Tổng Quan

Lớp `RbacValidator` cung cấp chức năng RBAC toàn diện cho các collection MongoDB, bao gồm kiểm soát truy cập, lọc tính năng và phép chiếu dữ liệu dựa trên vai trò người dùng.

## Constructor

### `constructor()`

Khởi tạo validator RBAC và tải cấu hình từ file JSON.

```typescript
const rbacValidator = new RbacValidator();
```

## Các Phương Thức Cấu Hình

### `loadConfig(): RbacJson`

Tải cấu hình RBAC từ file JSON tại đường dẫn `../../schemas/rbac/mongorestrbacjson.json`.

**Trả về:** `RbacJson` - Cấu hình RBAC đã tải

```typescript
const config = rbacValidator.loadConfig();
```

### `updateConfig(config: RbacJson): void`

Cập nhật cấu hình RBAC hiện tại với một đối tượng cấu hình mới.

**Tham số:**
- `config: RbacJson` - Cấu hình RBAC mới

```typescript
rbacValidator.updateConfig(newConfig);
```

## Các Phương Thức Kiểm Soát Truy Cập

### `hasAccess(collection: string, action: string, userRoles: string[]): boolean`

Kiểm tra xem người dùng có quyền thực hiện một hành động cụ thể trên collection dựa trên vai trò của họ.

**Tham số:**
- `collection: string` - Tên của collection
- `action: string` - Hành động cần thực hiện ('create', 'read', 'write', 'delete')
- `userRoles: string[]` - Mảng các vai trò người dùng

**Trả về:** `boolean` - True nếu được cấp quyền truy cập, false nếu ngược lại

```typescript
const hasAccess = rbacValidator.hasAccess('users', 'read', ['admin', 'user']);
```

### `canCreate(userRoles: string[]): boolean` (Riêng tư)

Kiểm tra xem người dùng có thể tạo tài nguyên dựa trên quyền tạo toàn cục.

**Tham số:**
- `userRoles: string[]` - Mảng các vai trò người dùng

**Trả về:** `boolean` - True nếu được cấp quyền tạo

## Các Phương Thức Quản Lý Tính Năng

### `getRbacFeatures(collection: string, action: string, userRoles: string[], isRelate?: boolean, layer?: number, pre_fieldName?: string): string[]`

Lấy tất cả các tính năng (trường) có thể truy cập cho một collection dựa trên vai trò người dùng và hành động.

**Tham số:**
- `collection: string` - Tên collection
- `action: string` - Loại hành động ('read', 'write', 'delete')
- `userRoles: string[]` - Mảng các vai trò người dùng
- `isRelate?: boolean` - Có phải là trường relation không (mặc định: false)
- `layer?: number` - Giới hạn độ sâu đệ quy (mặc định: 1, tối đa: 2)
- `pre_fieldName?: string` - Tiền tố cho tên trường lồng nhau

**Trả về:** `string[]` - Mảng các tên trường có thể truy cập

```typescript
const features = rbacValidator.getRbacFeatures('users', 'read', ['admin']);
// Trả về: ['name', 'email', 'profile.avatar', 'profile.bio']
```

### `filterRbacFeatures(collection: string, action: string, userRoles: string[], features?: string[]): string[]`

Lọc các tính năng được yêu cầu theo quyền RBAC, chỉ trả về các trường có thể truy cập.

**Tham số:**
- `collection: string` - Tên collection
- `action: string` - Loại hành động
- `userRoles: string[]` - Mảng các vai trò người dùng
- `features?: string[]` - Các tính năng được yêu cầu (tùy chọn)

**Trả về:** `string[]` - Mảng các tính năng được phép

```typescript
const allowedFeatures = rbacValidator.filterRbacFeatures(
    'users', 
    'read', 
    ['user'], 
    ['name', 'email', 'password']
);
// Trả về: ['name', 'email'] (password có thể bị hạn chế)
```

## Các Phương Thức Xử Lý Dữ Liệu

### `objectize(features: string[]): Record<string, any>` (Riêng tư)

Chuyển đổi mảng phẳng các tên trường thành đối tượng phép chiếu lồng nhau cho truy vấn MongoDB.

**Tham số:**
- `features: string[]` - Mảng tên trường (hỗ trợ ký hiệu chấm)

**Trả về:** `Record<string, any>` - Đối tượng phép chiếu MongoDB

```typescript
// Ví dụ sử dụng nội bộ:
// Đầu vào: ['name', 'profile.avatar', 'profile.bio']
// Đầu ra: { name: 1, profile: { avatar: 1, bio: 1 } }
```

### `filterDataByProjection(data: any, projection: any): any` (Riêng tư)

Lọc đối tượng dữ liệu dựa trên phép chiếu, loại bỏ các trường không được phép.

**Tham số:**
- `data: any` - Đối tượng dữ liệu cần lọc
- `projection: any` - Đối tượng phép chiếu xác định các trường được phép

**Trả về:** `any` - Đối tượng dữ liệu đã lọc

### `filterBodyData(collection: string, action: string, roles: string[], data: any): any`

Phương thức chính để lọc dữ liệu yêu cầu/phản hồi dựa trên quyền RBAC.

**Tham số:**
- `collection: string` - Tên collection
- `action: string` - Loại hành động
- `roles: string[]` - Mảng các vai trò người dùng
- `data: any` - Đối tượng dữ liệu cần lọc

**Trả về:** `any` - Đối tượng dữ liệu đã lọc chỉ với các trường có thể truy cập

**Ném lỗi:** `RbacErrors.accessDenied` nếu người dùng không có quyền truy cập collection

```typescript
const filteredData = rbacValidator.filterBodyData(
    'users',
    'read',
    ['user'],
    { name: 'John', email: 'john@example.com', password: 'secret' }
);
// Trả về: { name: 'John', email: 'john@example.com' }
```

## Các Phương Thức Hỗ Trợ

### `hasUserRole(role: RbacRolePattern[], userRoles: string): boolean` (Riêng tư)

Kiểm tra xem một vai trò cụ thể có tồn tại trong mảng mẫu vai trò không.

**Tham số:**
- `role: RbacRolePattern[]` - Mảng các mẫu vai trò
- `userRoles: string` - Vai trò người dùng cần kiểm tra

**Trả về:** `boolean` - True nếu tìm thấy vai trò

## Xử Lý Lỗi

Validator ném các lỗi sau:

- `RbacErrors.collectionNotFound(collection)` - Khi không tìm thấy collection trong cấu hình RBAC
- `RbacErrors.accessDenied(action, collection, roles)` - Khi người dùng không có quyền cho hành động được yêu cầu

## Tính Năng Bảo Mật

1. **Bảo Vệ Nhiều Lớp**: Ngăn chặn đệ quy vô hạn với giới hạn độ sâu 2 lớp
2. **Lọc Nghiêm Ngặt**: Chỉ trả về các trường được phép rõ ràng
3. **Bảo Mật Dự Phòng**: Trả về trường tối thiểu `['_id']` khi không có tính năng nào có thể truy cập
4. **Xử Lý Quan Hệ**: Quản lý quyền đối tượng lồng nhau thông qua quan hệ

## Ví Dụ Sử Dụng

### Kiểm Tra Truy Cập Cơ Bản
```typescript
const validator = new RbacValidator();
const canRead = validator.hasAccess('posts', 'read', ['author', 'moderator']);
```

### Lấy Các Trường Dành Riêng Cho Người Dùng
```typescript
const allowedFields = validator.getRbacFeatures('users', 'read', ['admin']);
console.log(allowedFields); // ['_id', 'name', 'email', 'role', 'profile.bio']
```

### Lọc Phản Hồi API
```typescript
const rawUserData = {
    _id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    role: 'user'
};

const filteredData = validator.filterBodyData('users', 'read', ['user'], rawUserData);
// Trả về dữ liệu không có các trường nhạy cảm như password
```

## Lưu Ý Đặc Biệt

### Xử Lý Đệ Quy
- Phương thức `getRbacFeatures` có giới hạn độ sâu tối đa 2 lớp để tránh đệ quy vô hạn
- Khi xử lý collection tự tham chiếu, hệ thống sẽ tăng layer để kiểm soát độ sâu

### Tối Ưu Hóa Hiệu Suất
- Sử dụng `Set` để loại bỏ trùng lặp khi thu thập các tính năng
- Sắp xếp kết quả theo thứ tự alphabet để dễ đọc
- Loại bỏ các trường con khi trường cha đã được bao gồm

### Xử Lý Trường Hợp Đặc Biệt
- Nếu không có tính năng nào được phép, hệ thống trả về `['_id']` làm mặc định
- Hỗ trợ wildcard `'*'` trong danh sách features để lấy tất cả trường được phép
- Xử lý các trường quan hệ với collection khác một cách an toàn