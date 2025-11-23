import { useState } from 'react'
import { useDrivers, useDeleteDriver } from '../hooks/useDrivers'
import Button from '../../../components/ui/Button'
import { Table, StatusBadge, ErrorMessage, ErrorState, EmptyState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import Modal from '../../../shared/components/ui/Modal/Modal'
import ConfirmModal from '../../../shared/components/ui/Modal/ConfirmModal'
import { useModal } from '../../../shared/hooks/useModal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { formatDate, getStatusConfig } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function DriversPage() {
  const { data: drivers, isLoading: loading, error, refetch } = useDrivers()
  const { mutate: deleteDriver, isPending: deleting } = useDeleteDriver()
  const [selectedDriver, setSelectedDriver] = useState(null)
  const viewModal = useModal()
  const deleteModal = useModal()

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters
  } = useFilter(drivers, {
    searchFields: ['name', 'license_number', 'email', 'phone']
  })

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'license_number',
      label: 'License Number',
      sortable: true,
      render: (row) => row.license_number || 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'email',
      label: 'Contact',
      render: (row) => (
        <div className="text-sm">
          <div>{row.email || 'N/A'}</div>
          {row.phone && <div className="text-gray-500">{row.phone}</div>}
        </div>
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
          setSelectedDriver(row)
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
          setSelectedDriver(row)
          deleteModal.openModal()
        }}
      >
        Delete
      </Button>
    </>
  )

  const handleDelete = async () => {
    if (selectedDriver) {
      deleteDriver(selectedDriver.id)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        </div>
        
        {/* Skeleton */}
        <TableSkeleton rows={8} columns={5} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load drivers"
          message="There was a problem loading drivers. Please try again."
          onRetry={refetch}
        />
      </div>
    )
  }

  // Empty state (no drivers at all)
  if (!drivers || drivers.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="👤"
          title="No drivers yet"
          description="Add your first driver to start managing your team. Track availability, assignments, and performance metrics."
          actionLabel="+ Add First Driver"
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

  const totalDrivers = drivers?.length || 0
  const activeDrivers = drivers?.filter(d => d.status === 'active').length || 0
  const onBreakDrivers = drivers?.filter(d => d.status === 'on_break').length || 0
  const offDutyDrivers = drivers?.filter(d => d.status === 'off_duty').length || 0

  return (
    <div className="p-6">
      {/* Module indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Fleet Module
        </span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-600">
          Manage driver schedules and assignments
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={TEXT.h1}>Drivers</h1>
          <p className={TEXT.bodySmall + ' mt-2'}>Manage drivers and behavior analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Add Driver
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Drivers</div>
          <div className="text-2xl font-bold text-gray-900">{totalDrivers}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Active</div>
          <div className="text-2xl font-bold text-success-600">{activeDrivers}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>On Break</div>
          <div className="text-2xl font-bold text-warning-600">{onBreakDrivers}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Off Duty</div>
          <div className="text-2xl font-bold text-gray-600">{offDutyDrivers}</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className={CARD.base + ' p-4 mb-6'}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search drivers..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'on_break', label: 'On Break' },
              { value: 'off_duty', label: 'Off Duty' }
            ]}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'drivers')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'drivers')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== drivers?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {drivers?.length || 0} drivers
          </div>
        )}
      </div>

      {/* Table with mobile card layout */}
      <Table
        columns={columns}
        data={filteredData || []}
        onRowClick={(row) => {
          setSelectedDriver(row)
          viewModal.openModal()
        }}
        actions={actions}
        emptyMessage="No drivers found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title={`Driver: ${selectedDriver?.name}`}
        size="lg"
      >
        {selectedDriver && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{selectedDriver.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{selectedDriver.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{selectedDriver.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <StatusBadge status={selectedDriver.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">License Number</label>
              <p className="text-gray-900">{selectedDriver.license_number || 'N/A'}</p>
            </div>
            {selectedDriver.license_type && (
              <div>
                <label className="text-sm font-medium text-gray-700">License Type</label>
                <p className="text-gray-900">{selectedDriver.license_type}</p>
              </div>
            )}
            {selectedDriver.license_expiry && (
              <div>
                <label className="text-sm font-medium text-gray-700">License Expiry</label>
                <p className="text-gray-900">{formatDate(selectedDriver.license_expiry)}</p>
              </div>
            )}
            {selectedDriver.employment_status && (
              <div>
                <label className="text-sm font-medium text-gray-700">Employment Status</label>
                <p className="text-gray-900">{getStatusConfig(selectedDriver.employment_status).label}</p>
              </div>
            )}
            {selectedDriver.role && (
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="text-gray-900">{selectedDriver.role}</p>
              </div>
            )}
            
            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={viewModal.closeModal}>
                Close
              </Button>
              <Button>Edit Driver</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Delete Driver?"
        message="Are you sure you want to delete this driver? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}