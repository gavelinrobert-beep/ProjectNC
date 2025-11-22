# Search, Filter, and Export Functionality Guide

This guide documents the search, filter, and export features implemented across all module pages in the SYLON logistics platform.

## Overview

All 9 module pages now include:
- **Search**: Debounced search across relevant fields
- **Filters**: Status, type, category filters as appropriate
- **Export**: CSV and JSON export functionality
- **Result Count**: Visual feedback showing filtered results

## Components

### SearchBar
Location: `frontend/src/components/ui/SearchBar.jsx`

A debounced search input component with clear button.

**Props:**
- `placeholder` (string): Placeholder text (default: "Search...")
- `onSearch` (function): Callback function called with search query
- `debounceMs` (number): Debounce delay in milliseconds (default: 300)

**Example:**
```jsx
import SearchBar from '../../../components/ui/SearchBar'

<SearchBar
  placeholder="Search deliveries..."
  onSearch={setSearchQuery}
/>
```

### FilterDropdown
Location: `frontend/src/components/ui/FilterDropdown.jsx`

A dropdown for single-select filtering.

**Props:**
- `label` (string): Label for the dropdown
- `options` (array): Array of {value, label} objects
- `value` (string): Current selected value
- `onChange` (function): Callback when selection changes

**Example:**
```jsx
import FilterDropdown from '../../../components/ui/FilterDropdown'

<FilterDropdown
  label="Status"
  value={statusFilter}
  onChange={setStatusFilter}
  options={[
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' }
  ]}
/>
```

### DateRangePicker
Location: `frontend/src/components/ui/DateRangePicker.jsx`

A date range picker with start and end date inputs.

**Props:**
- `startDate` (string): Start date value
- `endDate` (string): End date value
- `onStartChange` (function): Callback for start date change
- `onEndChange` (function): Callback for end date change

## Hooks

### useFilter
Location: `frontend/src/hooks/useFilter.js`

Custom hook for filtering data with multiple filter types.

**Parameters:**
- `data` (array): Array of data to filter
- `config` (object): Configuration object
  - `searchFields` (array): Fields to search in
  - `dateField` (string): Field name for date filtering
  - `getStockStatus` (function): Function to determine stock status (for inventory)

**Returns:**
- `filteredData`: Filtered array
- `searchQuery`, `setSearchQuery`: Search query state
- `statusFilter`, `setStatusFilter`: Status filter state
- `typeFilter`, `setTypeFilter`: Type filter state
- `categoryFilter`, `setCategoryFilter`: Category filter state
- `stockLevelFilter`, `setStockLevelFilter`: Stock level filter state
- `dateRange`, `setDateRange`: Date range state
- `clearFilters`: Function to clear all filters

**Example:**
```jsx
import { useFilter } from '../../../hooks/useFilter'

const {
  filteredData,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  clearFilters
} = useFilter(deliveries, {
  searchFields: ['customer_name', 'delivery_address', 'notes'],
  dateField: 'scheduled_date'
})
```

## Utilities

### Export Functions
Location: `frontend/src/utils/exportUtils.js`

Functions for exporting data to various formats.

**exportToCSV(data, filename)**
- Exports array of objects to CSV format
- Automatically escapes commas and quotes
- Downloads file with .csv extension

**exportToJSON(data, filename)**
- Exports array to formatted JSON
- 2-space indentation
- Downloads file with .json extension

**Example:**
```jsx
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

// Export filtered data
<Button onClick={() => exportToCSV(filteredData, 'deliveries')}>
  📥 Export CSV
</Button>
<Button onClick={() => exportToJSON(filteredData, 'deliveries')}>
  📥 Export JSON
</Button>
```

## Implementation Pattern

Standard toolbar implementation for a module page:

```jsx
import { useState } from 'react'
import { useApi } from '../../../hooks/useApi'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

export default function YourPage() {
  const { data, loading, error } = useApi(() => api.getData())

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters
  } = useFilter(data, {
    searchFields: ['name', 'description'],
    dateField: 'created_at'
  })

  return (
    <div className="p-6">
      {/* Header and stats... */}

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'data')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'data')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== data?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {data?.length || 0} results
          </div>
        )}
      </div>

      {/* Table or Grid with filteredData */}
    </div>
  )
}
```

## Pages Enhanced

1. **DeliveriesPage** (`frontend/src/features/logistics/pages/DeliveriesPage.jsx`)
   - Search: customer_name, delivery_address, notes
   - Filter: status (pending, in_transit, delivered, failed)

2. **RoutesPage** (`frontend/src/features/logistics/pages/RoutesPage.jsx`)
   - Search: name, driver, vehicle
   - Filter: status (active, completed, cancelled)

3. **CustomersPage** (`frontend/src/features/logistics/pages/CustomersPage.jsx`)
   - Search: name, email, phone, address

4. **VehiclesPage** (`frontend/src/features/fleet/pages/VehiclesPage.jsx`)
   - Search: registration_number, type
   - Filter: status (active, maintenance, idle), type (truck, van, car)

5. **DriversPage** (`frontend/src/features/fleet/pages/DriversPage.jsx`)
   - Search: name, license_number, email, phone
   - Filter: status (active, on_break, off_duty)

6. **MaintenancePage** (`frontend/src/features/fleet/pages/MaintenancePage.jsx`)
   - Search: vehicle_id, description
   - Filter: status (scheduled, in_progress, completed), type (routine, repair, inspection)

7. **DepotsPage** (`frontend/src/features/sites/pages/DepotsPage.jsx`)
   - Search: name, address, city
   - Filter: status (active, inactive)

8. **InventoryPage** (`frontend/src/features/sites/pages/InventoryPage.jsx`)
   - Search: item_name, sku, description
   - Filter: category, stock level (in_stock, low_stock, out_of_stock)

9. **MaterialsPage** (`frontend/src/features/sites/pages/MaterialsPage.jsx`)
   - Search: name, supplier, category
   - Filter: category

## Performance Considerations

- **Debouncing**: Search uses 300ms debounce to reduce filter operations
- **Memoization**: useFilter hook uses useMemo to prevent unnecessary recalculations
- **Stable References**: Config objects should be stable to avoid re-renders

## Testing

Tests are located in:
- `frontend/src/components/ui/__tests__/SearchBar.test.jsx`
- `frontend/src/utils/__tests__/exportUtils.test.js`

Run tests with:
```bash
npm test
```

## Browser Compatibility

All features work in modern browsers (Chrome, Firefox, Safari, Edge) that support:
- ES6+ JavaScript
- Blob API
- URL.createObjectURL()

## Future Enhancements

Potential improvements:
- Add Excel export format
- Implement saved filter presets
- Add advanced search operators (AND, OR, NOT)
- Support for multi-select filters
- Date range presets (Last 7 days, Last 30 days, etc.)
