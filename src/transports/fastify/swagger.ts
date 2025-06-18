// src/transports/fastify/swagger.ts

import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

export class SwaggerGenerator {
  private schemaData: any;
  private swaggerSpec: any;

  constructor() {
    this.loadSchemaData();
    this.generateSwaggerSpec();
  }

  private loadSchemaData(): void {
    try {
      const schemaPath = path.join(__dirname, '../../adapter/mongodb/scheme.json');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      this.schemaData = JSON.parse(schemaContent);
    } catch (error) {
      console.error('Failed to load schema data:', error);
      this.schemaData = {};
    }
  }

  private generateSwaggerSpec(): void {
    const collections = Object.keys(this.schemaData);
    
    this.swaggerSpec = {
      openapi: '3.0.0',
      info: {
        title: 'MongoREST Fastify API',
        description: `
# MongoDB REST API with Fastify framework

## Query Parameters Format

### Basic Filtering
- **field=eq.value** - Equal to value
- **field=neq.value** - Not equal to value  
- **field=gt.value** - Greater than value
- **field=gte.value** - Greater than or equal to value
- **field=lt.value** - Less than value
- **field=lte.value** - Less than or equal to value
- **field=like.pattern** - SQL LIKE pattern
- **field=ilike.pattern** - Case-insensitive LIKE
- **field=in.(value1,value2)** - Value in list
- **field=is.null** - Field is null
- **field=not.is.null** - Field is not null

### Array Operations
- **field=cs.{value1,value2}** - Contains any of the values
- **field=cd.{value1,value2}** - Contained by (subset of)

### Logical Operations
- **and=(field1=eq.value1,field2=gt.value2)** - AND conditions
- **or=(field1=eq.value1,field2=eq.value2)** - OR conditions
- **not=field=eq.value** - NOT conditions

### Relationships & Joins
- **select=*,related_table(field1,field2)** - Join with related data
- **select=*,related_table(filter_condition)** - Filtered joins

### Examples
\`\`\`
GET /api/users?status=eq.active&age=gt.18&limit=10
GET /api/products?and=(status=eq.active,price=lt.1000)&order=price.desc
GET /api/users?select=*,orders(status=eq.completed)&or=(status=eq.active,status=eq.pending)
\`\`\`
        `,
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@mongorest.com'
        }
      },
      servers: [
        {
          url: 'http://localhost:3002',
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: this.generateSchemas(collections),
        parameters: {
          collectionParam: {
            name: 'collection',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: collections
            },
            description: 'Collection name'
          },
          idParam: {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^[0-9a-fA-F]{24}$'
            },
            description: 'MongoDB ObjectId'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ],
      paths: this.generatePaths(collections)
    };
  }

  private generateSchemas(collections: string[]): any {
    const schemas: any = {};

    // Generate schemas for each collection
    collections.forEach(collection => {
      const sampleData = this.schemaData[collection];
      schemas[this.capitalize(collection)] = this.generateSchemaFromSample(sampleData);
      
      // Create schemas for different operations
      schemas[`${this.capitalize(collection)}Create`] = this.generateCreateSchema(sampleData);
      schemas[`${this.capitalize(collection)}Update`] = this.generateUpdateSchema(sampleData);
      schemas[`${this.capitalize(collection)}Response`] = this.generateResponseSchema(sampleData);
    });

    // Common schemas
    schemas.Error = {
      type: 'object',
      properties: {
        error: { type: 'string' },
        details: { type: 'string' }
      },
      required: ['error']
    };

    schemas.BulkResponse = {
      type: 'object',
      properties: {
        insertedCount: { type: 'integer' },
        modifiedCount: { type: 'integer' },
        deletedCount: { type: 'integer' },
        insertedIds: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    };

    return schemas;
  }

  private generateSchemaFromSample(sampleData: any): any {
    if (!sampleData || typeof sampleData !== 'object') {
      return {
        type: 'object',
        properties: {},
        required: []
      };
    }

    const schema: any = {
      type: 'object',
      properties: {},
      required: []
    };

    Object.keys(sampleData).forEach(key => {
      try {
        const value = sampleData[key];
        schema.properties[key] = this.inferTypeFromValue(value);
        
        // Mark commonly required fields
        if (['_id', 'name', 'email', 'sku'].includes(key)) {
          schema.required.push(key);
        }
      } catch (error) {
        console.warn(`Error processing field ${key}:`, error);
        schema.properties[key] = { type: 'string' };
      }
    });

    return schema;
  }

  private generateCreateSchema(sampleData: any): any {
    const schema = this.generateSchemaFromSample(sampleData);
    // Remove _id and timestamps from create schema
    delete schema.properties._id;
    delete schema.properties.createdAt;
    delete schema.properties.updatedAt;
    
    // Remove _id from required fields
    schema.required = schema.required.filter((field: string) => field !== '_id');
    
    return schema;
  }

  private generateUpdateSchema(sampleData: any): any {
    const schema = this.generateCreateSchema(sampleData);
    // Make all fields optional for updates
    schema.required = [];
    return schema;
  }

  private generateResponseSchema(sampleData: any): any {
    return this.generateSchemaFromSample(sampleData);
  }

  private inferTypeFromValue(value: any): any {
    if (value === null || value === undefined) {
      return { type: 'string', nullable: true };
    }

    if (typeof value === 'string') {
      // Check for MongoDB ObjectId pattern
      if (value.match(/^[0-9a-fA-F]{24}$/)) {
        return { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'MongoDB ObjectId' };
      }
      // Check for email pattern
      if (value.includes('@')) {
        return { type: 'string', format: 'email' };
      }
      // Check for URL pattern
      if (value.startsWith('http')) {
        return { type: 'string', format: 'uri' };
      }
      return { type: 'string' };
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
    }

    if (typeof value === 'boolean') {
      return { type: 'boolean' };
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        return {
          type: 'array',
          items: this.inferTypeFromValue(value[0])
        };
      }
      return { type: 'array', items: { type: 'string' } };
    }

    if (typeof value === 'object') {
      // Handle MongoDB special objects
      if (value.$oid) {
        return { type: 'string', pattern: '^[0-9a-fA-F]{24}$', description: 'MongoDB ObjectId' };
      }
      if (value.$date) {
        return { type: 'string', format: 'date-time' };
      }

      // Handle regular objects
      const schema: any = {
        type: 'object',
        properties: {}
      };

      Object.keys(value).forEach(key => {
        schema.properties[key] = this.inferTypeFromValue(value[key]);
      });

      return schema;
    }

    return { type: 'string' };
  }

  private generatePaths(collections: string[]): any {
    const paths: any = {};

    // Cache management endpoints
    paths['/api/cache/stats'] = {
      get: {
        tags: ['Cache'],
        summary: 'Get cache statistics',
        responses: {
          '200': {
            description: 'Cache statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    stats: { type: 'object' },
                    config: { type: 'object' },
                    active: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    };

    paths['/api/cache/clear'] = {
      delete: {
        tags: ['Cache'],
        summary: 'Clear all cache',
        responses: {
          '200': {
            description: 'Cache cleared successfully'
          }
        }
      }
    };

    paths['/api/cache/clear/{collection}'] = {
      delete: {
        tags: ['Cache'],
        summary: 'Clear cache for specific collection',
        parameters: [
          { $ref: '#/components/parameters/collectionParam' }
        ],
        responses: {
          '200': {
            description: 'Collection cache cleared successfully'
          }
        }
      }
    };

    // Generate paths for each collection
    collections.forEach(collection => {
      const collectionName = this.capitalize(collection);
      const tag = collectionName;

      // GET /api/{collection}
      paths[`/api/${collection}`] = {
        get: {
          tags: [tag],
          summary: `Get ${collection}`,
          description: `Retrieve ${collection} with optional filtering, sorting, and pagination`,
          parameters: [
            {
              name: 'select',
              in: 'query',
              schema: { type: 'string' },
              description: 'Fields to select. Examples: *, name,email, *,look_product_reviews(or=(verified=neq.true,status=eq.approved))',
              example: '*,look_product_reviews(or=(reviews.verified=neq.true,reviews.status=eq.approved),look_products(categories(children())))'
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 1000 },
              description: 'Maximum number of records to return',
              example: 100
            },
            {
              name: 'skip',
              in: 'query',
              schema: { type: 'integer', minimum: 0 },
              description: 'Number of records to skip for pagination',
              example: 0
            },
            {
              name: 'order',
              in: 'query',
              schema: { type: 'string' },
              description: 'Sort order. Examples: name, name.desc, created_at.asc',
              example: 'created_at.desc'
            },
            {
              name: 'count',
              in: 'query',
              schema: { type: 'string', enum: ['true', 'exact', 'false'] },
              description: 'Include count of total records',
              example: 'true'
            },
            {
              name: 'and',
              in: 'query',
              schema: { type: 'string' },
              description: 'AND logical conditions. Format: (field=op.value,field2=op.value2)',
              example: '(status=eq.active,age=gt.18)'
            },
            {
              name: 'or',
              in: 'query', 
              schema: { type: 'string' },
              description: 'OR logical conditions. Format: (field=op.value,field2=op.value2)',
              example: '(status=eq.active,status=eq.pending)'
            },
            {
              name: 'not',
              in: 'query',
              schema: { type: 'string' },
              description: 'NOT conditions. Format: field=op.value',
              example: 'status=eq.deleted'
            }
          ],
          responses: {
            '200': {
              description: `List of ${collection}`,
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: `#/components/schemas/${collectionName}Response` }
                  }
                }
              }
            },
            '500': {
              description: 'Database error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        },
        post: {
          tags: [tag],
          summary: `Create ${collection.slice(0, -1)}`,
          description: `Create a new ${collection.slice(0, -1)}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${collectionName}Create` }
              }
            }
          },
          responses: {
            '201': {
              description: `${collectionName.slice(0, -1)} created successfully`,
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${collectionName}Response` }
                }
              }
            },
            '500': {
              description: 'Insert error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      };

      // GET /api/{collection}/{id}
      paths[`/api/${collection}/{id}`] = {
        get: {
          tags: [tag],
          summary: `Get ${collection.slice(0, -1)} by ID`,
          parameters: [
            { $ref: '#/components/parameters/idParam' }
          ],
          responses: {
            '200': {
              description: `${collectionName.slice(0, -1)} details`,
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${collectionName}Response` }
                }
              }
            },
            '404': {
              description: `${collectionName.slice(0, -1)} not found`
            }
          }
        },
        patch: {
          tags: [tag],
          summary: `Update ${collection.slice(0, -1)}`,
          parameters: [
            { $ref: '#/components/parameters/idParam' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${collectionName}Update` }
              }
            }
          },
          responses: {
            '200': {
              description: `${collectionName.slice(0, -1)} updated successfully`,
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${collectionName}Response` }
                }
              }
            },
            '404': {
              description: `${collectionName.slice(0, -1)} not found`
            }
          }
        },
        delete: {
          tags: [tag],
          summary: `Delete ${collection.slice(0, -1)}`,
          parameters: [
            { $ref: '#/components/parameters/idParam' }
          ],
          responses: {
            '200': {
              description: `${collectionName.slice(0, -1)} deleted successfully`
            },
            '404': {
              description: `${collectionName.slice(0, -1)} not found`
            }
          }
        }
      };

      // Bulk operations
      paths[`/api/${collection}/bulk`] = {
        post: {
          tags: [tag],
          summary: `Create multiple ${collection}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: `#/components/schemas/${collectionName}Create` }
                }
              }
            }
          },
          responses: {
            '201': {
              description: `${collectionName} created successfully`,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BulkResponse' }
                }
              }
            }
          }
        },
        patch: {
          tags: [tag],
          summary: `Update multiple ${collection}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    filter: { type: 'object' },
                    update: { $ref: `#/components/schemas/${collectionName}Update` }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: `${collectionName} updated successfully`,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BulkResponse' }
                }
              }
            }
          }
        },
        delete: {
          tags: [tag],
          summary: `Delete multiple ${collection}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    filter: { type: 'object' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: `${collectionName} deleted successfully`,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BulkResponse' }
                }
              }
            }
          }
        }
      };
    });

    return paths;
  }


  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public getSwaggerSpec(): any {
    return this.swaggerSpec;
  }

  public async registerSwagger(fastify: FastifyInstance): Promise<void> {
    try {
      // Register swagger
      await fastify.register(require('@fastify/swagger'), {
        openapi: this.swaggerSpec
      });

      // Register swagger UI
      await fastify.register(require('@fastify/swagger-ui'), {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'list',
          deepLinking: false
        },
        staticCSP: true,
        transformSpecificationClone: true
      });
    } catch (error) {
      console.error('Error registering Swagger:', error);
      throw error;
    }
  }
}