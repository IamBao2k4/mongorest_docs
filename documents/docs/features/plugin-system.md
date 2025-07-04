QueryConverter
Tổng quan
QueryConverter chuyển đổi URL query parameters thành intermediate JSON format, xử lý các truy vấn phức tạp với filters, joins, sorting và pagination từ REST API parameters.
Class QueryConverter
Properties

currentQuery: IntermediateQuery | null - Lưu trữ tạm thời trong quá trình chuyển đổi

Main Method
convert(params: QueryParams, collection: string, roles: string[] = []): IntermediateQuery

Mục đích: Điểm khởi đầu chính cho việc chuyển đổi
Parameters:
params: Đối tượng chứa URL query parameters
collection: Tên collection/table đích
roles: Các vai trò của người dùng cho RBAC


Return: Đối tượng IntermediateQuery
Quy trình:
Tạo truy vấn cơ bản với metadata
Xử lý các tham số đặc biệt (select, order, limit)
Xử lý các toán tử logic (and, or, not)
Xử lý các bộ lọc trường



Xử lý Tham số
Tham số Đặc biệt
select
?select=field1,field2,field3
?select=alias:field,field2
?select=relation(field1,field2)


Mục đích: Lựa chọn trường và quan hệ nhúng
Tính năng:
Trường đơn giản: name,email
Bí danh: fullName:name
Quan hệ nhúng: posts(title,content)
Nhúng lồng nhau: posts(title,comments(text))



order
?order=field1,-field2


Mục đích: Sắp xếp thứ tự
Định dạng:
Tăng dần: field
Giảm dần: -field
Nhiều trường: priority,-createdAt



limit, skip, offset
?limit=20&offset=40
?limit=10&skip=20


Mục đích: Phân trang
Ghi chú: skip và offset đồng nghĩa

count
?count=true
?count=exact


Mục đích: Bao gồm tổng số lượng trong phản hồi

Bộ lọc Tham số
Bộ lọc Đơn giản
?field=value              // Bình đẳng ngầm
?field=eq.value          // Bình đẳng rõ ràng
?field=neq.value         // Không bằng
?field=gt.100            // Lớn hơn
?field=gte.100           // Lớn hơn hoặc bằng
?field=lt.100            // Nhỏ hơn
?field=lte.100           // Nhỏ hơn hoặc bằng
?field=in.(a,b,c)        // Trong mảng
?field=nin.(a,b,c)       // Không trong mảng

Toán tử Logic
?and=(field1.eq.value1,field2.gt.value2)
?or=(status.eq.active,priority.eq.high)
?not=(deleted.eq.true)

Bộ lọc Lồng nhau
?reviews.verified=neq.true
?author.status=eq.active

Phương thức Phân tích
parseSelect(selectClause: string): SelectClause

Mục đích: Phân tích lựa chọn trường
Xử lý:
Trường thông thường
Bí danh trường
Quan hệ nhúng


Logic đặc biệt: Chuyển đổi nhúng thành JOINs

parseSort(orderClause: string): SortClause[]

Mục đích: Phân tích thứ tự sắp xếp
Định dạng: Tiền tố - cho giảm dần

parseLogicalCondition(key: string, value: string): FilterCondition

Mục đích: Phân tích các điều kiện AND/OR/NOT
Phân tích phức tạp: Xử lý dấu ngoặc lồng nhau và dấu ngoặc kép

parseFieldCondition(conditionStr: string): FieldCondition

Mục đích: Phân tích điều kiện trường đơn
Định dạng: field.operator.value
Giá trị mảng: field.in.(val1,val2)

parseValue(valueStr: string): any

Mục đích: Chuyển đổi giá trị chuỗi thành kiểu phù hợp
Chuyển đổi:
"null" → null
"true"/"false" → boolean
Số → int/float
Chuỗi trong dấu ngoặc kép → bỏ dấu ngoặc
Mặc định → chuỗi



Quan hệ Nhúng
Định dạng
?select=posts(title,content,author(name))

Chuyển đổi
Các biểu thức nhúng được chuyển đổi vào JOIN clauses:
// Input: posts(title,content)
// Output: 
{
  type: 'lookup',
  target: 'posts',
  alias: 'posts',
  select: ['title', 'content']
}

Nhúng Lồng nhau
?select=posts(title,comments(text,author(name)))

Tạo cấu trúc JOIN lồng nhau với nhiều cấp độ.
Tính năng Nâng cao
Tokenization

tokenizeSelect(): Bộ phân tích thông minh, tôn trọng dấu ngoặc và dấu ngoặc kép
parseLogicalValue(): Tách các giá trị phân cách bằng dấu phẩy với hỗ trợ lồng nhau

Phát hiện Biểu thức Nhúng

isEmbedExpression(): Phát hiện cú pháp giống hàm
parseEmbedToJoin(): Chuyển đổi nhúng thành JOIN clauses
parseNestedJoinsAndFilters(): Xử lý các cấu trúc lồng nhau phức tạp

Phân tích Trường

parseRegularField(): Xử lý bí danh, đường dẫn JSON, ép kiểu
Hỗ trợ:
Bí danh: alias:field
Đường dẫn JSON: data->field
Ép kiểu: field::text



Xử lý Lỗi
QueryErrors

currentQueryNotInitialized(): Lỗi trạng thái nội bộ
Lỗi xác thực tham số
Lỗi biểu thức không hợp lệ

Ví dụ Sử dụng
Truy vấn Cơ bản
GET /api/users?select=name,email&order=-createdAt&limit=10

Chuyển đổi thành:
{
  collection: 'users',
  select: { fields: ['name', 'email'] },
  sort: [{ field: 'createdAt', direction: 'desc' }],
  pagination: { limit: 10 }
}

Truy vấn Phức tạp
GET /api/posts?select=title,author(name,email)&and=(status.eq.published,author.verified.eq.true)&order=-views&limit=20

Chuyển đổi thành:
{
  collection: 'posts',
  select: { fields: ['title'] },
  joins: [{
    type: 'lookup',
    target: 'author',
    select: ['name', 'email']
  }],
  filter: {
    operator: 'and',
    conditions: [
      { field: 'status', operator: 'eq', value: 'published' },
      { field: 'author.verified', operator: 'eq', value: true }
    ]
  },
  sort: [{ field: 'views', direction: 'desc' }],
  pagination: { limit: 20 }
}

Thực tiễn Tốt nhất

Xác thực tham số trước khi chuyển đổi
Xử lý các biểu thức không hợp lệ một cách nhẹ nhàng
Hỗ trợ cả cú pháp giống SQL và MongoDB
Duy trì thông tin kiểu trong quá trình chuyển đổi
Sử dụng thông báo lỗi rõ ràng để gỡ lỗi

Tóm tắt
QueryConverter cung cấp:

Linh hoạt: Xử lý nhiều loại truy vấn phức tạp
Tính nhất quán: Đảm bảo định dạng JSON trung gian chuẩn hóa
Tự động hóa: Giảm công việc thủ công trong xử lý truy vấn
Khả năng mở rộng: Dễ dàng thêm các tính năng phân tích mới
Hiệu suất: Tối ưu hóa việc thực thi truy vấn

Next: Query API →