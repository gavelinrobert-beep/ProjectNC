import { useState } from 'react'
import { useMaintenance } from '../hooks/useMaintenance'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { formatDate } from '../../../utils/dateUtils'
import { getStatusColor, getStatusLabel } from '../../../utils/statusHelpers'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

export default function MaintenancePage() {
  const { data: maintenance, isLoading: loading, error, refetch } = useMaintenance()
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [showModal, setShowModal] = useState(false)

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
    searchFields: ['vehicle_id', 'description'],
    dateField: 'scheduled_date'
  })

  const columns = [
    {
      key: 'vehicle_id',
      label: 'Vehicle',
      render: (value) => value || 'N/A'
    },
    {
      key: 'type',
      label: 'Maintenance Type',
      render: (value) => getStatusLabel(value || 'routine')
    },
    {
      key: 'scheduled_date',
      label: 'Scheduled Date',
      render: (value) => formatDate(value)
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
      key: 'cost',
      label: 'Cost',
      render: (value) => value ? `$${value.toFixed(2)}` : 'N/A'
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
            setSelectedMaintenance(row)
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading Maintenance Records</h3>
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
        <LoadingSpinner size="lg" text="Loading maintenance records..." />
      </div>
    )
  }

  const totalRecords = maintenance?.length || 0
  const scheduledRecords = maintenance?.filter(m => m.status === 'scheduled').length || 0
  const inProgressRecords = maintenance?.filter(m => m.status === 'in_progress').length || 0
  const completedRecords = maintenance?.filter(m => m.status === 'completed').length || 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Maintenance</h1>
          <p className="text-gray-600 mt-2">Track vehicle maintenance and service schedules</p>
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Records</div>
          <div className="text-2xl font-bold text-gray-900">{totalRecords}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Scheduled</div>
          <div className="text-2xl font-bold text-blue-600">{scheduledRecords}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">{inProgressRecords}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">{completedRecords}</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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

      {/* Table */}
      <Table
        columns={columns}
        data={filteredData || []}
        loading={loading}
        onRowClick={(row) => {
          setSelectedMaintenance(row)
          setShowModal(true)
        }}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Maintenance Record`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Record</Button>
          </>
        }
      >
        {selectedMaintenance && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vehicle ID</label>
              <p className="text-gray-900">{selectedMaintenance.vehicle_id || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Maintenance Type</label>
              <p className="text-gray-900">{getStatusLabel(selectedMaintenance.type || 'routine')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMaintenance.status)}`}>
                  {getStatusLabel(selectedMaintenance.status)}
                </span>
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
                <p className="text-gray-900">${selectedMaintenance.cost.toFixed(2)}</p>
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
          </div>
        )}
      </Modal>
    </div>
  )
}