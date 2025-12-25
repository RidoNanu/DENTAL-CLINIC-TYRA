# Input Validation Guide

## Overview
Comprehensive input validation system without external libraries. All validators throw `ApiError(400, message)` on failure.

---

## Validation Functions

Located in [`validators.js`](file:///Users/araara/Desktop/Dental/server/src/utils/validators.js)

### Available Validators

| Function | Purpose | Example |
|----------|---------|---------|
| `validateUUID()` | Validate UUID v4 format | Patient IDs, Service IDs |
| `validateEmail()` | Validate email format (RFC 5322) | Patient email |
| `validatePhone()` | Validate phone (10-15 digits) | Patient phone |
| `validateTimestamp()` | Validate ISO 8601 timestamp | Appointment datetime |
| `validateRequired()` | Validate required string | Name, address |
| `validateEnum()` | Validate enum value | Status, gender |
| `validatePositiveNumber()` | Validate positive number | Price, duration |

---

## Usage in Controllers

### Example 1: Manual Validation

```javascript
const { validateUUID, validateEmail, validatePhone } = require('../utils/validators');
const ApiError = require('../utils/apiError');

const createPatient = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    
    // Validate inputs
    validateRequired(name, 'Name');
    validateEmail(email);
    validatePhone(phone);
    
    // Create patient
    const patient = await patientService.create(req.body);
    
    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error); // Error middleware handles it
  }
};
```

### Example 2: Using Validation Middleware

```javascript
const router = require('express').Router();
const { validateUUIDParam, validatePatientData } = require('../middlewares/validation.middleware');
const controller = require('../controllers/patient.controller');

// Validation runs before controller
router.post('/', validatePatientData, controller.create);
router.get('/:id', validateUUIDParam('id'), controller.getById);
router.put('/:id', validateUUIDParam('id'), validatePatientData, controller.update);
```

---

## Validation Rules

### UUID Format
```javascript
validateUUID('123e4567-e89b-42d3-a456-426614174000', 'patient_id');
// ✓ Valid UUID v4 format
```

### Email Format
```javascript
validateEmail('user@example.com');
// ✓ Valid: user@example.com
// ✗ Invalid: user.example.com (no @)
// ✗ Invalid: @example.com (no local part)
```

### Phone Number
```javascript
validatePhone('1234567890');       // ✓ Valid (10 digits)
validatePhone('123-456-7890');     // ✓ Valid (formatting removed)
validatePhone('12345678901234');   // ✓ Valid (14 digits)
validatePhone('123456789012345');  // ✓ Valid (15 digits)
validatePhone('123');              // ✗ Invalid (too short)
validatePhone('1234567890123456'); // ✗ Invalid (too long)
```

### Timestamp (ISO 8601)
```javascript
// Future dates for new appointments
validateTimestamp('2025-12-25T10:00:00Z', true);
// ✓ Valid if date is in future
// ✗ Throws if date is in past

// Any valid timestamp (for records)
validateTimestamp('2023-01-15T14:30:00Z', false);
// ✓ Valid regardless of past/future
```

### Enum Values
```javascript
validateEnum('male', ['male', 'female', 'other'], 'Gender');
// ✓ Valid: 'male' is in allowed values
// ✗ Invalid: 'unknown' is not allowed
```

---

## Validation Middleware Reference

Located in [`validation.middleware.js`](file:///Users/araara/Desktop/Dental/server/src/middlewares/validation.middleware.js)

### Patient Validation

**`validatePatientData`** - For POST/PUT `/patients`
- ✓ Validates: name, email, phone (required)
- ✓ Validates: gender (enum), date_of_birth (optional)

### Service Validation

**`validateServiceData`** - For POST/PUT `/services`
- ✓ Validates: name, description (required strings)
- ✓ Validates: price, duration (positive numbers)

### Appointment Validation

**`validateAppointmentData`** - For POST `/appointments`
- ✓ Validates: patient_id, service_id (UUIDs)
- ✓ Validates: appointment_at (future timestamp)
- ✓ Validates: status (enum, optional)

**`validateAppointmentUpdateData`** - For PUT `/appointments/:id`
- ✓ All fields optional
- ✓ appointment_at can be past (for completed appointments)

### UUID Parameter Validation

**`validateUUIDParam(paramName)`** - For route params
```javascript
router.get('/patients/:id', validateUUIDParam('id'), controller.getById);
// Automatically validates req.params.id is a valid UUID
```

---

## Error Responses

All validation errors return consistent format:

```json
{
  "success": false,
  "message": "Invalid email format"
}
```

**Common validation errors:**
- `"Invalid ID format"` - UUID validation failed
- `"Email is required"` - Missing email
- `"Invalid email format"` - Email regex failed
- `"Phone number must be 10-15 digits"` - Phone validation failed
- `"Appointment time must be in the future"` - Past timestamp for new appointment
- `"Invalid Status. Allowed values: scheduled, confirmed, completed, cancelled"` - Enum validation failed

---

## Testing

Run the validation test suite:
```bash
node src/utils/validators.test.js
```

**Test Results (All Passing):**
```
✓ UUID Validation
✓ Email Validation
✓ Phone Validation
✓ Timestamp Validation
✓ Enum Validation
✓ Positive Number Validation
```

---

## Best Practices

1. **Always validate at the controller level** (not in services)
2. **Use middleware for route-level validation** (cleaner code)
3. **Throw ApiError(400, message)** for consistency
4. **Use descriptive field names** in error messages
5. **Validate UUIDs in route params** before database queries
6. **Require future dates** for new appointments only

---

## Integration Example

Complete example showing validation in action:

```javascript
// Route definition
router.post(
  '/appointments',
  validateAppointmentData,
  appointmentController.create
);

// Controller
const create = async (req, res, next) => {
  try {
    // Validation already done by middleware
    const appointment = await appointmentService.create(req.body);
    
    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Service
const create = async (data) => {
  // No validation here - just business logic
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert(data)
    .select()
    .single();
  
  if (error) {
    throw ApiError.internal('Failed to create appointment');
  }
  
  return appointment;
};
```

**Flow:**
1. Request → Route
2. Validation middleware runs
3. If invalid → Error middleware → JSON response
4. If valid → Controller → Service → Success response
