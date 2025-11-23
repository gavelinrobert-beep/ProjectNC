import { useState } from 'react'
import { useDeliveries, useCreateDelivery, useDeleteDelivery } from '../hooks/useDeliveries'
import Button from '../../../components/ui/Button'
import { Table, StatusBadge, ErrorMessage, ErrorState, EmptyState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import Modal from '../../../shared/components/ui/Modal/Modal'
import ConfirmModal from '../../../shared/components/ui/Modal/ConfirmModal'
import { useModal } from '../../../shared/hooks/useModal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { formatDateTime } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function DeliveriesPage() {
  const { data: deliveries, isLoading: loading, error, refetch } = useDeliveries()
  const { mutate: createDelivery, isPending: mutating } = useCreateDelivery()
  const { mutate: deleteDelivery, isPending: deleting } = useDeleteDelivery()
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const viewModal = useModal()
  const deleteModal = useModal()

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

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (row) => `#${row.id}`
    },
    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'delivery_address',
      label: 'Address',
      sortable: true,
      render: (row) => row.delivery_address || 'N/A'
    },
    {
      key: 'assigned_vehicle_id',
      label: 'Vehicle',
      render: (row) => row.assigned_vehicle_id ? (
        <span className="flex items-center gap-1">
          <span>🚛</span>
          <span className="text-sm">{row.vehicle_registration || row.assigned_vehicle_id}</span>
        </span>
      ) : (
        <span className="text-gray-400 text-sm">Unassigned</span>
      )
    },
    {
      key: 'assigned_driver_id',
      label: 'Driver',
      render: (row) => row.assigned_driver_id ? (
        <span className="flex items-center gap-1">
          <span>👤</span>
          <span className="text-sm">{row.driver_name || row.assigned_driver_id}</span>
        </span>
      ) : (
        <span className="text-gray-400 text-sm">Unassigned</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'scheduled_date',
      label: 'Scheduled',
      sortable: true,
      render: (row) => formatDateTime(row.scheduled_date)
    },
  ]

  const actions = (row) => (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation()
          setSelectedDelivery(row)
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
          setSelectedDelivery(row)
          deleteModal.openModal()
        }}
      >
        Delete
      </Button>
    </>
  )

  const handleCreateDelivery = async () => {
    createDelivery({
      customer_name: 'New Customer',
      delivery_address: '123 Test Street',
      status: 'pending',
      scheduled_date: new Date().toISOString()
    }, {
      onSuccess: () => {
        alert('Delivery created successfully!')
      },
      onError: (error) => {
        alert(`Error: ${error.message}`)
      }
    })
  }

  const handleDelete = async () => {
    if (selectedDelivery) {
      deleteDelivery(selectedDelivery.id)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message="Loading deliveries..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load deliveries"
          message="There was a problem loading deliveries. Please try again."
          onRetry={refetch}
        />
      </div>
    )
  }

  // Empty state (no deliveries at all)
  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="📦"
          title="No deliveries yet"
          description="Get started by creating your first delivery. Track shipments, manage routes, and monitor progress all in one place."
          actionLabel="+ Create First Delivery"
          onAction={handleCreateDelivery}
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

  return (
    <div className="p-6">
      {/* Module indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Logistics Module
        </span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-600">
          Manage and track all deliveries
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={TEXT.h1Responsive}>Deliveries</h1>
          <p className={TEXT.bodySmallResponsive + ' mt-2'}>Manage deliveries and proof of delivery</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button icon="+" onClick={handleCreateDelivery} disabled={mutating}>
            <span className="hidden sm:inline">New Delivery</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Deliveries</div>
          <div className="text-2xl font-bold text-gray-900">{deliveries?.length || 0}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Pending</div>
          <div className="text-2xl font-bold text-warning-600">
            {deliveries?.filter(d => d.status === 'pending').length || 0}
          </div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>In Transit</div>
          <div className="text-2xl font-bold text-primary-600">
            {deliveries?.filter(d => d.status === 'in_transit').length || 0}
          </div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Delivered</div>
          <div className="text-2xl font-bold text-success-600">
            {deliveries?.filter(d => d.status === 'delivered').length || 0}
          </div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className={CARD.base + ' p-4 mb-6'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <SearchBar
              placeholder="Search deliveries..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in_transit', label: 'In Transit' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'failed', label: 'Failed' }
            ]}
          />

          <div className="flex items-end gap-2 flex-wrap">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'deliveries')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'deliveries')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== deliveries?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {deliveries?.length || 0} deliveries
          </div>
        )}
      </div>

      {/* Table with mobile card layout */}
      <Table
        columns={columns}
        data={filteredData || []}
        onRowClick={(row) => {
          setSelectedDelivery(row)
          viewModal.openModal()
        }}
        actions={actions}
        emptyMessage="No deliveries found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title={`Delivery #${selectedDelivery?.id}`}
        size="lg"
      >
        {selectedDelivery && (
          <div className="space-y-4">
            <div>
              <label className={TEXT.label}>Customer</label>
              <p className={TEXT.body}>{selectedDelivery.customer_name}</p>
            </div>
            <div>
              <label className={TEXT.label}>Address</label>
              <p className={TEXT.body}>{selectedDelivery.delivery_address || 'N/A'}</p>
            </div>
            <div>
              <label className={TEXT.label}>Status</label>
              <div className="mt-1">
                <StatusBadge status={selectedDelivery.status} />
              </div>
            </div>
            <div>
              <label className={TEXT.label}>Assigned Vehicle</label>
              <p className={TEXT.body}>
                {selectedDelivery.assigned_vehicle_id ? (
                  <span className="flex items-center gap-2">
                    <span>🚛</span>
                    <span>{selectedDelivery.vehicle_registration || selectedDelivery.assigned_vehicle_id}</span>
                  </span>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </p>
            </div>
            <div>
              <label className={TEXT.label}>Assigned Driver</label>
              <p className={TEXT.body}>
                {selectedDelivery.assigned_driver_id ? (
                  <span className="flex items-center gap-2">
                    <span>👤</span>
                    <span>{selectedDelivery.driver_name || selectedDelivery.assigned_driver_id}</span>
                  </span>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </p>
            </div>
            <div>
              <label className={TEXT.label}>Scheduled Date</label>
              <p className={TEXT.body}>{formatDateTime(selectedDelivery.scheduled_date)}</p>
            </div>
            {selectedDelivery.notes && (
              <div>
                <label className={TEXT.label}>Notes</label>
                <p className={TEXT.body}>{selectedDelivery.notes}</p>
              </div>
            )}
            
            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={viewModal.closeModal}>
                Close
              </Button>
              <Button>Edit Delivery</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Delete Delivery?"
        message="Are you sure you want to delete this delivery? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}