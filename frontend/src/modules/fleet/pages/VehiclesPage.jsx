import { useState } from 'react'
import { useVehicles, useDeleteVehicle } from '../hooks/useVehicles'
import Button from '../../../components/ui/Button'
import { Table, StatusBadge, EmptyState, ErrorMessage, ErrorState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import Modal from '../../../shared/components/ui/Modal/Modal'
import ConfirmModal from '../../../shared/components/ui/Modal/ConfirmModal'
import { useModal } from '../../../shared/hooks/useModal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { formatDateTime } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function VehiclesPage() {
  const { data: vehicles, isLoading: loading, error, refetch } = useVehicles()
  const { mutate: deleteVehicle, isPending: deleting } = useDeleteVehicle()
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const viewModal = useModal()
  const deleteModal = useModal()

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    clearFilters
  } = useFilter(vehicles, {
    searchFields: ['name', 'plate', 'type']
  })

  const columns = [
    {
      key: 'registration_number',
      label: 'Registration',
      sortable: true,
      render: (row) => row.registration_number || row.id
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => row.type || 'Vehicle'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'fuel_level',
      label: 'Fuel Level',
      sortable: true,
      render: (row) => `${row.fuel_level || 0}%`
    },
    {
      key: 'current_driver_id',
      label: 'Assigned Driver',
      render: (row) => row.current_driver_id ? (
        <span className="flex items-center gap-1">
          <span>👤</span>
          <span className="text-sm">{row.driver_name || row.current_driver_id}</span>
        </span>
      ) : (
        <span className="text-gray-400 text-sm">Unassigned</span>
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
          setSelectedVehicle(row)
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
          setSelectedVehicle(row)
          deleteModal.openModal()
        }}
      >
        Delete
      </Button>
    </>
  )

  const handleDelete = async () => {
    if (selectedVehicle) {
      deleteVehicle(selectedVehicle.id)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message="Loading vehicles..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load vehicles"
          message="There was a problem loading vehicles. Please try again."
          onRetry={refetch}
        />
      </div>
    )
  }

  // Empty state (no vehicles at all)
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="🚛"
          title="No vehicles in fleet"
          description="Add your first vehicle to start managing your fleet. Track maintenance, assignments, and availability."
          actionLabel="+ Add First Vehicle"
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

  const totalVehicles = vehicles?.length || 0
  const activeVehicles = vehicles?.filter(v => v.status === 'active').length || 0
  const maintenanceVehicles = vehicles?.filter(v => v.status === 'maintenance').length || 0
  const avgFuelLevel = vehicles?.length > 0 
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.fuel_level || 0), 0) / vehicles.length)
    : 0

  return (
    <div className="p-6">
      {/* Module indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Fleet Module
        </span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-600">
          Manage vehicle fleet and assignments
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={TEXT.h1}>Vehicles</h1>
          <p className={TEXT.bodySmall + ' mt-2'}>Manage fleet vehicles and live tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Vehicles</div>
          <div className="text-2xl font-bold text-gray-900">{totalVehicles}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Active</div>
          <div className="text-2xl font-bold text-success-600">{activeVehicles}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>In Maintenance</div>
          <div className="text-2xl font-bold text-warning-600">{maintenanceVehicles}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Average Fuel Level</div>
          <div className="text-2xl font-bold text-primary-600">{avgFuelLevel}%</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className={CARD.base + ' p-4 mb-6'}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search vehicles..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'idle', label: 'Idle' }
            ]}
          />

          <FilterDropdown
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'truck', label: 'Truck' },
              { value: 'van', label: 'Van' },
              { value: 'car', label: 'Car' }
            ]}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'vehicles')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'vehicles')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== vehicles?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {vehicles?.length || 0} vehicles
          </div>
        )}
      </div>

      {/* Table with mobile card layout */}
      <Table
        columns={columns}
        data={filteredData || []}
        onRowClick={(row) => {
          setSelectedVehicle(row)
          viewModal.openModal()
        }}
        actions={actions}
        emptyMessage="No vehicles found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title={`Vehicle: ${selectedVehicle?.registration_number || selectedVehicle?.id}`}
        size="lg"
      >
        {selectedVehicle && (
          <div className="space-y-4">
            <div>
              <label className={TEXT.label}>Registration Number</label>
              <p className={TEXT.body}>{selectedVehicle.registration_number || 'N/A'}</p>
            </div>
            <div>
              <label className={TEXT.label}>Type</label>
              <p className={TEXT.body}>{selectedVehicle.type || 'N/A'}</p>
            </div>
            <div>
              <label className={TEXT.label}>Status</label>
              <div className="mt-1">
                <StatusBadge status={selectedVehicle.status} />
              </div>
            </div>
            <div>
              <label className={TEXT.label}>Current Assignment</label>
              <div className="mt-1 space-y-2">
                {selectedVehicle.current_driver_id ? (
                  <p className={TEXT.body + ' flex items-center gap-2'}>
                    <span>👤</span>
                    <span>Driver: {selectedVehicle.driver_name || selectedVehicle.current_driver_id}</span>
                  </p>
                ) : (
                  <p className="text-gray-400">No driver assigned</p>
                )}
                {selectedVehicle.current_route && (
                  <p className={TEXT.body}>Route: {selectedVehicle.current_route}</p>
                )}
              </div>
            </div>
            <div>
              <label className={TEXT.label}>Home Depot</label>
              {selectedVehicle.home_facility_id ? (
                <div className="mt-1">
                  <p className={TEXT.body + ' flex items-center gap-2'}>
                    <span>🏢</span>
                    <span>{selectedVehicle.depot_name || selectedVehicle.home_facility_id}</span>
                  </p>
                  {selectedVehicle.depot_address && (
                    <p className={TEXT.bodySmall + ' mt-1'}>{selectedVehicle.depot_address}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 mt-1">No home depot assigned</p>
              )}
            </div>
            <div>
              <label className={TEXT.label}>Fuel Level</label>
              <p className={TEXT.body}>{selectedVehicle.fuel_level || 0}%</p>
            </div>
            {selectedVehicle.odometer && (
              <div>
                <label className={TEXT.label}>Odometer</label>
                <p className={TEXT.body}>{selectedVehicle.odometer} km</p>
              </div>
            )}
            {selectedVehicle.lat && selectedVehicle.lon && (
              <div>
                <label className={TEXT.label}>Location</label>
                <p className={TEXT.body}>{selectedVehicle.lat.toFixed(6)}, {selectedVehicle.lon.toFixed(6)}</p>
              </div>
            )}
            {selectedVehicle.updated_at && (
              <div>
                <label className={TEXT.label}>Last Updated</label>
                <p className={TEXT.body}>{formatDateTime(selectedVehicle.updated_at)}</p>
              </div>
            )}
            
            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={viewModal.closeModal}>
                Close
              </Button>
              <Button>Edit Vehicle</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Delete Vehicle?"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}