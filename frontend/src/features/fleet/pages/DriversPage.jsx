import { useState } from 'react'
import { fleetApi } from '../api/fleetApi'
import { useApi } from '../../../hooks/useApi'
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

export default function DriversPage() {
  const { data: drivers, loading, error, refetch } = useApi(() => fleetApi.getDrivers())
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showModal, setShowModal] = useState(false)

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
    },
    {
      key: 'license_number',
      label: 'License Number',
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
      key: 'email',
      label: 'Contact',
      render: (value, row) => (
        <div className="text-sm">
          <div>{value || 'N/A'}</div>
          {row.phone && <div className="text-gray-500">{row.phone}</div>}
        </div>
      )
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
            setSelectedDriver(row)
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading Drivers</h3>
          </div>
          <p className="text-red-800 mb-4">{error}</p>
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
        <LoadingSpinner size="lg" text="Loading drivers..." />
      </div>
    )
  }

  const totalDrivers = drivers?.length || 0
  const activeDrivers = drivers?.filter(d => d.status === 'active').length || 0
  const onBreakDrivers = drivers?.filter(d => d.status === 'on_break').length || 0
  const offDutyDrivers = drivers?.filter(d => d.status === 'off_duty').length || 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Drivers</h1>
          <p className="text-gray-600 mt-2">Manage drivers and behavior analytics</p>
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Drivers</div>
          <div className="text-2xl font-bold text-gray-900">{totalDrivers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{activeDrivers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">On Break</div>
          <div className="text-2xl font-bold text-yellow-600">{onBreakDrivers}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Off Duty</div>
          <div className="text-2xl font-bold text-gray-600">{offDutyDrivers}</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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

      {/* Table */}
      <Table
        columns={columns}
        data={filteredData || []}
        loading={loading}
        onRowClick={(row) => {
          setSelectedDriver(row)
          setShowModal(true)
        }}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Driver: ${selectedDriver?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Driver</Button>
          </>
        }
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
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDriver.status)}`}>
                  {getStatusLabel(selectedDriver.status)}
                </span>
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
                <p className="text-gray-900">{getStatusLabel(selectedDriver.employment_status)}</p>
              </div>
            )}
            {selectedDriver.role && (
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="text-gray-900">{selectedDriver.role}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}