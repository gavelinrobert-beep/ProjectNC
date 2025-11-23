import { useState } from 'react'
import { useCustomers, useDeleteCustomer } from '../hooks/useCustomers'
import Button from '../../../components/ui/Button'
import { Table, ErrorMessage, ErrorState, EmptyState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import Modal from '../../../shared/components/ui/Modal/Modal'
import ConfirmModal from '../../../shared/components/ui/Modal/ConfirmModal'
import { useModal } from '../../../shared/hooks/useModal'
import SearchBar from '../../../components/ui/SearchBar'
import { formatDate } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function CustomersPage() {
  const { data: customers, isLoading: loading, error, refetch } = useCustomers()
  const { mutate: deleteCustomer, isPending: deleting } = useDeleteCustomer()
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const viewModal = useModal()
  const deleteModal = useModal()

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
      sortable: true,
    },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (row) => (
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
      sortable: true,
      render: (row) => row.address || 'N/A'
    },
    {
      key: 'total_orders',
      label: 'Total Orders',
      sortable: true,
      render: (row) => row.total_orders || 0
    },
    {
      key: 'last_order_date',
      label: 'Last Order',
      sortable: true,
      render: (row) => formatDate(row.last_order_date)
    },
  ]

  const actions = (row) => (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation()
          setSelectedCustomer(row)
          viewModal.openModal()
        }}
      >
        View
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={(e) => {
          e.stopPropagation()
          setSelectedCustomer(row)
          deleteModal.openModal()
        }}
      >
        Delete
      </Button>
    </>
  )

  const handleDelete = async () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id)
    }
  }

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
          onAction={() => viewModal.openModal()}
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

      {/* Table with mobile card layout */}
      <Table
        columns={columns}
        data={filteredData || []}
        onRowClick={(row) => {
          setSelectedCustomer(row)
          viewModal.openModal()
        }}
        actions={actions}
        emptyMessage="No customers found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title={`Customer: ${selectedCustomer?.name}`}
        size="lg"
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
            
            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={viewModal.closeModal}>
                Close
              </Button>
              <Button>Edit Customer</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Delete Customer?"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}