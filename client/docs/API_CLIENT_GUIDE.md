# Frontend API Client Guide

## Overview

The frontend uses a centralized API client to communicate with the backend REST API. **No direct Supabase database access from frontend.**

---

## Architecture

```
Frontend Components
    ↓
API Services (patientService.js, etc.)
    ↓
API Client (apiClient.js)
    ↓ HTTP + JWT Token
Backend REST API
    ↓
Supabase Database
```

**Key principle:** Frontend NEVER touches the database directly.

---

## API Client Features

### ✅ Automatic JWT Token Attachment
- Reads token from Supabase auth session
- Attaches to `Authorization: Bearer <token>` header
- No manual token management needed

### ✅ Global Error Handling
- **401 Unauthorized** → Auto sign out + redirect to login
- **403 Forbidden** → Shows access denied error
- **Other errors** → Throws with error message

### ✅ Consistent Response Format
All responses follow:
```javascript
{
  success: true,
  data: { ... }  // or array
}
```

---

## Usage Examples

### 1. Import Service

```javascript
import { getPatients, createPatient } from '../services/patientService';
```

### 2. Fetch Data

```javascript
// Get all patients
const patients = await getPatients();

// With pagination
const patients = await getPatients({ page: 1, limit: 20 });

// With search
const patients = await getPatients({ search: 'john' });
```

### 3. Create Data

```javascript
const newPatient = await createPatient({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  gender: 'male',
});
```

### 4. Update Data

```javascript
const updated = await updatePatient(patientId, {
  name: 'Jane Doe',
  email: 'jane@example.com',
});
```

### 5. Delete Data

```javascript
await deletePatient(patientId);
```

---

## React Component Example

### Using useState + useEffect

```javascript
import React, { useState, useEffect } from 'react';
import { getPatients, deletePatient } from '../services/patientService';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      // Refresh list
      await fetchPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {patients.map(patient => (
        <div key={patient.id}>
          <h3>{patient.name}</h3>
          <button onClick={() => handleDelete(patient.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

---

## Available API Services

### Patient Service (`patientService.js`)

```javascript
import { 
  getPatients,    // Get all patients (paginated, searchable)
  getPatient,     // Get patient by ID
  createPatient,  // Create new patient
  updatePatient,  // Update patient
  deletePatient   // Delete patient
} from '../services/patientService';

// Examples
await getPatients({ page: 1, limit: 20, search: 'john' });
await getPatient('patient-id');
await createPatient({ name, email, phone });
await updatePatient('patient-id', { name: 'New Name' });
await deletePatient('patient-id');
```

### Service Service (`serviceService.js`)

```javascript
import { 
  getServices,   // Get all services (paginated)
  getService,    // Get service by ID
  createService, // Create new service
  updateService, // Update service
  deleteService  // Delete service
} from '../services/serviceService';

// Examples
await getServices({ page: 1, limit: 20 });
await getService('service-id');
await createService({ name, description, price, duration });
await updateService('service-id', { price: 150 });
await deleteService('service-id');
```

### Appointment Service (`appointmentService.js`)

```javascript
import { 
  getAppointments,    // Get all appointments (paginated, date filtered)
  getAppointment,     // Get appointment by ID
  createAppointment,  // Create new appointment
  updateAppointment,  // Update appointment
  deleteAppointment   // Cancel appointment (soft delete)
} from '../services/appointmentService';

// Examples
await getAppointments({ 
  page: 1, 
  limit: 20,
  startDate: '2025-01-01',
  endDate: '2025-12-31'
});

await getAppointment('appointment-id');

await createAppointment({
  patient_id: 'patient-uuid',
  service_id: 'service-uuid',
  appointment_at: '2025-12-25T10:00:00Z',
  notes: 'First visit'
});

await updateAppointment('appointment-id', { 
  status: 'confirmed' 
});

await deleteAppointment('appointment-id'); // Sets status to 'cancelled'
```

---

## Custom Hook Example

Create reusable hooks for common patterns:

```javascript
// hooks/usePatients.js
import { useState, useEffect } from 'react';
import { getPatients } from '../services/patientService';

export const usePatients = (options = {}) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPatients(options);
        setPatients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [options.page, options.search]); // Re-fetch when params change

  return { patients, loading, error };
};

// Usage in component
const { patients, loading, error } = usePatients({ page: 1, search: 'john' });
```

---

## Error Handling

### Automatic Handling (401/403)

```javascript
// 401 Unauthorized - User signed out automatically
try {
  await getPatients();
} catch (err) {
  // Already redirected to /admin/login
  // Error: "Authentication required"
}

// 403 Forbidden - Access denied
try {
  await createPatient({ ... });
} catch (err) {
  console.error(err.message); // "Admin access required"
}
```

### Manual Error Handling

```javascript
const handleSubmit = async (formData) => {
  try {
    await createPatient(formData);
    alert('Patient created successfully');
  } catch (error) {
    // Show user-friendly error
    if (error.message.includes('already exists')) {
      setError('Email already registered');
    } else {
      setError('Failed to create patient');
    }
  }
};
```

---

## Pagination Example

```javascript
const [page, setPage] = useState(1);
const [patients, setPatients] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const data = await getPatients({ page, limit: 20 });
    setPatients(data);
  };
  fetchData();
}, [page]);

// In UI
<button onClick={() => setPage(page - 1)}>Previous</button>
<button onClick={() => setPage(page + 1)}>Next</button>
```

---

## Search Example

```javascript
const [search, setSearch] = useState('');
const [patients, setPatients] = useState([]);

// Debounced search
useEffect(() => {
  const timer = setTimeout(async () => {
    if (search) {
      const data = await getPatients({ search });
      setPatients(data);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [search]);

// In UI
<input 
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search patients..."
/>
```

---

## Date Filtering (Appointments)

```javascript
const [startDate, setStartDate] = useState('2025-01-01');
const [endDate, setEndDate] = useState('2025-12-31');
const [appointments, setAppointments] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const data = await getAppointments({ startDate, endDate });
    setAppointments(data);
  };
  fetchData();
}, [startDate, endDate]);
```

---

## Important Rules

### ✅ DO

- Use API services for ALL data operations
- Handle loading states
- Handle error states
- Show user feedback on success/error
- Use pagination for large datasets
- Debounce search inputs

### ❌ DON'T

- Import Supabase client for data operations
- Use `supabase.from('table')` anywhere
- Access database directly from frontend
- Store sensitive data in component state
- Skip error handling

---

## Environment Variables

Add to `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Production:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

---

## Complete Example: CRUD Component

```javascript
import React, { useState, useEffect } from 'react';
import { 
  getPatients, 
  createPatient, 
  updatePatient, 
  deletePatient 
} from '../services/patientService';

const PatientManager = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePatient(editingId, formData);
      } else {
        await createPatient(formData);
      }
      
      // Reset form and refresh
      setFormData({ name: '', email: '', phone: '' });
      setEditingId(null);
      await fetchPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (confirm('Delete patient?')) {
      try {
        await deletePatient(id);
        await fetchPatients();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Edit
  const handleEdit = (patient) => {
    setFormData({ 
      name: patient.name, 
      email: patient.email, 
      phone: patient.phone 
    });
    setEditingId(patient.id);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Name"
          required
        />
        <input 
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Email"
          required
        />
        <input 
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="Phone"
          required
        />
        <button type="submit">
          {editingId ? 'Update' : 'Create'}
        </button>
      </form>

      <ul>
        {patients.map(patient => (
          <li key={patient.id}>
            {patient.name} - {patient.email}
            <button onClick={() => handleEdit(patient)}>Edit</button>
            <button onClick={() => handleDelete(patient.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## Troubleshooting

### "No token provided" error
- User not logged in
- Check auth state before making requests

### "Invalid or expired token"
- Token expired (auto-refreshed by Supabase)
- User will be redirected to login

### CORS errors
- Check backend CORS configuration
- Ensure API_BASE_URL is correct

### TypeError: Cannot read property 'data'
- API returned error instead of success
- Check error handling in try/catch

---

**Remember:** Frontend is a presentation layer. All business logic happens in the backend! 🎯
