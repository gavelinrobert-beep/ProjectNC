import { useState } from 'react'
import { useDeliveries, useCreateDelivery } from '../hooks/useDeliveries'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { StatusBadge, ErrorMessage, TableSkeleton } from '../../../shared/components/ui'
import { formatDateTime } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function DeliveriesPage() {
  const { data: deliveries, isLoading: loading, error, refetch } = useDeliveries()
  const { mutate, isPending: mutating } = useCreateDelivery()
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [showModal, setShowModal] = useState(false)

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
      render: (value) => `#${value}`
    },
    {
      key: 'customer_name',
      label: 'Customer',
    },
    {
      key: 'delivery_address',
      label: 'Address',
      render: (value) => value || 'N/A'
    },
    {
      key: 'assigned_vehicle_id',
      label: 'Vehicle',
      render: (value, row) => value ? (
        <span className="flex items-center gap-1">
          <span>🚛</span>
          <span className="text-sm">{row.vehicle_registration || value}</span>
        </span>
      ) : (
        <span className="text-gray-400 text-sm">Unassigned</span>
      )
    },
    {
      key: 'assigned_driver_id',
      label: 'Driver',
      render: (value, row) => value ? (
        <span className="flex items-center gap-1">
          <span>👤</span>
          <span className="text-sm">{row.driver_name || value}</span>
        </span>
      ) : (
        <span className="text-gray-400 text-sm">Unassigned</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'scheduled_date',
      label: 'Scheduled',
      render: (value) => formatDateTime(value)
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
            setSelectedDelivery(row)
            setShowModal(true)
          }}
        >
          View
        </Button>
      )
    }
  ]

  const handleCreateDelivery = async () => {
    mutate({
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

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={5} columns={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage error={error} retry={refetch} />
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={TEXT.h1}>Deliveries</h1>
          <p className={TEXT.bodySmall + ' mt-2'}>Manage deliveries and proof of delivery</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+" onClick={handleCreateDelivery} disabled={mutating}>
            New Delivery
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
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

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear Filters
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

      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={filteredData || []}
          loading={loading}
          onRowClick={(row) => {
            setSelectedDelivery(row)
            setShowModal(true)
          }}
        />
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden space-y-4">
        {filteredData?.map(delivery => (
          <div 
            key={delivery.id} 
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedDelivery(delivery)
              setShowModal(true)
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">
                {delivery.customer_name}
              </span>
              <StatusBadge status={delivery.status} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="text-gray-900">#{delivery.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address:</span>
                <span className="text-gray-900 text-right ml-2">{delivery.delivery_address || 'N/A'}</span>
              </div>
              {delivery.assigned_vehicle_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle:</span>
                  <span className="text-gray-900">🚛 {delivery.vehicle_registration || delivery.assigned_vehicle_id}</span>
                </div>
              )}
              {delivery.assigned_driver_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver:</span>
                  <span className="text-gray-900">👤 {delivery.driver_name || delivery.assigned_driver_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Scheduled:</span>
                <span className="text-gray-900">{formatDateTime(delivery.scheduled_date)}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button 
                className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg min-h-[44px] font-medium"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDelivery(delivery)
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
            No deliveries found
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Delivery #${selectedDelivery?.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Delivery</Button>
          </>
        }
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
          </div>
        )}
      </Modal>
    </div>
  )
}