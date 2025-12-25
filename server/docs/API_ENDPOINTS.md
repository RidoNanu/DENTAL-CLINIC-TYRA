# REST API Endpoints

Complete API reference for the Dental Clinic Management System.

**Base URL:** `http://localhost:3001/api/v1`

---

## Patients API

### GET `/patients`
Get all patients.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "date_of_birth": "1990-01-15",
      "gender": "male",
      "address": "123 Main St",
      "medical_history": "No known allergies",
      "created_at": "2025-12-21T10:00:00Z"
    }
  ]
}
```

### GET `/patients/:id`
Get patient by ID.

**Parameters:**
- `id` (UUID) - Patient ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `400` - Invalid UUID format
- `404` - Patient not found

### POST `/patients`
Create new patient.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "date_of_birth": "1990-01-15",
  "gender": "male",
  "address": "123 Main St",
  "medical_history": "No known allergies"
}
```

**Validation:**
- `name` - Required string
- `email` - Required, valid email format
- `phone` - Required, 10-15 digits
- `date_of_birth` - Optional, ISO timestamp
- `gender` - Optional, enum: male, female, other
- `address` - Optional string
- `medical_history` - Optional string

**Response (201):**
```json
{
  "success": true,
  "data": { /* created patient */ }
}
```

**Errors:**
- `400` - Invalid input
- `409` - Email already exists

### PUT `/patients/:id`
Update patient.

**Parameters:**
- `id` (UUID) - Patient ID

**Request Body:** (all fields optional)
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated patient */ }
}
```

**Errors:**
- `400` - Invalid UUID or input
- `404` - Patient not found
- `409` - Email already exists

### DELETE `/patients/:id`
Delete patient.

**Parameters:**
- `id` (UUID) - Patient ID

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

**Errors:**
- `400` - Invalid UUID
- `404` - Patient not found
- `409` - Cannot delete patient with existing appointments

---

## Services API

### GET `/services`
Get all dental services.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dental Cleaning",
      "description": "Professional teeth cleaning",
      "price": 100.00,
      "duration": 30,
      "created_at": "2025-12-21T10:00:00Z"
    }
  ]
}
```

### GET `/services/:id`
Get service by ID.

**Parameters:**
- `id` (UUID) - Service ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dental Cleaning",
    "description": "Professional teeth cleaning",
    "price": 100.00,
    "duration": 30
  }
}
```

**Errors:**
- `400` - Invalid UUID format
- `404` - Service not found

### POST `/services`
Create new service.

**Request Body:**
```json
{
  "name": "Dental Cleaning",
  "description": "Professional teeth cleaning",
  "price": 100.00,
  "duration": 30
}
```

**Validation:**
- `name` - Required string
- `description` - Required string
- `price` - Required positive number
- `duration` - Required positive number (minutes)

**Response (201):**
```json
{
  "success": true,
  "data": { /* created service */ }
}
```

**Errors:**
- `400` - Invalid input
- `409` - Service name already exists

### PUT `/services/:id`
Update service.

**Parameters:**
- `id` (UUID) - Service ID

**Request Body:** (all fields optional)
```json
{
  "name": "Deep Cleaning",
  "price": 150.00
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated service */ }
}
```

**Errors:**
- `400` - Invalid UUID or input
- `404` - Service not found
- `409` - Service name already exists

### DELETE `/services/:id`
Delete service.

**Parameters:**
- `id` (UUID) - Service ID

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

**Errors:**
- `400` - Invalid UUID
- `404` - Service not found
- `409` - Cannot delete service with existing appointments

---

## Appointments API

### GET `/appointments`
Get all appointments (excludes cancelled).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "appointment_at": "2025-12-25T10:00:00Z",
      "end_time": "2025-12-25T10:30:00Z",
      "status": "scheduled",
      "notes": "First visit",
      "patients": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890"
      },
      "services": {
        "id": "uuid",
        "name": "Dental Cleaning",
        "duration": 30,
        "price": 100.00
      }
    }
  ]
}
```

### GET `/appointments/:id`
Get appointment by ID.

**Parameters:**
- `id` (UUID) - Appointment ID

**Response (200):**
```json
{
  "success": true,
  "data": { /* appointment with patient and service details */ }
}
```

**Errors:**
- `400` - Invalid UUID format
- `404` - Appointment not found

### POST `/appointments`
Create new appointment.

**Request Body:**
```json
{
  "patient_id": "uuid",
  "service_id": "uuid",
  "appointment_at": "2025-12-25T10:00:00Z",
  "status": "scheduled",
  "notes": "First visit"
}
```

**Validation:**
- `patient_id` - Required UUID
- `service_id` - Required UUID
- `appointment_at` - Required ISO timestamp (must be in future)
- `status` - Optional, enum: scheduled, confirmed, completed, cancelled
- `notes` - Optional string

**Business Logic:**
- Fetches service duration automatically
- Calculates end time automatically
- Checks for overlapping appointments
- Prevents booking if slot unavailable

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "appointment_at": "2025-12-25T10:00:00Z",
    "end_time": "2025-12-25T10:30:00Z",
    /* calculated from service duration */
  }
}
```

**Errors:**
- `400` - Invalid input or past date
- `404` - Patient or service not found
- `409` - Time slot unavailable

### PUT `/appointments/:id`
Update appointment.

**Parameters:**
- `id` (UUID) - Appointment ID

**Request Body:** (all fields optional)
```json
{
  "appointment_at": "2025-12-25T14:00:00Z",
  "status": "confirmed"
}
```

**Business Logic:**
- Recalculates end time if appointment_at or service_id changes
- Rechecks overlap (excluding current appointment)

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated appointment */ }
}
```

**Errors:**
- `400` - Invalid UUID or input
- `404` - Appointment not found
- `409` - Time slot unavailable

### DELETE `/appointments/:id`
Cancel appointment (soft delete).

**Parameters:**
- `id` (UUID) - Appointment ID

**Behavior:**
- Does NOT remove row
- Updates status to 'cancelled'
- Frees up time slot

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

**Errors:**
- `400` - Invalid UUID
- `404` - Appointment not found

---

## Health Check

### GET `/health`
Server health check.

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-21T13:30:00.000Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Testing with cURL

### Create Patient
```bash
curl -X POST http://localhost:3001/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }'
```

### Get All Patients
```bash
curl http://localhost:3001/api/v1/patients
```

### Create Service
```bash
curl -X POST http://localhost:3001/api/v1/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dental Cleaning",
    "description": "Professional teeth cleaning",
    "price": 100,
    "duration": 30
  }'
```

### Create Appointment
```bash
curl -X POST http://localhost:3001/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient-uuid-here",
    "service_id": "service-uuid-here",
    "appointment_at": "2025-12-25T10:00:00Z"
  }'
```

---

## Notes

- All UUIDs are validated before database queries
- All timestamps use ISO 8601 format
- Cancelled appointments are excluded from GET /appointments but still accessible by ID
- Soft delete preserves appointment history
- Appointments automatically calculate end_time based on service duration
- Overlap detection prevents double-booking
