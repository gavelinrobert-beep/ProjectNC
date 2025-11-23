import { useState } from 'react'
import { useMaintenance, useDeleteMaintenanceEvent } from '../hooks/useMaintenance'
import Button from '../../../components/ui/Button'
import { Table, StatusBadge, ErrorMessage, ErrorState, EmptyState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import Modal from '../../../shared/components/ui/Modal/Modal'
import ConfirmModal from '../../../shared/components/ui/Modal/ConfirmModal'
import { useModal } from '../../../shared/hooks/useModal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { formatDate, formatCurrency, getStatusConfig } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function MaintenancePage() {
  const { data: maintenance, isLoading: loading, error, refetch } = useMaintenance()
  const { mutate: deleteMaintenanceEvent, isPending: deleting } = useDeleteMaintenanceEvent()
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
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
  } = useFilter(maintenance, {
    searchFields: ['vehicle_name', 'description', 'type'],
    dateField: 'scheduled_date'
  })

  const columns = [
    {
      key: 'vehicle_id',
      label: 'Vehicle',
      sortable: true,
      render: (row) => row.vehicle_id || 'N/A'
    },
    {
      key: 'type',
      label: 'Maintenance Type',
      sortable: true,
      render: (row) => getStatusConfig(row.type || 'routine').label
    },
    {
      key: 'scheduled_date',
      label: 'Scheduled Date',
      sortable: true,
      render: (row) => formatDate(row.scheduled_date)
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'cost',
      label: 'Cost',
      sortable: true,
      render: (row) => formatCurrency(row.cost, 'USD')
    },
  ]

  const actions = (row) => (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation()
          setSelectedMaintenance(row)
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
          setSelectedMaintenance(row)
          deleteModal.openModal()
        }}
      >
        Delete
      </Button>
    </>
  )

  const handleDelete = async () => {
    if (selectedMaintenance) {
      deleteMaintenanceEvent(selectedMaintenance.id)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message="Loading maintenance records..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load maintenance records"
          message="There was a problem loading maintenance records. Please try again."
          onRetry={refetch}
        />
      </div>
    )
  }

  // Empty state (no maintenance records at all)
  if (!maintenance || maintenance.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="🔧"
          title="No maintenance records"
          description="Start tracking vehicle maintenance by adding your first maintenance record. Keep your fleet running smoothly with scheduled maintenance."
          actionLabel="+ Add First Record"
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

  const totalRecords = maintenance?.length || 0
  const scheduledRecords = maintenance?.filter(m => m.status === 'scheduled').length || 0
  const inProgressRecords = maintenance?.filter(m => m.status === 'in_progress').length || 0
  const completedRecords = maintenance?.filter(m => m.status === 'completed').length || 0

  return (
    <div className="p-6">
      {/* Module indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Fleet Module
        </span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-600">
          Track vehicle maintenance and repairs
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={TEXT.h1}>Maintenance</h1>
          <p className={TEXT.bodySmall + ' mt-2'}>Track vehicle maintenance and service schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Records</div>
          <div className="text-2xl font-bold text-gray-900">{totalRecords}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Scheduled</div>
          <div className="text-2xl font-bold text-primary-600">{scheduledRecords}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>In Progress</div>
          <div className="text-2xl font-bold text-warning-600">{inProgressRecords}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Completed</div>
          <div className="text-2xl font-bold text-success-600">{completedRecords}</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className={CARD.base + ' p-4 mb-6'}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search maintenance records..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' }
            ]}
          />

          <FilterDropdown
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'routine', label: 'Routine' },
              { value: 'repair', label: 'Repair' },
              { value: 'inspection', label: 'Inspection' }
            ]}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'maintenance')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'maintenance')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== maintenance?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {maintenance?.length || 0} records
          </div>
        )}
      </div>

      {/* Table with mobile card layout */}
      <Table
        columns={columns}
        data={filteredData || []}
        onRowClick={(row) => {
          setSelectedMaintenance(row)
          viewModal.openModal()
        }}
        actions={actions}
        emptyMessage="No maintenance records found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title={`Maintenance Record`}
        size="lg"
      >
        {selectedMaintenance && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vehicle ID</label>
              <p className="text-gray-900">{selectedMaintenance.vehicle_id || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Maintenance Type</label>
              <p className="text-gray-900">{getStatusConfig(selectedMaintenance.type || 'routine').label}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <StatusBadge status={selectedMaintenance.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Scheduled Date</label>
              <p className="text-gray-900">{formatDate(selectedMaintenance.scheduled_date)}</p>
            </div>
            {selectedMaintenance.completed_date && (
              <div>
                <label className="text-sm font-medium text-gray-700">Completed Date</label>
                <p className="text-gray-900">{formatDate(selectedMaintenance.completed_date, true)}</p>
              </div>
            )}
            {selectedMaintenance.cost && (
              <div>
                <label className="text-sm font-medium text-gray-700">Cost</label>
                <p className="text-gray-900">{formatCurrency(selectedMaintenance.cost, 'USD')}</p>
              </div>
            )}
            {selectedMaintenance.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedMaintenance.description}</p>
              </div>
            )}
            {selectedMaintenance.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <p className="text-gray-900">{selectedMaintenance.notes}</p>
              </div>
            )}
            
            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={viewModal.closeModal}>
                Close
              </Button>
              <Button>Edit Record</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Delete Maintenance Record?"
        message="Are you sure you want to delete this maintenance record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}