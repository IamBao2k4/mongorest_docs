# MongoREST Documentation

Documentation cho MongoREST - Automatic REST API for MongoDB.

## Cấu trúc

- **Tutorials**: Hướng dẫn từng bước cho người mới bắt đầu
- **How-to Guides**: Giải quyết các vấn đề cụ thể
- **References**: Chi tiết API và cấu hình
- **Explanations**: Hiểu sâu về cách hoạt động
- **Integrations**: Tích hợp với các framework khác

## Chạy Documentation

### Development

```bash
npm run start
```

Documentation sẽ chạy tại `http://localhost:3000`

### Build

```bash
npm run build
```

### Deploy

```bash
npm run serve
```

## Cấu trúc thư mục

```
docs/
├── tutorials/
│   ├── getting-started.md
│   ├── basic-queries.md
│   ├── authentication.md
│   └── configuration.md
├── how-to-guides/
│   ├── authentication.md
│   ├── complex-queries.md
│   ├── file-uploads.md
│   └── websocket.md
├── references/
│   ├── api.md
│   ├── configuration.md
│   ├── schema.md
│   └── hooks.md
├── explanations/
│   ├── architecture.md
│   ├── query-translation.md
│   ├── security.md
│   └── performance.md
└── integrations/
    ├── express.md
    ├── react.md
    ├── vue.md
    └── nextjs.md
```

## Đóng góp

Để đóng góp vào documentation:

1. Fork repository
2. Tạo branch mới
3. Thực hiện thay đổi
4. Test locally với `npm run start`
5. Submit pull request

## License

MIT License