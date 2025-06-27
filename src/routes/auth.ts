import { FastifyInstance, FastifyRequest } from 'fastify';
import { rbacService } from '../services/rbac/rbac';

export async function AuthRoutes(app: FastifyInstance) {

    app.post('/api/v1/auth/login', async (request: FastifyRequest, reply) => {
        const { email, password } = request.body as { email: string; password: string };
        // Simulate authentication logic
        console.log("hihi")
        if (email === 'tiennt1242@gmail.com' && password === 'tiennt1242@gmail.com') {
            // Generate a token (in a real application, use JWT or similar)
            const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTMzMzczMDM2Nzk5MjVlNDJiYjRkOCIsImVtYWlsIjoidGllbm50MTI0MkBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InRpZW5udDEyNDJAZ21haWwuY29tIiwicm9sZV9zeXN0ZW0iOiJ1c2VyIiwiaWF0IjoxNzUwOTkzMzU0LCJleHAiOjE3NTEwNzk3NTR9.rtnJXMuQHpSDN4bVYypi9mib917_LVzOasr70uzCimc';
            reply.send({ success: true, accessToken });
        }
        else {
            reply.status(401).send({ success: false, message: 'Invalid credentials' });
        }
    });

    app.get('/api/v1/auth/me', async (request: FastifyRequest, reply) => {
        reply.send(data);
    });
}

const data = {
    "_id": "67a3337303679925e42bb4d8",
    "email": "tiennt1242@gmail.com",
    "username": "tiennt1242@gmail.com",
    "first_name": "Nguyễn Trọng ",
    "last_name": "Tiến",
    "nickname": "Tiến BE",
    "full_name": "Nguyễn Trọng  Tiến",
    "featured_image": null,
    "cover": null,
    "role_system": "user",
    "role": [
        {
            "title": "2bds",
            "permission": [
                {
                    "title": "api-key",
                    "entity": "api-key",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "collection",
                    "entity": "collection",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge-activity",
                    "entity": "mge-activity",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge-grouptag",
                    "entity": "mge-grouptag",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "role",
                    "entity": "role",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "seopath",
                    "entity": "seopath",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "tenant-env",
                    "entity": "tenant-env",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "test",
                    "entity": "test",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "test_parent",
                    "entity": "test_parent",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "user-content-review-role",
                    "entity": "user-content-review-role",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "user-content-review-status",
                    "entity": "user-content-review-status",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "user-tenant-mapping",
                    "entity": "user-tenant-mapping",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "user-token",
                    "entity": "user-token",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "activity log type",
                    "entity": "activity-log-type",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "ai generated jsx",
                    "entity": "ai-generated-jsx",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "API Schema",
                    "entity": "api-schema",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "area common",
                    "entity": "areacommon",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "block image collection",
                    "entity": "block-image-collection",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "BOARD SET",
                    "entity": "board-set",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "bull-mq-jobs",
                    "entity": "bullmqjobs",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Categories API",
                    "entity": "categories-api",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "categories block image",
                    "entity": "categories-block-image",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Categories Media",
                    "entity": "categories-media",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Categories Response",
                    "entity": "categories-response",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Categories Validate",
                    "entity": "categories-validate",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "category",
                    "entity": "category",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "course",
                    "entity": "course",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "cron job",
                    "entity": "cron-job",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "data function",
                    "entity": "data-function",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Documents",
                    "entity": "documents",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "domain",
                    "entity": "domain",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "ECM Product",
                    "entity": "ecm-product",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "ecommerce coupon",
                    "entity": "ecommerce-discount-code",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "ecommerce order",
                    "entity": "ecommerce-order",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "ecommerce payment method",
                    "entity": "ecommerce-payment-method",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "ecommerce price rule",
                    "entity": "ecommerce-price-rule",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "ecommerce shipping",
                    "entity": "ecommerce-shipping",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "EMC Carts",
                    "entity": "emc-carts",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "EMC Category",
                    "entity": "emc-category",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "EMC orders",
                    "entity": "emc-orders",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "EMC Pages",
                    "entity": "emc-pages",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "EMC Posttpe",
                    "entity": "emc-posttpe",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "EMC Tags",
                    "entity": "emc-tags",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "EMC Tags Groups",
                    "entity": "emc-tags-groups",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "EMC vouchers",
                    "entity": "emc-vouchers",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Entity",
                    "entity": "entity",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "entity course member example",
                    "entity": "entity-course-member-example",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "entity group",
                    "entity": "entity-group",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "entity json format",
                    "entity": "entity-json-format",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "entity tenant mapping",
                    "entity": "entity-tenant-mapping",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Flow",
                    "entity": "flow",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Flow API",
                    "entity": "flow-api",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Function",
                    "entity": "function",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Group Field",
                    "entity": "group-field",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "image",
                    "entity": "image",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mcp tool",
                    "entity": "mcp-tool",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mcp tool token",
                    "entity": "mcp-tool-token",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "media",
                    "entity": "media",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Menu",
                    "entity": "menu",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge categories",
                    "entity": "mge-categories",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge chapters",
                    "entity": "mge-chapters",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course cart",
                    "entity": "mge-course-cart",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course coupon",
                    "entity": "mge-course-coupon",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course log record",
                    "entity": "mge-course-log-record",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course member",
                    "entity": "mge-course-member",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course order",
                    "entity": "mge-course-order",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course payment method",
                    "entity": "mge-course-payment-method",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course statistic",
                    "entity": "mge-course-statistic",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course tenant log record",
                    "entity": "mge-course-tenant-log-record",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course tenant statistic",
                    "entity": "mge-course-tenant-statistic",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge course user progress",
                    "entity": "mge-course-user-progress",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge courses",
                    "entity": "mge-courses",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge department",
                    "entity": "mge-department",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge discussion comment",
                    "entity": "mge-discussion-comment",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge discussion comment like",
                    "entity": "mge-discussion-comment-like",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge discussion like",
                    "entity": "mge-discussion-like",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge discussion pin",
                    "entity": "mge-discussion-pin",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge discussions",
                    "entity": "mge-discussions",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge entity like",
                    "entity": "mge-entity-like",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge exams",
                    "entity": "mge-exams",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge group",
                    "entity": "mge-group",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge group category",
                    "entity": "mge-group-category",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge group demo",
                    "entity": "mge-group-demo",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge group member",
                    "entity": "mge-group-member",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge group menu item",
                    "entity": "mge-group-menu-item",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge group pin",
                    "entity": "mge-group-pin",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge job position",
                    "entity": "mge-job-position",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge learning path",
                    "entity": "mge-learning-path",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge lessons",
                    "entity": "mge-lessons",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing category",
                    "entity": "mge-listing-category",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing contact",
                    "entity": "mge-listing-contact",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing project",
                    "entity": "mge-listing-project",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing tag",
                    "entity": "mge-listing-tag",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing tag group",
                    "entity": "mge-listing-tag-group",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing tweet",
                    "entity": "mge-listing-tweet",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing tweet report",
                    "entity": "mge-listing-tweet-report",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing tweet saved",
                    "entity": "mge-listing-tweet-saved",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge listing user",
                    "entity": "mge-listing-user",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge questions",
                    "entity": "mge-questions",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge social activity log",
                    "entity": "mge-social-activity-log",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge social activity log record",
                    "entity": "mge-social-activity-log-record",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge social event registration",
                    "entity": "mge-social-event-registration",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge social tag",
                    "entity": "mge-social-tag",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge-social-tweet-event",
                    "entity": "mge-social-tweet-event",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge team",
                    "entity": "mge-team",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet",
                    "entity": "mge-tweet",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet comment",
                    "entity": "mge-tweet-comment",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet engagement",
                    "entity": "mge-tweet-engagement",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet pin",
                    "entity": "mge-tweet-pin",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet saved",
                    "entity": "mge-tweet-saved",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet social file",
                    "entity": "mge-tweet-social-file",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet social image",
                    "entity": "mge-tweet-social-image",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet social news",
                    "entity": "mge-tweet-social-news",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet social videos",
                    "entity": "mge-tweet-social-videos",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge tweet social votes",
                    "entity": "mge-tweet-social-votes",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user answer",
                    "entity": "mge-user-answer",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user collecitons",
                    "entity": "mge-user-collections",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user exam result",
                    "entity": "mge-user-exam-result",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user follow",
                    "entity": "mge-user-follow",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user learning path",
                    "entity": "mge-user-learning-path",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user note",
                    "entity": "mge-user-note",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user rating",
                    "entity": "mge-user-rating",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user reports",
                    "entity": "mge-user-reports",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "mge user vote result",
                    "entity": "mge-user-vote-result",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Notification",
                    "entity": "notification",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Notification record",
                    "entity": "notification-record",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "page ai",
                    "entity": "page-ai",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Post",
                    "entity": "post",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Post Type",
                    "entity": "post-type",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Post Type Content",
                    "entity": "post-type-content",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Prompts Tree",
                    "entity": "prompts-tree",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Query sample",
                    "entity": "query-sample",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "queue job",
                    "entity": "queue-job",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Response",
                    "entity": "response",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Role Settings",
                    "entity": "role-settings",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "tags group field",
                    "entity": "tags-group-field",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Task",
                    "entity": "task",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Tenant",
                    "entity": "tenant",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "test create entity",
                    "entity": "test-create-entity",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "test log",
                    "entity": "test-log",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Tester",
                    "entity": "tester",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Testing",
                    "entity": "testing",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "topic",
                    "entity": "topic",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "user",
                    "entity": "user",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "user tenant level",
                    "entity": "user-tenant-level",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "user tenant level mapping",
                    "entity": "user-tenant-level-mapping",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "user tenant profile",
                    "entity": "user-tenant-profile",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "Validate",
                    "entity": "validate",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                },
                {
                    "title": "workflow-settings",
                    "entity": "workflow-settings",
                    "filter": [
                        "get-all",
                        "get",
                        "post",
                        "put",
                        "delete",
                        "get-all-self",
                        "get-self",
                        "post-self",
                        "put-self",
                        "delete-self"
                    ],
                    "access_field": null
                }
            ],
            "tenant_id": {
                "_id": "674028d2611a654e763a73e8",
                "title": "2bds",
                "is_active": true,
                "created_by": "6711e8a47b45b2974bd6133c",
                "updated_by": "6711e8a47b45b2974bd6133c",
                "created_at": "2024-11-22T06:46:42.269Z",
                "updated_at": "2025-04-21T06:50:50.360Z",
                "__v": 0,
                "settings": {
                    "logo": null,
                    "img_og": null,
                    "img_notfound": null,
                    "entities": null
                },
                "mge_setting": {
                    "setting_permissions": {
                        "setting_group_create": [
                            {
                                "_id": "6756b92243dcdc4a3eeef674",
                                "title": "User level 2",
                                "locale": null,
                                "locale_id": null,
                                "created_at": "2024-12-09T16:32:18.000Z",
                                "updated_at": "2024-12-09T16:33:14.000Z",
                                "created_by": "6711e8a47b45b2974bd6133c",
                                "tenant_id": "674028d2611a654e763a73e8",
                                "updated_by": "6711e8a47b45b2974bd6133c"
                            },
                            {
                                "_id": "6756b92b43dcdc4a3eeef677",
                                "title": "User level 3",
                                "locale": null,
                                "locale_id": null,
                                "created_at": "2024-12-09T16:32:27.000Z",
                                "updated_at": "2024-12-09T16:32:27.000Z",
                                "created_by": "6711e8a47b45b2974bd6133c",
                                "tenant_id": "674028d2611a654e763a73e8"
                            }
                        ]
                    }
                },
                "type": "public",
                "course_setting": {
                    "create_course": [
                        "6756b92b43dcdc4a3eeef677",
                        "6756b92243dcdc4a3eeef674"
                    ],
                    "create_question": [
                        "6756b92b43dcdc4a3eeef677",
                        "6756b92243dcdc4a3eeef674"
                    ]
                }
            }
        }
    ],
    "is_active": true,
    "created_at": "2025-02-05T09:46:27.741Z",
    "updated_at": "2025-06-27T03:02:17.401Z",
    "tenant_id": null,
    "id": "67a3337303679925e42bb4d8"
}