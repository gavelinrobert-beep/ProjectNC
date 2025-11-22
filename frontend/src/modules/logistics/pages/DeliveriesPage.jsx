import { useState } from 'react'
import { useDeliveries, useCreateDelivery } from '../hooks/useDeliveries'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { formatDate } from '../../../utils/dateUtils'
import { getStatusColor, getStatusLabel } from '../../../utils/statusHelpers'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

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
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </span>
      )
    },
    {
      key: 'scheduled_date',
      label: 'Scheduled',
      render: (value) => formatDate(value, true)
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Deliveries</h3>
          </div>
          <p className="text-red-800 mb-4">{error.message}</p>
          <Button variant="danger" onClick={refetch}>
            🔄 Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Deliveries</h1>
          <p className="text-gray-600 mt-2">Manage deliveries and proof of delivery</p>
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Deliveries</div>
          <div className="text-2xl font-bold text-gray-900">{deliveries?.length || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {deliveries?.filter(d => d.status === 'pending').length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">In Transit</div>
          <div className="text-2xl font-bold text-blue-600">
            {deliveries?.filter(d => d.status === 'in_transit').length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Delivered</div>
          <div className="text-2xl font-bold text-green-600">
            {deliveries?.filter(d => d.status === 'delivered').length || 0}
          </div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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

      {/* Table */}
      <Table
        columns={columns}
        data={filteredData || []}
        loading={loading}
        onRowClick={(row) => {
          setSelectedDelivery(row)
          setShowModal(true)
        }}
      />

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
              <label className="text-sm font-medium text-gray-700">Customer</label>
              <p className="text-gray-900">{selectedDelivery.customer_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900">{selectedDelivery.delivery_address || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDelivery.status)}`}>
                  {getStatusLabel(selectedDelivery.status)}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Scheduled Date</label>
              <p className="text-gray-900">{formatDate(selectedDelivery.scheduled_date, true)}</p>
            </div>
            {selectedDelivery.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <p className="text-gray-900">{selectedDelivery.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}