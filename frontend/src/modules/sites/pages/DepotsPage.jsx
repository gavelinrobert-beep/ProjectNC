import { useState } from 'react'
import { useDepots, useDeleteDepot } from '../hooks/useDepots'
import Button from '../../../components/ui/Button'
import { Table, EmptyState, ErrorMessage, ErrorState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import Modal from '../../../shared/components/ui/Modal/Modal'
import ConfirmModal from '../../../shared/components/ui/Modal/ConfirmModal'
import { useModal } from '../../../shared/hooks/useModal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import MapView from '../../../components/map/MapView'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function DepotsPage() {
  const { data: depots, isLoading: loading, error, refetch } = useDepots()
  const { mutate: deleteDepot, isPending: deleting } = useDeleteDepot()
  const [selectedDepot, setSelectedDepot] = useState(null)
  const viewModal = useModal()
  const deleteModal = useModal()

  // Mock depot locations (Stockholm area)
  const depotLocations = [
    {
      id: 1,
      name: 'Stockholm Depot',
      lat: 59.3293,
      lng: 18.0686,
      address: 'Stockholm South Industrial Area',
      capacity: 1000
    },
    {
      id: 2,
      name: 'Göteborg Depot',
      lat: 57.7089,
      lng: 11.9746,
      address: 'Göteborg North Harbor',
      capacity: 800
    }
  ]

  const depotGeofences = [
    {
      id: 1,
      name: 'Stockholm Depot Zone',
      lat: 59.3293,
      lng: 18.0686,
      radius: 500,
      color: '#10B981'
    },
    {
      id: 2,
      name: 'Göteborg Depot Zone',
      lat: 57.7089,
      lng: 11.9746,
      radius: 500,
      color: '#4A90E2'
    }
  ]
  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters
  } = useFilter(depots, {
    searchFields: ['name', 'address', 'manager']
  })

  const columns = [
    {
      key: 'name',
      label: 'Depot Name',
      sortable: true,
      render: (row) => row.name || row.id
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (row) => row.address || 'No address'
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (row) => row.capacity ? `${row.capacity} units` : 'N/A'
    },
    {
      key: 'utilization',
      label: 'Utilization',
      sortable: true,
      render: (row) => row.capacity && row.current_usage !== undefined
        ? `${Math.round((row.current_usage / row.capacity) * 100)}%`
        : 'N/A'
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.is_active !== false ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ]

  const actions = (row) => (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation()
          setSelectedDepot(row)
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
          setSelectedDepot(row)
          deleteModal.openModal()
        }}
      >
        Delete
      </Button>
    </>
  )

  const handleDelete = async () => {
    if (selectedDepot) {
      deleteDepot(selectedDepot.id)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message="Loading depots..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load depots"
          message="There was a problem loading depots. Please try again."
          onRetry={refetch}
        />
      </div>
    )
  }

  // Empty state (no depots at all)
  if (!depots || depots.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="🏢"
          title="No depots configured"
          description="Set up your first depot to manage inventory locations, distribution centers, and warehouse operations."
          actionLabel="+ Add First Depot"
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

  const totalDepots = depots?.length || 0
  const activeDepots = depots?.filter(d => d.is_active !== false).length || 0
  const totalCapacity = depots?.reduce((sum, d) => sum + (d.capacity || 0), 0) || 0
  const avgUtilization = totalCapacity > 0 && depots?.length > 0
    ? Math.round(depots.reduce((sum, d) => sum + ((d.current_usage || 0) / (d.capacity || 1) * 100), 0) / depots.length)
    : 0

  return (
    <div className="p-6">
      {/* Module indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Sites Module
        </span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-600">
          Manage depot locations and operations
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={TEXT.h1}>Depots</h1>
          <p className={TEXT.bodySmall + ' mt-2'}>Manage depot locations and facilities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Add Depot
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Depots</div>
          <div className="text-2xl font-bold text-gray-900">{totalDepots}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Active</div>
          <div className="text-2xl font-bold text-success-600">{activeDepots}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Avg Capacity Utilization</div>
          <div className="text-2xl font-bold text-primary-600">{avgUtilization}%</div>
        </div>
      </div>

      {/* Depot Locations Map */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Depot Locations</h2>
        <MapView
          center={[59.3293, 18.0686]}
          zoom={6}
          depots={depotLocations}
          geofences={depotGeofences}
          height={450}
        />
      </div>

      {/* Search and Filter Toolbar */}
      <div className={CARD.base + ' p-4 mb-6'}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search depots..."
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
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'depots')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'depots')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== depots?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {depots?.length || 0} depots
          </div>
        )}
      </div>

      {/* Table with mobile card layout */}
      <Table
        columns={columns}
        data={filteredData || []}
        onRowClick={(row) => {
          setSelectedDepot(row)
          viewModal.openModal()
        }}
        actions={actions}
        emptyMessage="No depots found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title={`Depot: ${selectedDepot?.name || selectedDepot?.id}`}
        size="lg"
      >
        {selectedDepot && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{selectedDepot.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900">{selectedDepot.address || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedDepot.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedDepot.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            {selectedDepot.capacity && (
              <div>
                <label className="text-sm font-medium text-gray-700">Capacity</label>
                <p className="text-gray-900">{selectedDepot.capacity} units</p>
              </div>
            )}
            {selectedDepot.current_usage !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-700">Current Usage</label>
                <p className="text-gray-900">{selectedDepot.current_usage} units</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Resource Summary</label>
              <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <span>🚛</span>
                    Vehicles Stored
                  </span>
                  <span className="font-semibold text-gray-900">{selectedDepot.vehicles_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <span>🛣️</span>
                    Active Routes
                  </span>
                  <span className="font-semibold text-primary-600">{selectedDepot.active_routes_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <span>📦</span>
                    Pending Deliveries
                  </span>
                  <span className="font-semibold text-warning-600">{selectedDepot.pending_deliveries_count || 0}</span>
                </div>
              </div>
            </div>
            {selectedDepot.top_inventory && selectedDepot.top_inventory.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Top Inventory Items</label>
                <div className="mt-2 space-y-2">
                  {selectedDepot.top_inventory.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium text-gray-900">{item.quantity} units</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedDepot.lat && selectedDepot.lon && (
              <div>
                <label className="text-sm font-medium text-gray-700">Coordinates</label>
                <p className="text-gray-900">{selectedDepot.lat.toFixed(6)}, {selectedDepot.lon.toFixed(6)}</p>
              </div>
            )}
            {selectedDepot.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedDepot.description}</p>
              </div>
            )}
            
            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={viewModal.closeModal}>
                Close
              </Button>
              <Button>Edit Depot</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Delete Depot?"
        message="Are you sure you want to delete this depot? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}