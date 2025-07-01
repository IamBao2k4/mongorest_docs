# Analytics Dashboard Example

## Giới thiệu

Hướng dẫn này trình bày cách xây dựng một Analytics Dashboard mạnh mẽ với MongoREST, bao gồm real-time metrics, advanced aggregations, và data visualization APIs.

## 1. Thiết kế Schema cho Analytics

### Events Collection

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Analytics Events",
  "collection": "events",
  "type": "object",
  "properties": {
    "_id": {
      "type": "string"
    },
    "event": {
      "type": "string",
      "enum": ["page_view", "click", "conversion", "signup", "purchase", "custom"],
      "widget": "select"
    },
    "category": {
      "type": "string",
      "description": "Event category for grouping"
    },
    "action": {
      "type": "string",
      "description": "Specific action taken"
    },
    "label": {
      "type": "string",
      "description": "Additional context"
    },
    "value": {
      "type": "number",
      "description": "Numeric value (e.g., purchase amount)"
    },
    "userId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "sessionId": {
      "type": "string",
      "index": true
    },
    "properties": {
      "type": "object",
      "description": "Custom event properties"
    },
    "page": {
      "type": "object",
      "properties": {
        "url": { "type": "string" },
        "title": { "type": "string" },
        "referrer": { "type": "string" },
        "path": { "type": "string" }
      }
    },
    "device": {
      "type": "object",
      "properties": {
        "type": { "type": "string", "enum": ["desktop", "mobile", "tablet"] },
        "os": { "type": "string" },
        "browser": { "type": "string" },
        "version": { "type": "string" }
      }
    },
    "location": {
      "type": "object",
      "properties": {
        "country": { "type": "string" },
        "city": { "type": "string" },
        "region": { "type": "string" },
        "coordinates": {
          "type": "object",
          "properties": {
            "lat": { "type": "number" },
            "lng": { "type": "number" }
          }
        }
      }
    },
    "utm": {
      "type": "object",
      "properties": {
        "source": { "type": "string" },
        "medium": { "type": "string" },
        "campaign": { "type": "string" },
        "term": { "type": "string" },
        "content": { "type": "string" }
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "index": true
    },
    "ip": {
      "type": "string",
      "security": "private"
    },
    "userAgent": {
      "type": "string",
      "security": "private"
    }
  },
  "required": ["event", "timestamp"],
  "indexes": [
    { "fields": { "timestamp": -1 } },
    { "fields": { "userId": 1, "timestamp": -1 } },
    { "fields": { "sessionId": 1, "timestamp": 1 } },
    { "fields": { "event": 1, "timestamp": -1 } },
    { "fields": { "timestamp": -1, "event": 1, "userId": 1 } }
  ],
  "mongorest": {
    "plugins": {
      "created_at": { "isTurnOn": false }
    },
    "permissions": {
      "read": ["analyst", "admin"],
      "create": ["system", "admin"],
      "update": false,
      "delete": ["admin"]
    }
  }
}
```

### Metrics Collection

```json
{
  "collection": "metrics",
  "properties": {
    "name": {
      "type": "string",
      "description": "Metric name"
    },
    "type": {
      "type": "string",
      "enum": ["counter", "gauge", "histogram", "summary"]
    },
    "value": {
      "type": "number"
    },
    "dimensions": {
      "type": "object",
      "description": "Metric dimensions for grouping"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "aggregation": {
      "type": "object",
      "properties": {
        "period": { "type": "string", "enum": ["minute", "hour", "day", "week", "month"] },
        "count": { "type": "integer" },
        "sum": { "type": "number" },
        "avg": { "type": "number" },
        "min": { "type": "number" },
        "max": { "type": "number" }
      }
    }
  }
}
```

## 2. Real-time Analytics APIs

### Event Tracking

```javascript
// Track event function
{
  "name": "trackEvent",
  "description": "Track analytics event",
  "method": "POST",
  "rateLimit": { "window": "1m", "max": 1000 },
  "input": {
    "type": "object",
    "properties": {
      "event": { "type": "string", "required": true },
      "category": { "type": "string" },
      "action": { "type": "string" },
      "label": { "type": "string" },
      "value": { "type": "number" },
      "properties": { "type": "object" }
    }
  },
  "steps": [
    {
      "id": "enrichEvent",
      "type": "transform",
      "operations": [
        {
          "set": "event.userId",
          "value": "{{user.id || 'anonymous'}}"
        },
        {
          "set": "event.sessionId",
          "value": "{{session.id}}"
        },
        {
          "set": "event.timestamp",
          "value": "{{Date.now()}}"
        },
        {
          "set": "event.device",
          "value": "{{parseUserAgent(request.userAgent)}}"
        },
        {
          "set": "event.location",
          "value": "{{geoIP(request.ip)}}"
        }
      ]
    },
    {
      "id": "saveEvent",
      "type": "insert",
      "collection": "events",
      "document": "{{event}}"
    },
    {
      "id": "updateMetrics",
      "type": "parallel",
      "tasks": [
        {
          "type": "increment",
          "metric": "events.total",
          "value": 1
        },
        {
          "type": "increment",
          "metric": "events.{{event.event}}",
          "value": 1
        }
      ]
    }
  ]
}
```

### Real-time Dashboard Data

```bash
# Current active users
GET /functions/activeUsers
{
  "window": "5m"
}

# Response
{
  "activeUsers": 1523,
  "byDevice": {
    "desktop": 823,
    "mobile": 567,
    "tablet": 133
  },
  "byCountry": [
    { "country": "US", "users": 456 },
    { "country": "UK", "users": 234 }
  ]
}

# Real-time events stream
GET /functions/eventStream
{
  "events": ["page_view", "conversion"],
  "window": "1m"
}
```

## 3. Advanced Aggregations

### Time Series Aggregations

```javascript
// Hourly metrics aggregation
{
  "name": "hourlyMetrics",
  "description": "Calculate hourly metrics",
  "schedule": "0 * * * *", // Every hour
  "steps": [
    {
      "id": "aggregateEvents",
      "type": "aggregate",
      "collection": "events",
      "pipeline": [
        {
          "$match": {
            "timestamp": {
              "$gte": "{{Date.now() - 3600000}}",
              "$lt": "{{Date.now()}}"
            }
          }
        },
        {
          "$group": {
            "_id": {
              "event": "$event",
              "hour": { "$dateToString": { "format": "%Y-%m-%d %H:00", "date": "$timestamp" } }
            },
            "count": { "$sum": 1 },
            "uniqueUsers": { "$addToSet": "$userId" },
            "totalValue": { "$sum": "$value" }
          }
        },
        {
          "$project": {
            "event": "$_id.event",
            "hour": "$_id.hour",
            "count": 1,
            "uniqueUsers": { "$size": "$uniqueUsers" },
            "totalValue": 1,
            "avgValue": { "$divide": ["$totalValue", "$count"] }
          }
        }
      ]
    },
    {
      "id": "saveMetrics",
      "type": "insertMany",
      "collection": "hourly_metrics",
      "documents": "{{steps.aggregateEvents.output}}"
    }
  ]
}
```

### Funnel Analysis

```javascript
// Conversion funnel function
{
  "name": "conversionFunnel",
  "description": "Analyze conversion funnel",
  "input": {
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "event": { "type": "string" }
        }
      }
    },
    "timeframe": { "type": "string", "default": "7d" }
  },
  "steps": [
    {
      "id": "calculateFunnel",
      "type": "aggregate",
      "collection": "events",
      "pipeline": [
        {
          "$match": {
            "timestamp": { "$gte": "{{parseTimeframe(params.timeframe)}}" },
            "event": { "$in": "{{params.steps.map(s => s.event)}}" }
          }
        },
        {
          "$sort": { "userId": 1, "timestamp": 1 }
        },
        {
          "$group": {
            "_id": "$userId",
            "events": {
              "$push": {
                "event": "$event",
                "timestamp": "$timestamp"
              }
            }
          }
        },
        {
          "$project": {
            "completedSteps": {
              "$reduce": {
                "input": "{{params.steps}}",
                "initialValue": [],
                "in": {
                  "$cond": [
                    { "$in": ["$$this.event", "$events.event"] },
                    { "$concatArrays": ["$$value", ["$$this.name"]] },
                    "$$value"
                  ]
                }
              }
            }
          }
        },
        {
          "$group": {
            "_id": { "$size": "$completedSteps" },
            "users": { "$sum": 1 }
          }
        }
      ]
    },
    {
      "id": "formatResults",
      "type": "transform",
      "data": "{{steps.calculateFunnel.output}}",
      "format": "funnel"
    }
  ]
}
```

### Cohort Analysis

```bash
# User cohort retention
POST /functions/cohortAnalysis
{
  "cohortType": "signup_date",
  "metric": "retention",
  "period": "week",
  "lookback": "12w"
}

# Response
{
  "cohorts": [
    {
      "cohortDate": "2024-01-01",
      "size": 1000,
      "retention": {
        "week0": 100,
        "week1": 75,
        "week2": 60,
        "week3": 50,
        "week4": 45
      }
    }
  ]
}
```

## 4. Performance Metrics

### Page Performance

```javascript
// Web vitals tracking
{
  "name": "trackWebVitals",
  "description": "Track Core Web Vitals",
  "input": {
    "metrics": {
      "type": "object",
      "properties": {
        "lcp": { "type": "number" },  // Largest Contentful Paint
        "fid": { "type": "number" },  // First Input Delay
        "cls": { "type": "number" },  // Cumulative Layout Shift
        "ttfb": { "type": "number" }, // Time to First Byte
        "fcp": { "type": "number" }   // First Contentful Paint
      }
    },
    "page": { "type": "string" }
  },
  "steps": [
    {
      "id": "saveVitals",
      "type": "insert",
      "collection": "web_vitals",
      "document": {
        "metrics": "{{params.metrics}}",
        "page": "{{params.page}}",
        "timestamp": "{{Date.now()}}",
        "sessionId": "{{session.id}}"
      }
    },
    {
      "id": "checkThresholds",
      "type": "evaluate",
      "conditions": [
        {
          "if": "params.metrics.lcp > 2500",
          "alert": "Poor LCP performance"
        },
        {
          "if": "params.metrics.cls > 0.1",
          "alert": "Layout shift issues"
        }
      ]
    }
  ]
}
```

### API Performance Monitoring

```bash
# API endpoint performance
GET /functions/apiPerformance
{
  "endpoint": "/products",
  "period": "24h",
  "percentiles": [50, 90, 95, 99]
}

# Response
{
  "endpoint": "/products",
  "requests": 125430,
  "avgResponseTime": 145,
  "percentiles": {
    "p50": 120,
    "p90": 250,
    "p95": 380,
    "p99": 750
  },
  "errors": {
    "total": 125,
    "rate": 0.001,
    "byStatus": {
      "500": 10,
      "502": 5,
      "503": 110
    }
  }
}
```

## 5. User Analytics

### User Behavior Analysis

```javascript
// User journey analysis
{
  "name": "userJourney",
  "description": "Analyze user journey paths",
  "input": {
    "userId": { "type": "string" },
    "sessionId": { "type": "string" },
    "limit": { "type": "integer", "default": 100 }
  },
  "steps": [
    {
      "id": "getEvents",
      "type": "find",
      "collection": "events",
      "query": {
        "$or": [
          { "userId": "{{params.userId}}" },
          { "sessionId": "{{params.sessionId}}" }
        ]
      },
      "sort": { "timestamp": 1 },
      "limit": "{{params.limit}}"
    },
    {
      "id": "buildJourney",
      "type": "transform",
      "data": "{{steps.getEvents.output}}",
      "operations": [
        {
          "groupBy": "sessionId",
          "map": {
            "path": "{{events.map(e => e.page.path).join(' → ')}}",
            "duration": "{{last.timestamp - first.timestamp}}",
            "events": "{{events.length}}",
            "converted": "{{events.some(e => e.event === 'conversion')}}"
          }
        }
      ]
    }
  ]
}
```

### User Segmentation

```bash
# Segment users by behavior
POST /functions/userSegmentation
{
  "segments": [
    {
      "name": "Power Users",
      "criteria": {
        "events": { "$gte": 100 },
        "lastActive": { "$gte": "Date.now() - 7*24*60*60*1000" }
      }
    },
    {
      "name": "At Risk",
      "criteria": {
        "lastActive": { "$lte": "Date.now() - 30*24*60*60*1000" },
        "totalValue": { "$gte": 100 }
      }
    },
    {
      "name": "New Users",
      "criteria": {
        "createdAt": { "$gte": "Date.now() - 7*24*60*60*1000" }
      }
    }
  ]
}

# Response
{
  "segments": [
    {
      "name": "Power Users",
      "count": 1234,
      "percentage": 5.2,
      "avgValue": 523.45
    },
    {
      "name": "At Risk",
      "count": 3456,
      "percentage": 14.5,
      "avgValue": 234.56
    }
  ]
}
```

## 6. Business Intelligence

### Revenue Analytics

```javascript
// Revenue tracking and analysis
{
  "name": "revenueAnalytics",
  "description": "Comprehensive revenue analysis",
  "schedule": "0 0 * * *", // Daily
  "steps": [
    {
      "id": "dailyRevenue",
      "type": "aggregate",
      "collection": "events",
      "pipeline": [
        {
          "$match": {
            "event": "purchase",
            "timestamp": {
              "$gte": "{{startOfDay()}}",
              "$lt": "{{endOfDay()}}"
            }
          }
        },
        {
          "$group": {
            "_id": null,
            "totalRevenue": { "$sum": "$value" },
            "orderCount": { "$sum": 1 },
            "avgOrderValue": { "$avg": "$value" },
            "uniqueCustomers": { "$addToSet": "$userId" }
          }
        },
        {
          "$project": {
            "date": "{{today()}}",
            "revenue": "$totalRevenue",
            "orders": "$orderCount",
            "aov": "$avgOrderValue",
            "customers": { "$size": "$uniqueCustomers" }
          }
        }
      ]
    },
    {
      "id": "productPerformance",
      "type": "aggregate",
      "collection": "events",
      "pipeline": [
        {
          "$match": {
            "event": "purchase",
            "timestamp": { "$gte": "{{startOfDay()}}" }
          }
        },
        {
          "$unwind": "$properties.items"
        },
        {
          "$group": {
            "_id": "$properties.items.productId",
            "quantity": { "$sum": "$properties.items.quantity" },
            "revenue": { "$sum": "$properties.items.price" }
          }
        },
        {
          "$sort": { "revenue": -1 }
        },
        {
          "$limit": 10
        }
      ]
    }
  ]
}
```

### Attribution Analysis

```bash
# Multi-touch attribution
POST /functions/attribution
{
  "model": "linear", // linear, first-touch, last-touch, time-decay
  "lookbackWindow": "30d",
  "conversionEvent": "purchase"
}

# Response
{
  "attributions": [
    {
      "channel": "organic_search",
      "conversions": 234,
      "revenue": 45678,
      "credit": 0.35
    },
    {
      "channel": "paid_search",
      "conversions": 189,
      "revenue": 34567,
      "credit": 0.28
    },
    {
      "channel": "email",
      "conversions": 156,
      "revenue": 28901,
      "credit": 0.22
    }
  ],
  "model": "linear",
  "totalConversions": 579,
  "totalRevenue": 109146
}
```

## 7. Custom Dashboards

### Dashboard Configuration

```json
{
  "collection": "dashboards",
  "properties": {
    "name": { "type": "string" },
    "description": { "type": "string" },
    "owner": { "type": "string" },
    "shared": { "type": "boolean", "default": false },
    "layout": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string", "enum": ["metric", "chart", "table", "map"] },
          "config": { "type": "object" },
          "position": {
            "type": "object",
            "properties": {
              "x": { "type": "integer" },
              "y": { "type": "integer" },
              "w": { "type": "integer" },
              "h": { "type": "integer" }
            }
          }
        }
      }
    },
    "filters": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": { "type": "string" },
          "operator": { "type": "string" },
          "value": { "type": "any" }
        }
      }
    },
    "refreshInterval": { "type": "integer", "default": 60 }
  }
}
```

### Dashboard Data API

```javascript
// Get dashboard data
{
  "name": "getDashboardData",
  "description": "Fetch all data for a dashboard",
  "input": {
    "dashboardId": { "type": "string", "required": true },
    "timeframe": { "type": "string", "default": "24h" },
    "filters": { "type": "object" }
  },
  "steps": [
    {
      "id": "loadDashboard",
      "type": "findOne",
      "collection": "dashboards",
      "query": { "_id": "{{params.dashboardId}}" }
    },
    {
      "id": "fetchWidgetData",
      "type": "parallel",
      "tasks": "{{steps.loadDashboard.output.layout.map(widget => ({
        id: widget.id,
        type: 'function',
        name: widget.config.dataSource,
        params: {
          ...widget.config.params,
          timeframe: params.timeframe,
          filters: params.filters
        }
      }))}}"
    },
    {
      "id": "formatResponse",
      "type": "transform",
      "data": "{{steps.fetchWidgetData.output}}",
      "format": "dashboard"
    }
  ]
}
```

## 8. Export & Reporting

### Scheduled Reports

```javascript
// Email report generation
{
  "name": "generateReport",
  "description": "Generate and email analytics report",
  "schedule": "0 9 * * MON", // Every Monday at 9 AM
  "steps": [
    {
      "id": "gatherMetrics",
      "type": "parallel",
      "tasks": [
        {
          "name": "weeklyTraffic",
          "function": "trafficReport",
          "params": { "period": "7d" }
        },
        {
          "name": "topContent",
          "function": "contentPerformance",
          "params": { "limit": 10 }
        },
        {
          "name": "revenue",
          "function": "revenueReport",
          "params": { "period": "7d" }
        }
      ]
    },
    {
      "id": "generatePDF",
      "type": "http",
      "method": "POST",
      "url": "{{env.REPORT_SERVICE}}/generate",
      "body": {
        "template": "weekly_analytics",
        "data": "{{steps.gatherMetrics.output}}"
      }
    },
    {
      "id": "sendEmail",
      "type": "email",
      "recipients": "{{getReportRecipients()}}",
      "subject": "Weekly Analytics Report - {{formatDate('YYYY-MM-DD')}}",
      "attachments": ["{{steps.generatePDF.output.url}}"]
    }
  ]
}
```

### Data Export

```bash
# Export raw events data
POST /functions/exportData
{
  "collection": "events",
  "filters": {
    "timestamp": { "$gte": "2024-01-01", "$lte": "2024-01-31" },
    "event": { "$in": ["purchase", "signup"] }
  },
  "format": "csv",
  "fields": ["timestamp", "event", "userId", "value", "properties"]
}

# Response
{
  "exportId": "exp_123456",
  "status": "processing",
  "estimatedRows": 125000,
  "downloadUrl": null
}

# Check export status
GET /exports/exp_123456
{
  "exportId": "exp_123456",
  "status": "completed",
  "rows": 124567,
  "size": "45.2MB",
  "downloadUrl": "https://cdn.example.com/exports/exp_123456.csv",
  "expiresAt": "2024-02-01T00:00:00Z"
}
```

## 9. Performance Optimization

### Data Aggregation Strategy

```javascript
// Pre-aggregate data for performance
{
  "aggregations": {
    "5min": {
      "retention": "24h",
      "metrics": ["pageviews", "users", "sessions"]
    },
    "1hour": {
      "retention": "7d",
      "metrics": ["all"]
    },
    "1day": {
      "retention": "90d",
      "metrics": ["all"]
    },
    "1month": {
      "retention": "2y",
      "metrics": ["all"]
    }
  }
}

// Query optimization
db.events.createIndex({ "timestamp": -1, "event": 1 });
db.events.createIndex({ "userId": 1, "timestamp": -1 });
db.events.createIndex({ "sessionId": 1, "timestamp": 1 });
```

### Caching Strategy

```javascript
// Cache configuration for analytics
{
  "caching": {
    "dashboards": {
      "ttl": 60,  // 1 minute for real-time dashboards
      "keyPattern": "dashboard:{id}:{timeframe}"
    },
    "reports": {
      "ttl": 3600, // 1 hour for reports
      "keyPattern": "report:{type}:{period}:{date}"
    },
    "aggregations": {
      "ttl": 300, // 5 minutes for aggregated data
      "keyPattern": "agg:{metric}:{granularity}:{timestamp}"
    }
  }
}
```

## 10. Monitoring & Alerts

### Alert Configuration

```javascript
// Alert rules
{
  "name": "alertRules",
  "rules": [
    {
      "name": "High Error Rate",
      "condition": "errorRate > 0.05",
      "window": "5m",
      "severity": "critical",
      "notify": ["ops-team@example.com"]
    },
    {
      "name": "Traffic Spike",
      "condition": "pageviews > avg * 3",
      "window": "10m",
      "severity": "warning",
      "notify": ["analytics@example.com"]
    },
    {
      "name": "Revenue Drop",
      "condition": "revenue < yesterday * 0.8",
      "window": "1h",
      "severity": "high",
      "notify": ["business@example.com"]
    }
  ]
}
```

### Health Checks

```bash
# Analytics system health
GET /functions/analyticsHealth

# Response
{
  "status": "healthy",
  "components": {
    "eventIngestion": {
      "status": "healthy",
      "eventsPerSecond": 523,
      "lag": "120ms"
    },
    "aggregationPipeline": {
      "status": "healthy",
      "lastRun": "2024-01-25T10:55:00Z",
      "nextRun": "2024-01-25T11:00:00Z"
    },
    "storage": {
      "status": "healthy",
      "usage": "45.2%",
      "eventsCount": 125430000
    }
  },
  "uptime": "45d 12h 34m"
}
```

## Conclusion

MongoREST cung cấp một platform mạnh mẽ cho việc xây dựng analytics dashboards với khả năng xử lý real-time data, advanced aggregations, và flexible reporting. Với schema-driven approach và built-in performance optimizations, bạn có thể tạo ra các analytics solutions scalable và maintainable.

### Next Steps

- Review [Migration Guide](./migration-guide.md) để migrate existing analytics
- Check [E-commerce Example](./e-commerce-example.md) for business analytics
- Explore [CMS Example](./cms-example.md) for content analytics