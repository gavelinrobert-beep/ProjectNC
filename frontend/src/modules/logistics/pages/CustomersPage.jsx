import { useState } from 'react'
import { useCustomers } from '../hooks/useCustomers'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
import { ErrorMessage, ErrorState, EmptyState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import { formatDate } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

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

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message="Loading customers..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load customers"
          message="There was a problem loading customers. Please try again."
          onRetry={refetch}
        />
      </div>
    )
  }

  // Empty state (no customers at all)
  if (!customers || customers.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="👥"
          title="No customers yet"
          description="Start building your customer base by adding your first customer. Manage contacts, track orders, and build relationships."
          actionLabel="+ Add First Customer"
          onAction={() => setShowModal(true)}
        />
      </div>
    )
  }

  // No search results
  if (searchQuery && filteredData.length === 0) {
    return (
      <div className="p-6">
        <NoResults
          searchTerm={searchQuery}
          onClear={() => setSearchQuery('')}
        />
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
      {/* Module indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Logistics Module
        </span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-600">
          Manage customer relationships
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={TEXT.h1}>Customers</h1>
          <p className={TEXT.bodySmall + ' mt-2'}>Manage customer information and contacts</p>
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
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Customers</div>
          <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Active</div>
          <div className="text-2xl font-bold text-success-600">{activeCustomers}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Deliveries</div>
          <div className="text-2xl font-bold text-primary-600">{totalDeliveries}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Top Customer</div>
          <div className="text-lg font-bold text-gray-900 truncate">
            {topCustomer?.name || 'N/A'}
          </div>
        </div>
      </div>

      {/* Search and Export Toolbar */}
      <div className={CARD.base + ' p-4 mb-6'}>
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

      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={filteredData || []}
          loading={loading}
          onRowClick={(row) => {
            setSelectedCustomer(row)
            setShowModal(true)
          }}
        />
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden space-y-4">
        {filteredData?.map(customer => (
          <div 
            key={customer.id} 
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedCustomer(customer)
              setShowModal(true)
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">
                {customer.name}
              </span>
              <span className="text-xs text-gray-500">#{customer.id}</span>
            </div>
            <div className="space-y-2 text-sm">
              {customer.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900 text-right ml-2">{customer.email}</span>
                </div>
              )}
              {customer.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="text-gray-900">{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Address:</span>
                  <span className="text-gray-900 text-right ml-2">{customer.address}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Total Orders:</span>
                <span className="text-gray-900 font-medium">{customer.total_orders || 0}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button 
                className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg min-h-[44px] font-medium"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCustomer(customer)
                  setShowModal(true)
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        {filteredData?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No customers found
          </div>
        )}
      </div>

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