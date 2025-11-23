import { useState } from 'react'
import { useDrivers } from '../hooks/useDrivers'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { StatusBadge, ErrorMessage, TableSkeleton } from '../../../shared/components/ui'
import { formatDate, getStatusConfig } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function DriversPage() {
  const { data: drivers, isLoading: loading, error, refetch } = useDrivers()
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
      render: (value) => <StatusBadge status={value} />
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

  if (loading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={5} columns={5} />
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

      {/* Desktop: Table view */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={filteredData || []}
          loading={loading}
          onRowClick={(row) => {
            setSelectedDriver(row)
            setShowModal(true)
          }}
        />
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden space-y-4">
        {filteredData?.map(driver => (
          <div 
            key={driver.id} 
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedDriver(driver)
              setShowModal(true)
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">
                {driver.name}
              </span>
              <StatusBadge status={driver.status} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">License:</span>
                <span className="text-gray-900">{driver.license_number || 'N/A'}</span>
              </div>
              {driver.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-900 text-right ml-2">{driver.email}</span>
                </div>
              )}
              {driver.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="text-gray-900">{driver.phone}</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button 
                className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg min-h-[44px] font-medium"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDriver(driver)
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
            No drivers found
          </div>
        )}
      </div>

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
          </div>
        )}
      </Modal>
    </div>
  )
}