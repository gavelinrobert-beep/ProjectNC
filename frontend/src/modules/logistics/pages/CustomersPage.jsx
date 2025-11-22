import { useState } from 'react'
import { useCustomers } from '../hooks/useCustomers'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import SearchBar from '../../../components/ui/SearchBar'
import { formatDate } from '../../../utils/dateUtils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

export default function CustomersPage() {
  const { data: customers, isLoading: loading, error, refetch } = useCustomers()
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    clearFilters
  } = useFilter(customers, {
    searchFields: ['name', 'email', 'phone', 'address']
  })

  const columns = [
    {
      key: 'name',
      label: 'Customer Name',
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (value, row) => (
        <div className="text-sm">
          {row.email && <div>{row.email}</div>}
          {row.phone && <div className="text-gray-500">{row.phone}</div>}
          {!row.email && !row.phone && 'N/A'}
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      render: (value) => value || 'N/A'
    },
    {
      key: 'total_orders',
      label: 'Total Orders',
      render: (value) => value || 0
    },
    {
      key: 'last_order_date',
      label: 'Last Order',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            setSelectedCustomer(row)
            setShowModal(true)
          }}
        >
          View
        </Button>
      )
    }
  ]

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Customers</h3>
          </div>
          <p className="text-red-800 mb-4">{error.message}</p>
          <Button variant="danger" onClick={refetch}>
            🔄 Retry
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading customers..." />
      </div>
    )
  }

  const totalCustomers = customers?.length || 0
  const activeCustomers = customers?.filter(c => c.is_active !== false).length || 0
  const totalDeliveries = customers?.reduce((sum, c) => sum + (c.total_orders || 0), 0) || 0
  
  // Find top customer by total orders
  const topCustomer = customers?.length > 0
    ? customers.reduce((max, c) => (c.total_orders || 0) > (max.total_orders || 0) ? c : max, customers[0])
    : null

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-600 mt-2">Manage customer information and contacts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Customers</div>
          <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Deliveries</div>
          <div className="text-2xl font-bold text-blue-600">{totalDeliveries}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Top Customer</div>
          <div className="text-lg font-bold text-purple-600 truncate">
            {topCustomer?.name || 'N/A'}
          </div>
        </div>
      </div>

      {/* Search and Export Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search customers..."
              onSearch={setSearchQuery}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear Search
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'customers')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'customers')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== customers?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {customers?.length || 0} customers
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredData || []}
        loading={loading}
        onRowClick={(row) => {
          setSelectedCustomer(row)
          setShowModal(true)
        }}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Customer: ${selectedCustomer?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Customer</Button>
          </>
        }
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Customer Name</label>
              <p className="text-gray-900">{selectedCustomer.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{selectedCustomer.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900">{selectedCustomer.address || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedCustomer.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedCustomer.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total Orders</label>
              <p className="text-gray-900">{selectedCustomer.total_orders || 0}</p>
            </div>
            {selectedCustomer.last_order_date && (
              <div>
                <label className="text-sm font-medium text-gray-700">Last Order Date</label>
                <p className="text-gray-900">{formatDate(selectedCustomer.last_order_date, true)}</p>
              </div>
            )}
            {selectedCustomer.company && (
              <div>
                <label className="text-sm font-medium text-gray-700">Company</label>
                <p className="text-gray-900">{selectedCustomer.company}</p>
              </div>
            )}
            {selectedCustomer.special_instructions && (
              <div>
                <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                <p className="text-gray-900">{selectedCustomer.special_instructions}</p>
              </div>
            )}
            {selectedCustomer.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <p className="text-gray-900">{selectedCustomer.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}