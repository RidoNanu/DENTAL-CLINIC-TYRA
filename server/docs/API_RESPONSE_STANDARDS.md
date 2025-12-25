# API Response Standards

## Overview
All API endpoints follow a consistent response format for both success and error cases.

---

## Success Response Format

**Standard:**
```json
{
  "success": true,
  "data": <any>
}
```

### Rules
1. **Always include `success: true`** for successful responses
2. **Always include `data` field** (even if `null`)
3. **Use appropriate HTTP status codes**
4. **Business logic returns raw data**, controllers wrap it

---

## Success Response Examples

### GET Single Resource
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-42d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### GET Collection
```json
{
  "success": true,
  "data": [
    { "id": "uuid1", "name": "Item 1" },
    { "id": "uuid2", "name": "Item 2" }
  ]
}
```

### POST/PUT (Created/Updated Resource)
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-42d3-a456-426614174000",
    "name": "New Item",
    "createdAt": "2025-12-21T13:30:00Z"
  }
}
```

### DELETE (No Content)
```json
{
  "success": true,
  "data": null
}
```

---

## Error Response Format

**Standard:**
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### Error Examples

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Patient not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Time slot unavailable"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to create appointment"
}
```

---

## Controller Pattern

### Standard Implementation

```javascript
const create = async (req, res, next) => {
  try {
    // Service returns raw data (no wrapping)
    const item = await itemService.create(req.body);
    
    // Controller wraps in standard format
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    // Error middleware handles error formatting
    next(error);
  }
};
```

### All CRUD Operations

```javascript
// GET /items
const getAll = async (req, res, next) => {
  try {
    const items = await itemService.getAll();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

// GET /items/:id
const getById = async (req, res, next) => {
  try {
    const item = await itemService.getById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// POST /items
const create = async (req, res, next) => {
  try {
    const item = await itemService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// PUT /items/:id
const update = async (req, res, next) => {
  try {
    const item = await itemService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// DELETE /items/:id
const deleteItem = async (req, res, next) => {
  try {
    await itemService.delete(req.params.id);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
```

---

## HTTP Status Codes

| Code | Usage | Response |
|------|-------|----------|
| 200 | Successful GET, PUT, DELETE | `{ success: true, data: ... }` |
| 201 | Successful POST (Created) | `{ success: true, data: ... }` |
| 400 | Bad Request | `{ success: false, message: ... }` |
| 401 | Unauthorized | `{ success: false, message: ... }` |
| 403 | Forbidden | `{ success: false, message: ... }` |
| 404 | Not Found | `{ success: false, message: ... }` |
| 409 | Conflict | `{ success: false, message: ... }` |
| 500 | Internal Server Error | `{ success: false, message: ... }` |

---

## Service Layer Pattern

**Services return raw data, NOT formatted responses:**

```javascript
// ✅ CORRECT
const create = async (data) => {
  const { data: item, error } = await supabase
    .from('items')
    .insert(data)
    .select()
    .single();
  
  if (error) {
    throw ApiError.internal('Failed to create item');
  }
  
  return item; // ✓ Return raw data
};

// ❌ WRONG
const create = async (data) => {
  const { data: item, error } = await supabase
    .from('items')
    .insert(data)
    .select()
    .single();
  
  if (error) {
    throw ApiError.internal('Failed to create item');
  }
  
  // ✗ DON'T wrap in response format
  return { success: true, data: item };
};
```

---

## Client-Side Usage

### JavaScript/TypeScript

```typescript
// Type definition
interface ApiResponse<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  message: string;
}

// Usage
const response = await fetch('/api/v1/appointments');
const json = await response.json();

if (json.success) {
  console.log('Data:', json.data);
} else {
  console.error('Error:', json.message);
}
```

### React Example

```javascript
const [appointments, setAppointments] = useState([]);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/api/v1/appointments')
    .then(res => res.json())
    .then(json => {
      if (json.success) {
        setAppointments(json.data);
      } else {
        setError(json.message);
      }
    });
}, []);
```

---

## Benefits

✅ **Consistency** - All endpoints use same format  
✅ **Type Safety** - Easy to create TypeScript types  
✅ **Client Simplicity** - Simple `if (json.success)` check  
✅ **Error Handling** - Always know where error message is  
✅ **Debugging** - Easy to spot non-standard responses

---

## Checklist for New Controllers

- [ ] All GET endpoints return `{ success: true, data: ... }`
- [ ] All POST endpoints return `{ success: true, data: ... }` with status 201
- [ ] All PUT endpoints return `{ success: true, data: ... }`
- [ ] All DELETE endpoints return `{ success: true, data: null }`
- [ ] All errors use `next(error)` (error middleware handles formatting)
- [ ] Services return raw data (no response wrapping)
- [ ] No `console.log` in production code
