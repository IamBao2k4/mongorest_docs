---
sidebar_position: 1
---

# MongoREST Documentation

MongoREST là một API REST tự động cho MongoDB, cho phép bạn truy cập dữ liệu MongoDB thông qua HTTP requests một cách dễ dàng.

## Tính năng chính

- **RESTful API tự động**: Tạo endpoints REST cho collections MongoDB
- **Query linh hoạt**: Hỗ trợ filtering, sorting, pagination
- **Authentication**: Bảo mật với JWT tokens
- **Real-time**: WebSocket support cho real-time updates
- **Schema validation**: Validate dữ liệu tự động

## Bắt đầu nhanh

```bash
npm install mongorest
mongorest start --db mongodb://localhost:27017/mydb
```

## Cấu trúc Documentation

- **[Tutorials](./tutorials/getting-started)**: Hướng dẫn từng bước cho người mới
- **[How-to Guides](./how-to-guides/authentication)**: Giải quyết các vấn đề cụ thể
- **[References](./references/api)**: Chi tiết API và cấu hình
- **[Explanations](./explanations/architecture)**: Hiểu sâu về cách hoạt động
- **[Integrations](./integrations/express)**: Tích hợp với các framework kh