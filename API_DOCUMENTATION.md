# Logistics AI Workflow Builder - API Documentation

## 🚀 Quick Start

Base URL: `http://localhost:3000/api`

All endpoints return JSON responses with the following structure:
```json
{
  "success": boolean,
  "data": object,
  "error": string (if success: false)
}
```

---

## 📋 Workflow Management

### Create Workflow
**POST** `/workflows/create`

Generate a new workflow from natural language prompt.

**Request Body:**
```json
{
  "prompt": "Check inventory levels for electronics and clothing",
  "provider": "claude"
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-1234567890",
    "name": "Inventory Level Check",
    "description": "Check inventory levels for electronics and clothing",
    "template_id": "inventory-management",
    "template_name": "Inventory Management",
    "intent": {
      "type": "inventory",
      "category": "inventory",
      "entities": ["electronics", "clothing"],
      "confidence": 0.95
    },
    "parameters": [
      {
        "name": "product_categories",
        "type": "multi-select",
        "label": "Product Categories",
        "required": true,
        "options": ["electronics", "clothing", "home_goods"]
      }
    ],
    "steps": [
      {
        "id": "fetch-inventory-data",
        "name": "Fetch Current Inventory Levels",
        "type": "mock-api-call",
        "status": "pending"
      }
    ],
    "metadata": {
      "created_at": "2025-08-23T16:24:25.000Z",
      "estimated_duration": "3-5 minutes"
    }
  }
}
```

### Get Workflow
**GET** `/workflows/{id}`

**Response:**
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-1234567890",
    "name": "Inventory Level Check",
    "description": "Check inventory levels for electronics and clothing",
    "template_id": "inventory-management",
    "steps": [...],
    "metadata": {...}
  }
}
```

### Update Workflow
**PUT** `/workflows/{id}`

**Request Body:**
```json
{
  "name": "Updated Inventory Check",
  "description": "Updated description",
  "metadata": {
    "updated_reason": "Parameter adjustment"
  }
}
```

### Delete Workflow
**DELETE** `/workflows/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Workflow deleted successfully"
}
```

### List Workflows
**GET** `/workflows/list`

**Query Parameters:**
- `category` - Filter by workflow category
- `template_id` - Filter by template ID
- `status` - Filter by workflow status
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "workflows": [
    {
      "id": "workflow-1234567890",
      "name": "Inventory Level Check",
      "template_name": "Inventory Management",
      "category": "inventory",
      "status": "active",
      "parameter_count": 3,
      "step_count": 6,
      "created_at": "2025-08-23T16:24:25.000Z",
      "estimated_duration": "3-5 minutes"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "has_more": false
  },
  "available_templates": [...]
}
```

---

## ⚙️ Workflow Execution

### Execute Workflow
**POST** `/workflows/{id}/execute`

Execute a workflow with specified parameters.

**Request Body:**
```json
{
  "parameters": {
    "product_categories": ["electronics", "clothing"],
    "reorder_threshold": 100,
    "notification_email": "manager@company.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "execution": {
    "id": "exec-9876543210",
    "workflow_id": "workflow-1234567890",
    "status": "completed",
    "start_time": "2025-08-23T16:25:00.000Z",
    "end_time": "2025-08-23T16:27:30.000Z",
    "parameters": {
      "product_categories": ["electronics", "clothing"],
      "reorder_threshold": 100,
      "notification_email": "manager@company.com"
    },
    "results": {
      "fetch-inventory-data": {
        "electronics": {
          "current_stock": 245,
          "reorder_point": 100,
          "status": "sufficient"
        },
        "clothing": {
          "current_stock": 89,
          "reorder_point": 150,
          "status": "low_stock"
        }
      }
    },
    "logs": [
      "Started workflow execution",
      "Fetching inventory data for electronics, clothing",
      "Processing inventory levels",
      "Checking reorder thresholds",
      "Sending low stock alert for clothing",
      "Workflow completed successfully"
    ]
  }
}
```

### Get Execution Status
**GET** `/workflows/{id}/status?execution_id={execution_id}`

**Response:**
```json
{
  "success": true,
  "execution": {
    "id": "exec-9876543210",
    "workflow_id": "workflow-1234567890",
    "status": "running",
    "progress": 60,
    "current_step": "process-inventory-data",
    "total_steps": 6,
    "start_time": "2025-08-23T16:25:00.000Z",
    "duration": 90000,
    "step_results": {...},
    "logs": [...]
  }
}
```

### Get Workflow Status (All Executions)
**GET** `/workflows/{id}/status`

**Response:**
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-1234567890",
    "name": "Inventory Level Check",
    "status": "active",
    "last_executed": "2025-08-23T16:25:00.000Z"
  },
  "recent_executions": [
    {
      "id": "exec-9876543210",
      "status": "completed",
      "start_time": "2025-08-23T16:25:00.000Z",
      "end_time": "2025-08-23T16:27:30.000Z",
      "duration": 150000
    }
  ],
  "statistics": {
    "total_executions": 5,
    "successful_executions": 4,
    "failed_executions": 1,
    "running_executions": 0,
    "avg_duration": 145000
  }
}
```

---

## 🔧 Configuration Management

### Get Workflow Configuration
**GET** `/workflows/{id}/configure`

**Response:**
```json
{
  "success": true,
  "parameters": [
    {
      "name": "product_categories",
      "type": "multi-select",
      "label": "Product Categories",
      "required": true,
      "default": ["electronics"],
      "options": ["electronics", "clothing", "home_goods", "books", "automotive"]
    },
    {
      "name": "reorder_threshold",
      "type": "number",
      "label": "Reorder Threshold",
      "required": false,
      "default": 100,
      "min": 1,
      "max": 1000
    }
  ],
  "configured_parameters": {
    "product_categories": ["electronics", "clothing"],
    "reorder_threshold": 150
  },
  "parameter_schema": [...]
}
```

### Update Workflow Configuration
**PUT** `/workflows/{id}/configure`

**Request Body:**
```json
{
  "parameters": {
    "product_categories": ["electronics", "clothing", "home_goods"],
    "reorder_threshold": 200,
    "notification_email": "updated@company.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-1234567890",
    "configured_parameters": {
      "product_categories": ["electronics", "clothing", "home_goods"],
      "reorder_threshold": 200,
      "notification_email": "updated@company.com"
    },
    "metadata": {
      "configured_at": "2025-08-23T16:30:00.000Z",
      "parameter_count": 3
    }
  },
  "message": "Workflow parameters updated successfully"
}
```

---

## 📋 Template Management

### Get Templates
**GET** `/templates`

**Query Parameters:**
- `category` - Filter by template category
- `id` - Get specific template by ID

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "inventory-management",
      "name": "Inventory Management",
      "description": "Monitor inventory levels and automate reorder processes",
      "category": "inventory",
      "parameter_count": 3,
      "step_count": 6,
      "integration_count": 3,
      "required_integrations": ["inventory_api", "notification_service"],
      "sample_parameters": [
        {
          "name": "product_categories",
          "type": "multi-select",
          "label": "Product Categories",
          "required": true
        }
      ]
    },
    {
      "id": "shipment-tracking",
      "name": "Shipment Tracking",
      "description": "Track shipments across multiple carriers and notify customers",
      "category": "shipment",
      "parameter_count": 4,
      "step_count": 7,
      "integration_count": 4,
      "required_integrations": ["fedex_api", "ups_api", "email_service"]
    }
  ],
  "categories": ["inventory", "shipment", "supplier", "demand"],
  "total_templates": 4
}
```

### Get Specific Template
**GET** `/templates?id=inventory-management`

**Response:**
```json
{
  "success": true,
  "template": {
    "id": "inventory-management",
    "name": "Inventory Management",
    "description": "Monitor inventory levels and automate reorder processes",
    "category": "inventory",
    "parameters": [
      {
        "name": "product_categories",
        "type": "multi-select",
        "label": "Product Categories",
        "options": ["electronics", "clothing", "home_goods", "books", "automotive"],
        "required": true,
        "default": ["electronics"]
      }
    ],
    "steps": [
      {
        "id": "fetch-inventory-data",
        "type": "mock-api-call",
        "name": "Fetch Current Inventory Levels",
        "config": {
          "mock_data_key": "inventory_levels",
          "params": {
            "categories": "{{product_categories}}"
          }
        }
      }
    ],
    "integrations": [
      {
        "name": "inventory_api",
        "type": "rest",
        "required": true
      }
    ],
    "output_schema": {
      "success": "boolean",
      "categories_checked": "number",
      "low_stock_items": "number",
      "reorder_recommendations": "array"
    },
    "parameter_count": 3,
    "step_count": 6,
    "integration_count": 3
  }
}
```

---

## 📊 Execution Management

### Get Execution Details
**GET** `/executions/{id}`

**Response:**
```json
{
  "success": true,
  "execution": {
    "id": "exec-9876543210",
    "workflow_id": "workflow-1234567890",
    "status": "completed",
    "progress": 100,
    "current_step": "generate-final-report",
    "total_steps": 6,
    "start_time": "2025-08-23T16:25:00.000Z",
    "end_time": "2025-08-23T16:27:30.000Z",
    "duration": 150000,
    "parameters": {
      "product_categories": ["electronics", "clothing"],
      "reorder_threshold": 100
    },
    "step_results": {
      "fetch-inventory-data": {
        "electronics": {
          "current_stock": 245,
          "reorder_point": 100,
          "status": "sufficient"
        }
      },
      "process-inventory-data": {
        "total_categories": 2,
        "low_stock_count": 1,
        "reorder_needed": true
      }
    },
    "error": null,
    "logs": [
      "2025-08-23T16:25:00.000Z - Started workflow execution",
      "2025-08-23T16:25:05.000Z - Fetching inventory data",
      "2025-08-23T16:25:15.000Z - Processing inventory levels",
      "2025-08-23T16:27:30.000Z - Workflow completed successfully"
    ]
  }
}
```

### Delete Execution
**DELETE** `/executions/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Execution deleted successfully"
}
```

---

## 🔍 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Prompt is required"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Workflow not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to create workflow",
  "details": "AI provider not configured"
}
```

### Status Codes
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Resource not found
- `500` - Internal server error

---

## 📝 Integration Examples

### cURL Examples

#### Create Workflow
```bash
curl -X POST http://localhost:3000/api/workflows/create \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Track shipments for orders placed in the last week"
  }'
```

#### Execute Workflow
```bash
curl -X POST http://localhost:3000/api/workflows/workflow-123/execute \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "tracking_numbers": ["TRK123456789", "UPS987654321"],
      "customer_email": "customer@example.com"
    }
  }'
```

### JavaScript SDK Example
```javascript
const LogisticsAPI = {
  baseURL: 'http://localhost:3000/api',
  
  async createWorkflow(prompt) {
    const response = await fetch(`${this.baseURL}/workflows/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    return response.json();
  },
  
  async executeWorkflow(workflowId, parameters) {
    const response = await fetch(`${this.baseURL}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters })
    });
    return response.json();
  }
};

// Usage
const workflow = await LogisticsAPI.createWorkflow(
  "Check inventory levels for electronics"
);

const execution = await LogisticsAPI.executeWorkflow(workflow.workflow.id, {
  product_categories: ["electronics"],
  reorder_threshold: 100
});
```

---

## 🔐 Authentication (Future)

Currently, the API operates without authentication for development purposes. In production, implement:

- JWT token-based authentication
- API key authentication for B2B integrations
- Role-based access control (RBAC)
- Rate limiting per user/organization

---

*Last Updated: 2025-08-23*
*Version: 1.0.0*
