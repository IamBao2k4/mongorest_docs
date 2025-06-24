# Đề xuất các nhóm chức năng chính cho MongoRest

Dưới đây là các nhóm tính năng (module) chính được đề xuất cho dự án MongoRest, cùng với mô tả ngắn gọn, ví dụ minh họa và thứ tự ưu tiên phản ánh mức độ quan trọng:

## 1. Tự động sinh RESTful API CRUD theo Collection (Ưu tiên cao nhất)

**Mô tả:** Tự động thiết lập các endpoint RESTful (Create, Read, Update, Delete) cho mỗi collection trong MongoDB. Hệ thống sẽ nội suy metadata của cơ sở dữ liệu để tạo route mặc định cho từng collection. Do MongoDB là schema-free (linh hoạt về cấu trúc dữ liệu), có thể tạo API mà không đòi hỏi định nghĩa trước về schema. Mỗi collection được coi như một resource chính.

### Các endpoint chính tự động:
- `GET /<collection>` – Lấy một/nhiều tài liệu (documents) từ collection
- `POST /<collection>` – Tạo mới một document trong collection (có thể để _id tự sinh)
- `PUT/PATCH /<collection>/{id}` – Cập nhật hoặc thay thế document với _id cho trước. PATCH dùng để cập nhật từng phần, PUT để thay thế toàn bộ document
- `DELETE /<collection>/{id}` – Xóa document với khóa chính tương ứng

### Chi tiết thực hiện:
Sử dụng driver MongoDB cho Node.js để thao tác dữ liệu. Khi gọi vào API thì MongoREST sẽ tự tìm kiếm collection đã nhập vào trước ở API, sau đó dịch param thành query và truyền xuống database để query.

Phản hồi sẽ là JSON document tương ứng (hoặc mã trạng thái 404 nếu không tìm thấy, 201 khi tạo thành công, v.v.). Hệ thống cũng sẽ chuyển đổi định dạng _id trong URL sang kiểu ObjectId của Mongo nếu phù hợp.

## 2. Bộ lọc truy vấn, Sắp xếp và Phân trang (Query Filtering, Sorting, Pagination)

**Mô tả:** Module này mở rộng các endpoint CRUD ở trên bằng cách hỗ trợ truyền tham số truy vấn để lọc dữ liệu, sắp xếp thứ tự kết quả và phân trang. Mục tiêu là tận dụng khả năng query linh hoạt của MongoDB để người dùng có thể lấy đúng dữ liệu họ cần thông qua API.

### Tính năng chính:

#### Lọc theo trường tùy ý:
Cho phép client chỉ định điều kiện lọc trong query string. Với những truy vấn đơn giản, có thể sử dụng cú pháp như `?field=value`. Đối với các toán tử phức tạp, dùng cú pháp mở rộng:
- `?age=gte.30&age=lte.50` - lấy các document có trường age từ 30 đến 50

#### Sắp xếp kết quả:
Hỗ trợ tham số `order` để sắp xếp:
- `?order=name` - sắp xếp tăng dần theo name
- `?order=-createdAt` - dấu `-` để sắp xếp giảm dần theo createdAt
- `?order=-age,name` - sắp xếp theo nhiều trường

#### Phân trang:
Hỗ trợ giới hạn số kết quả và bỏ qua kết quả:
- `?limit=20&skip=40` - trả tối đa 20 document, bỏ qua 40 document đầu tiên

#### Chọn trường trả về (Projection):
- `?select=name,email` - chỉ trả về các trường name và email

### Ví dụ minh họa:

```http
GET /users?age=gte.30&country=eq.VN&sort=-name&limit=10
```

Yêu cầu này sẽ trả về tối đa 10 người dùng thỏa mãn filter age ≥ 30 và country = "VN", sắp xếp theo tên giảm dần:

```json
[
  { "_id": "...", "name": "Nguyen Van B", "age": 45, "country": "VN" },
  { "_id": "...", "name": "Tran Thi A", "age": 32, "country": "VN" }
]
```

## 3. Xác thực dữ liệu và Định nghĩa Schema (Validation & Schema Definition)

**Mô tả:** Dù MongoDB cho phép schema linh hoạt, việc xác thực định dạng dữ liệu khi tạo/sửa rất quan trọng để duy trì tính nhất quán. Module này cung cấp khả năng khai báo schema cho từng collection và tự động kiểm tra dữ liệu đầu vào của API.

### Định nghĩa schema:
Cho phép nhà phát triển cung cấp JSON Schema mô tả cấu trúc của tài liệu:

```json
{
  "bsonType": "object",
  "required": ["name", "email"],
  "properties": {
    "name": { "bsonType": "string" },
    "email": { "bsonType": "string", "pattern": "^[^@]+@[^@]+$" }
  }
}
```

### Suy luận schema tự động:
Nếu không có schema do người dùng cung cấp, MongoRest có thể suy luận dạng schema cơ bản dựa trên dữ liệu hiện có.

### Tích hợp cơ chế validation:
Sử dụng JSON Schema với Fastify và thư viện Ajv để kiểm tra dữ liệu đầu vào cho các request POST/PUT/PATCH.

### Ví dụ minh họa:
Khi client gửi request với payload không hợp lệ:

```json
POST /users
{ "name": "Alice", "email": "not-an-email" }
```

API trả về:
```json
{
  "error": "Bad Request",
  "message": "body.email does not match format email"
}
```

## 4. Metadata API và Tài liệu hóa (Documentation & Metadata Endpoints)

**Mô tả:** Cung cấp các endpoint giúp người dùng khám phá cấu trúc API và metadata của database. Đồng thời, tự động sinh tài liệu API (OpenAPI/Swagger).

### Tính năng chính:

## 1. Query linh hoạt dựa trên param
**Mô tả:** Người dùng chỉ cần viết param dựa trên syntax mà thư viện định nghĩa, không cần viết query hay luồng phức tạp.

### Cơ chế query
**Param:** Người dùng viết api bao gồm param định nghĩa câu query cần thực hiện.
**RBAC Validator:** RBAC nằm trong MongoREST sẽ tạo ra các projection hoặc lọc các field có trong body dựa trên user role thông qua JWT.
**MongoREST Parser:** MongoREST sẽ chuyển param thành câu lệnh query.
**Database:** Thực hiện câu query và trả dữ liệu cho người dùng.

### Ví dụ minh họa

```json
GET /api/users?dbType=mongodb&skip=0&limit=200&select=product_reviews(verified=neq.true,status=eq.approved,products(categories()))&and=(status=eq.active)
```

#### Với user role là: user, RBAC config:
```json
{
"collection_name": "users",
    "rbac_config": {
        "read": [
            {
            "user_role": "default",
            "patterns": [
                {
                    "_id": { "type": "field" }
                },
                {
                    "name": { "type": "field" }
                },
                {
                    "profile.avatar": { "type": "field" }
                },
                {
                    "product_reviews": { 
                        "type": "relation", "relate_collection": "product_reviews" 
                    }
                }
            ]
            },
        ]
    }
}
```

#### Kết quả trả về
```json
"data":[
    {
        "_id":"objId",
        "name":"username",
        "profile":
        {
            "avatar":"image link"
        },
        "product_reviews":[
            {
                "_id":"objId",
                "productId":"objId",
                "rating":1,
                "content":"content",
                "helpful":{
                    "yes":48,
                    "no":8
                },
                "images":[
                    "image link 1",
                    "image link 2",
                    "image link 3"
                ],
                "createdAt":"datetime"
            }
        ]
    }
]
```


**Giải thích**
- **dbType=mongodb:** Chỉ định loại database là MongoDB.
- **skip=0:** Bỏ qua 0 bản ghi đầu tiên (bắt đầu từ đầu, dùng cho phân trang).
- **limit=200:** Lấy tối đa 200 bản ghi (giới hạn số lượng kết quả trả về).
- **select=product_reviews(verified=neq.true,status=eq.approved,products(categories())):**
    - Join và bảng product_reviews.
    - Trong product_reviews, chỉ lấy các review mà:
        - verified khác true (neq.true)
        - status bằng approved (eq.approved)
    - Và trong mỗi review, join vào bảng products, sau đó join tiếp vào categories với mỗi product.
- **and=(status=eq.active):** Chỉ lấy các user có status bằng active.

## 2. Xác thực và Phân quyền (Authentication & Authorization)

**Mô tả:** Thêm lớp xác thực người dùng và phân quyền truy cập cho MongoRest, đảm bảo bảo mật API.

### Cơ chế xác thực:
- **JWT Token:** Yêu cầu header `Authorization: Bearer <token>`
- **API Key:** Cấu hình chuỗi bí mật và yêu cầu client gửi key

### Phân quyền theo vai trò:
- **Người dùng ẩn danh:** Chỉ được phép đọc collection công khai
- **Người dùng đã đăng nhập:** CRUD trên một số collection được phép
- **Quản trị viên:** Truy cập mọi endpoint

### Các biện pháp bảo mật khác:
- **CORS:** Cấu hình Cross-Origin Resource Sharing
- **Rate Limiting:** Giới hạn số request trong khoảng thời gian
- **Logging và Audit:** Ghi lại các thao tác quan trọng

### Ví dụ minh họa:
Request không có token hợp lệ:
```json
GET /users
-> 401 {"error":"Unauthorized"}
```

User thường cố gắng xóa tài khoản người khác:
```json
DELETE /users/abc
-> 403 Forbidden
```

---

## Tóm tắt

Các module được sắp xếp từ nền tảng đến nâng cao:

1. **CRUD tự động** - Xương sống của MongoRest
2. **Query linh hoạt** - Tận dụng khả năng truy vấn MongoDB
3. **Validation** - Đảm bảo tính nhất quán dữ liệu
4. **Metadata và Documentation** - Dễ sử dụng và tích hợp
5. **Aggregation** - Tận dụng sức mạnh tổng hợp của MongoDB
6. **Text Search & Geo Query** - Tính năng nâng cao với index đặc biệt
7. **Real-time Updates** - Cập nhật thời gian thực
8. **Authentication & Authorization** - Bảo mật API

Cách phân chia này cho phép team phát triển song song các phần, đồng thời đảm bảo những phần quan trọng nhất được hoàn thành trước. MongoRest sẽ cung cấp một lớp API RESTful tự động, hiệu quả và tận dụng tối đa đặc tính của MongoDB.