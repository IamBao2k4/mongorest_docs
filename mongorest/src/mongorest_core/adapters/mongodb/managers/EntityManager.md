# EntityManager - Quản lý Entity cho MongoDB Adapter

## Tổng quan

`EntityManager` là một class quan trọng trong MongoDB adapter, chịu trách nhiệm quản lý metadata của các collections trong database. Class này hoạt động như một lớp bảo vệ (guard layer) và cung cấp thông tin cấu hình cho các collections.

## Mục đích chính

### 1. **Whitelist Collections (Danh sách trắng)**
- Chỉ cho phép truy cập các collections đã được đăng ký trong file `_entities.json`
- Ngăn chặn truy cập trái phép vào các collections không được phép
- Tăng cường bảo mật cho hệ thống

### 2. **Quản lý Metadata**
- Lưu trữ thông tin về các collections như: tên hiển thị, unique key, schema validation
- Cung cấp thông tin cấu hình cho các tính năng khác của hệ thống

### 3. **Schema Validation**
- Hỗ trợ MongoDB native JSON Schema validation
- Cho phép định nghĩa và cập nhật schema cho collections

## Cấu trúc file `_entities.json`

```json
{
  "documents": [
    {
      "_id": "unique_id",
      "title": "Tên hiển thị của collection",
      "mongodb_collection_name": "users",  // Tên collection trong MongoDB
      "collection_name": "users",          // Tên cũ (để tương thích ngược)
      "unique_key": "email",               // Field unique (optional)
      "use_parent": false,                 // Có quan hệ parent-child không
      "use_parent_delete_childs": false,   // Xóa con khi xóa cha
      "json_schema": {                     // MongoDB JSON Schema (optional)
        "type": "object",
        "properties": {
          "email": { "type": "string" },
          "name": { "type": "string" }
        },
        "required": ["email", "name"]
      },
      "ui_schema": {                       // Schema cho UI (optional)
        "email": { "ui:widget": "email" }
      }
    }
  ]
}
```

## Các tính năng chính

### 1. **File Watching (Theo dõi file)**

```typescript
private initFileWatcher(): void {
  if (fs.existsSync(this.entitiesFilePath)) {
    this.fileWatcher = fs.watch(this.entitiesFilePath, (eventType) => {
      if (eventType === 'change') {
        console.log('[EntityManager] Entities file changed, reloading cache...');
        this.loadEntitiesFromFile();
      }
    });
  }
}
```

- Tự động theo dõi sự thay đổi của file `_entities.json`
- Reload cache khi file thay đổi mà không cần restart server
- Giúp cập nhật cấu hình nhanh chóng trong quá trình development

### 2. **Cache Management**

```typescript
private entitiesCache: EntitiesData | null = null;
```

- Cache toàn bộ nội dung file trong memory
- Tránh đọc file nhiều lần, tăng performance
- Tự động cập nhật khi file thay đổi

### 3. **Collection Validation**

```typescript
isCollectionAllowed(collectionName: string): boolean {
  // Special cases: luôn cho phép collection quản lý
  if (collectionName === 'entity' || collectionName === '_entities') {
    return true;
  }
  
  // Kiểm tra trong danh sách entities
  return this.entitiesCache.documents.some(
    entity => (entity.mongodb_collection_name || entity.collection_name) === collectionName
  );
}
```

- Kiểm tra collection có được phép truy cập không
- Có exception cho các collection đặc biệt như `entity`, `_entities`

### 4. **Entity Collection Proxy**

Đây là một tính năng đặc biệt cho phép collection `entity` đọc dữ liệu từ file local thay vì từ MongoDB:

```typescript
private createEntityCollectionProxy(): Collection {
  const collection = db.collection('entity');
  
  return new Proxy(collection, {
    get: (target, prop) => {
      if (prop === 'findOne') {
        return async (filter: any) => {
          // Tìm trong cache thay vì database
          return this.entitiesCache.documents.find(item => {
            if (filter.mongodb_collection_name) {
              return item.mongodb_collection_name === filter.mongodb_collection_name;
            }
            // ... các điều kiện khác
          });
        };
      }
      // ... xử lý các methods khác
    }
  });
}
```

**Lợi ích:**
- Cho phép quản lý entities mà không cần lưu trong database
- Dễ dàng version control với Git
- Có thể edit trực tiếp file JSON

### 5. **Schema Management**

```typescript
// Tạo collection với schema validation
async createCollectionWithSchema(collectionName: string, schema: any): Promise<void> {
  await this.db.createCollection(collectionName, {
    validator: {
      $jsonSchema: schema
    },
    validationLevel: "strict",
    validationAction: "error"
  });
}

// Cập nhật schema cho collection có sẵn
async updateCollectionSchema(collectionName: string, schema: any): Promise<void> {
  await this.db.command({
    collMod: collectionName,
    validator: {
      $jsonSchema: schema
    }
  });
}
```

- Tích hợp MongoDB native schema validation
- Đảm bảo data integrity ở database level
- Có thể update schema mà không cần recreate collection

### 6. **Change Streams**

```typescript
async watchCollection(
  collectionName: string, 
  targetCollectionName: string, 
  type: string
): Promise<void> {
  const collection = this.db.collection(collectionName);
  const changeStream = collection.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "insert") {
      // Sync data sang collection khác với type được chỉ định
      await targetCollection.updateOne(
        { _id: change.documentKey._id },
        { $set: { ...data, type } },
        { upsert: true }
      );
    }
  });
}
```

**Use case:** Merge nhiều collections vào một collection chung với field `type` để phân biệt.

## Lifecycle và Resource Management

### Initialization
```typescript
async initialize(client: MongoClient, dbName: string): Promise<void> {
  this.client = client;
  this.dbName = dbName;
  this.db = client.db(dbName);
}
```

### Cleanup
```typescript
async dispose(): Promise<void> {
  // Đóng file watcher
  if (this.fileWatcher) {
    this.fileWatcher.close();
  }
  // Clear cache
  this.entitiesCache = null;
  // Clear references
  this.db = undefined;
  this.client = undefined;
}
```

## Sử dụng trong MongoDBAdapter

EntityManager được tích hợp chặt chẽ với MongoDBAdapter:

```typescript
class MongoDBAdapter {
  private entityManager: EntityManager;

  convertQuery(query: IntermediateQuery): MongoDBQuery {
    // Validate collection trước khi convert
    if (!this.entityManager.isCollectionAllowed(query.collection)) {
      throw new Error(`Collection '${query.collection}' is not registered`);
    }
    // ... convert query
  }
}
```

## Best Practices

### 1. **Cấu trúc file `_entities.json`**
- Đặt file trong `/json/entities/_entities.json`
- Version control file này cùng source code
- Document rõ ràng purpose của mỗi collection

### 2. **Schema Design**
- Sử dụng JSON Schema chuẩn của MongoDB
- Định nghĩa required fields và data types
- Cân nhắc performance impact của complex validation

### 3. **Security**
- Luôn validate collection access qua EntityManager
- Không bypass validation layer
- Regular audit danh sách collections

### 4. **Performance**
- EntityManager cache toàn bộ entities trong memory
- File watching chỉ reload khi cần thiết
- Proxy chỉ apply cho special collections

## Ví dụ thực tế

### 1. Thêm collection mới
```json
{
  "documents": [
    {
      "_id": "new_collection_id",
      "title": "Products Collection", 
      "mongodb_collection_name": "products",
      "unique_key": "sku",
      "json_schema": {
        "bsonType": "object",
        "required": ["name", "price", "sku"],
        "properties": {
          "name": { "bsonType": "string" },
          "price": { "bsonType": "number", "minimum": 0 },
          "sku": { "bsonType": "string", "pattern": "^[A-Z0-9]+$" }
        }
      }
    }
  ]
}
```

### 2. Sử dụng trong code
```typescript
// Collection sẽ tự động được cho phép sau khi thêm vào _entities.json
const adapter = new MongoDBAdapter();
const query = {
  type: 'read',
  collection: 'products', // OK - đã registered
  filters: [{ field: 'price', operator: 'gt', value: 100 }]
};

const result = await adapter.executeQuery(adapter.convertQuery(query));
```

## Troubleshooting

### 1. "Collection not registered"
- Kiểm tra file `_entities.json` có tồn tại không
- Verify collection name chính xác (case-sensitive)
- Đợi file watcher reload (hoặc restart server)

### 2. Schema validation fails
- Check MongoDB logs cho detailed error
- Validate schema syntax với online tools
- Test với sample data trước khi apply

### 3. File watching không hoạt động
- Kiểm tra file permissions
- Một số hệ thống có giới hạn số file watchers
- Consider manual reload trong production

## Kết luận

EntityManager là một component thiết yếu của MongoDB adapter, cung cấp:
- Security layer cho collection access
- Configuration management 
- Schema validation integration
- Development flexibility với file-based config

Hiểu rõ EntityManager giúp sử dụng MongoDB adapter hiệu quả và bảo mật hơn.