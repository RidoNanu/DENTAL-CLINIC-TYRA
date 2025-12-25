# API Pagination and Filtering Guide

## Overview
All GET list endpoints support pagination and filtering via query parameters to improve performance and user experience.

---

## Pagination

### Query Parameters

**`page`** (optional) - Page number (default: 1)
- Must be positive integer
- First page is 1, not 0

**`limit`** (optional) - Items per page (default: 20)
- Must be positive integer
- Recommended max: 100

### Example Usage

```javascript
// Get first page (default 20 items)
GET /api/v1/patients

// Get page 2 with 20 items
GET /api/v1/patients?page=2

// Get 50 items per page
GET /api/v1/patients?limit=50

// Get page 3 with 10 items per page
GET /api/v1/patients?page=3&limit=10
```

### Response Format

**No changes to response structure!** Data is still returned as array:

```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "John Doe" },
    { "id": "...", "name": "Jane Smith" }
  ]
}
```

### Calculation

```javascript
// Offset calculation
offset = (page - 1) * limit

// Examples:
// page=1, limit=20 -> offset=0, range: 0-19
// page=2, limit=20 -> offset=20, range: 20-39
// page=3, limit=10 -> offset=20, range: 20-29
```

---

## Patients API

### Pagination + Search

**Endpoint:** `GET /api/v1/patients`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term for name or email (case-insensitive)

**Examples:**

```bash
# Get all patients (page 1, 20 items)
GET /api/v1/patients

# Search by name
GET /api/v1/patients?search=john

# Search by email
GET /api/v1/patients?search=john@example.com

# Search with pagination
GET /api/v1/patients?search=smith&page=2&limit=10

# Just pagination
GET /api/v1/patients?page=1&limit=50
```

**Search Behavior:**
- Case-insensitive (`ILIKE`)
- Searches both `name` AND `email` fields
- Partial match (contains)

**Examples:**
```
search=john    -> matches "John Doe", "Johnny", "john@example.com"
search=@gmail  -> matches any email with @gmail
search=smith   -> matches "John Smith", "smith@example.com"
```

---

## Services API

### Pagination

**Endpoint:** `GET /api/v1/services`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Examples:**

```bash
# Get all services (page 1, 20 items)
GET /api/v1/services

# Get page 2
GET /api/v1/services?page=2

# Get 50 items
GET /api/v1/services?limit=50

# Page 3 with 10 items
GET /api/v1/services?page=3&limit=10
```

**Note:** Services are sorted alphabetically by name.

---

## Appointments API

### Pagination + Date Filtering

**Endpoint:** `GET /api/v1/appointments`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `startDate` - Filter appointments >= this date (ISO 8601 format)
- `endDate` - Filter appointments <= this date (ISO 8601 format)

**Examples:**

```bash
# Get all appointments (page 1, 20 items)
GET /api/v1/appointments

# Filter by date range
GET /api/v1/appointments?startDate=2025-01-01&endDate=2025-12-31

# Future appointments only
GET /api/v1/appointments?startDate=2025-12-21T00:00:00Z

# Past appointments only
GET /api/v1/appointments?endDate=2025-12-20T23:59:59Z

# This week with pagination
GET /api/v1/appointments?startDate=2025-12-15&endDate=2025-12-21&page=1&limit=50

# Just pagination
GET /api/v1/appointments?page=2&limit=10
```

**Date Format:**
- ISO 8601: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
- Examples: `2025-12-21` or `2025-12-21T10:00:00Z`

**Filtering Logic:**
- `startDate` → `appointment_at >= startDate` (inclusive)
- `endDate` → `appointment_at <= endDate` (inclusive)
- Both can be used together for range

**Note:** 
- Cancelled appointments are always excluded
- Results sorted by `appointment_at` ascending (earliest first)

---

## Implementation Details

### Patient Service

```javascript
const getAll = async (options = {}) => {
  const { page = 1, limit = 20, search = '' } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' });

  // Search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  // Pagination
  const { data } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return data;
};
```

### Service Service

```javascript
const getAll = async (options = {}) => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  const { data } = await supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  return data;
};
```

### Appointment Service

```javascript
const getAll = async (options = {}) => {
  const { page = 1, limit = 20, startDate, endDate } = options;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('appointments')
    .select('*, patients(...), services(...)')
    .neq('status', 'cancelled');

  // Date filters
  if (startDate) query = query.gte('appointment_at', startDate);
  if (endDate) query = query.lte('appointment_at', endDate);

  // Pagination
  const { data } = await query
    .order('appointment_at', { ascending: true })
    .range(offset, offset + limit - 1);

  return data;
};
```

---

## Frontend Integration

### React Example

```javascript
const [patients, setPatients] = useState([]);
const [page, setPage] = useState(1);
const [search, setSearch] = useState('');

useEffect(() => {
  const fetchPatients = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search }),
    });

    const response = await fetch(
      `http://localhost:3001/api/v1/patients?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const json = await response.json();
    if (json.success) {
      setPatients(json.data);
    }
  };

  fetchPatients();
}, [page, search]);
```

### Axios Example

```javascript
const fetchAppointments = async (startDate, endDate, page = 1) => {
  const { data } = await api.get('/appointments', {
    params: {
      page,
      limit: 20,
      startDate,
      endDate,
    },
  });

  return data.data; // Extract array from { success: true, data: [] }
};

// Usage
const appointments = await fetchAppointments('2025-01-01', '2025-12-31');
```

---

## Testing

### cURL Examples

**Patients with search:**
```bash
curl "http://localhost:3001/api/v1/patients?search=john&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Services with pagination:**
```bash
curl "http://localhost:3001/api/v1/services?page=2&limit=5"
```

**Appointments with date filter:**
```bash
curl "http://localhost:3001/api/v1/appointments?startDate=2025-12-01&endDate=2025-12-31&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Performance Considerations

### Best Practices

✅ **DO:**
- Use pagination for large datasets
- Set reasonable `limit` values (10-100)
- Index database columns used in filters
- Cache responses when appropriate

❌ **DON'T:**
- Request all data at once (no pagination)
- Use extremely large `limit` values (>100)
- Make excessive requests (debounce search)

### Database Indexes

Recommended indexes for optimal performance:

```sql
-- Patients
CREATE INDEX idx_patients_name ON patients (name);
CREATE INDEX idx_patients_email ON patients (email);
CREATE INDEX idx_patients_created_at ON patients (created_at DESC);

-- Services
CREATE INDEX idx_services_name ON services (name);

-- Appointments
CREATE INDEX idx_appointments_date ON appointments (appointment_at);
CREATE INDEX idx_appointments_status ON appointments (status);
```

---

## Common Patterns

### Load More (Infinite Scroll)

```javascript
const [patients, setPatients] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const response = await fetch(`/api/v1/patients?page=${page}&limit=20`);
  const json = await response.json();
  
  if (json.data.length < 20) {
    setHasMore(false);
  }
  
  setPatients([...patients, ...json.data]);
  setPage(page + 1);
};
```

### Debounced Search

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (searchTerm) => {
  const response = await fetch(`/api/v1/patients?search=${searchTerm}`);
  const json = await response.json();
  setPatients(json.data);
}, 300); // Wait 300ms after user stops typing

// Usage
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

### Date Range Picker

```javascript
const [dateRange, setDateRange] = useState({
  start: '2025-01-01',
  end: '2025-12-31',
});

const fetchAppointments = async () => {
  const params = new URLSearchParams({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  
  const response = await fetch(`/api/v1/appointments?${params}`);
  // ...
};
```

---

## Troubleshooting

### Empty Results?

1. Check if data exists in database
2. Verify page number isn't too high
3. Check search term matches data
4. Verify date range includes appointments

### Slow Queries?

1. Add database indexes
2. Reduce `limit` value
3. Use more specific filters
4. Check database query plan

### Wrong Data?

1. Verify query parameters are correct
2. Check URL encoding of special characters
3. Ensure date format is ISO 8601
4. Verify authentication token is valid

---

## Migration Guide

If you have existing code without pagination:

### Before

```javascript
const patients = await patientService.getAll();
```

### After (Backward Compatible)

```javascript
// Old code still works (uses defaults)
const patients = await patientService.getAll();

// New code with options
const patients = await patientService.getAll({
  page: 2,
  limit: 50,
  search: 'john',
});
```

**No breaking changes!** Existing code continues to work with default values.

---

## Quick Reference

| Endpoint | Pagination | Search | Date Filter |
|----------|-----------|--------|-------------|
| GET /patients | ✅ page, limit | ✅ search | ❌ |
| GET /services | ✅ page, limit | ❌ | ❌ |
| GET /appointments | ✅ page, limit | ❌ | ✅ startDate, endDate |

**Defaults:**
- `page`: 1
- `limit`: 20
- `search`: empty (no filter)
- `startDate`: none (no filter)
- `endDate`: none (no filter)
