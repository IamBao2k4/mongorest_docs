---
sidebar_position: 4
---

# WebSocket Support

Hướng dẫn sử dụng real-time features với WebSocket.

## Enable WebSocket

```javascript
websocket: {
  enabled: true,
  path: '/ws',
  cors: true
}
```

## Client Connection

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('open', () => {
  // Subscribe to collection
  ws.send(JSON.stringify({
    action: 'subscribe',
    collection: 'messages'
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data);
  console.log('Event:', event.type, event.data);
});
```

## Events

### Document events
- `insert` - Document mới được thêm
- `update` - Document được cập nhật
- `delete` - Document bị xóa

### Subscribe với filters
```javascript
ws.send(JSON.stringify({
  action: 'subscribe',
  collection: 'orders',
  filter: { status: 'pending' }
}));
```

## Broadcasting

### Server-side
```javascript
hooks: {
  afterInsert: async (collection, doc) => {
    // Broadcast to all clients
    server.broadcast('notification', {
      message: 'New document added',
      collection,
      document: doc
    });
  }
}
```

### Custom events
```javascript
// Emit custom event
server.ws.emit('custom-event', { data: 'value' });

// To specific room
server.ws.to('room-123').emit('message', { text: 'Hello' });
```

## Rooms

```javascript
// Join room
ws.send(JSON.stringify({
  action: 'join',
  room: 'chat-123'
}));

// Leave room
ws.send(JSON.stringify({
  action: 'leave',
  room: 'chat-123'
}));
```