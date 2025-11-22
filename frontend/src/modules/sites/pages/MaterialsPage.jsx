import { useState } from 'react'
import { useMaterials } from '../hooks/useMaterials'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'

export default function MaterialsPage() {
  const { data: materials, isLoading: loading, error, refetch } = useMaterials()
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    clearFilters
  } = useFilter(materials, {
    searchFields: ['name', 'supplier', 'category']
  })

  const columns = [
    {
      key: 'name',
      label: 'Material Name',
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => value || 'N/A'
    },
    {
      key: 'unit',
      label: 'Unit of Measure',
      render: (value) => value || 'N/A'
    },
    {
      key: 'standard_cost',
      label: 'Standard Cost',
      render: (value) => value ? `$${value.toFixed(2)}` : 'N/A'
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (value) => value || 'N/A'
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
            setSelectedMaterial(row)
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading Materials</h3>
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
        <LoadingSpinner size="lg" text="Loading materials..." />
      </div>
    )
  }

  const totalMaterials = materials?.length || 0
  const categories = new Set(materials?.map(m => m.category).filter(Boolean))
  const categoriesCount = categories.size
  const avgCost = materials?.length > 0
    ? materials.reduce((sum, m) => sum + (m.standard_cost || 0), 0) / materials.length
    : 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Materials</h1>
          <p className="text-gray-600 mt-2">Manage material types and specifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Add Material
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Material Types</div>
          <div className="text-2xl font-bold text-gray-900">{totalMaterials}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Categories</div>
          <div className="text-2xl font-bold text-blue-600">{categoriesCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Average Unit Cost</div>
          <div className="text-2xl font-bold text-green-600">${avgCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search materials..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={Array.from(new Set(materials?.map(m => m.category).filter(Boolean) || [])).map(cat => ({
              value: cat,
              label: cat
            }))}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'materials')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'materials')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== materials?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {materials?.length || 0} materials
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredData || []}
        loading={loading}
        onRowClick={(row) => {
          setSelectedMaterial(row)
          setShowModal(true)
        }}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Material: ${selectedMaterial?.name || selectedMaterial?.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Material</Button>
          </>
        }
      >
        {selectedMaterial && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Material Name</label>
              <p className="text-gray-900">{selectedMaterial.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <p className="text-gray-900">{selectedMaterial.category || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Unit of Measure</label>
              <p className="text-gray-900">{selectedMaterial.unit || 'N/A'}</p>
            </div>
            {selectedMaterial.standard_cost && (
              <div>
                <label className="text-sm font-medium text-gray-700">Standard Cost</label>
                <p className="text-gray-900">${selectedMaterial.standard_cost.toFixed(2)}</p>
              </div>
            )}
            {selectedMaterial.supplier && (
              <div>
                <label className="text-sm font-medium text-gray-700">Supplier</label>
                <p className="text-gray-900">{selectedMaterial.supplier}</p>
              </div>
            )}
            {selectedMaterial.specifications && (
              <div>
                <label className="text-sm font-medium text-gray-700">Specifications</label>
                <p className="text-gray-900">{selectedMaterial.specifications}</p>
              </div>
            )}
            {selectedMaterial.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedMaterial.description}</p>
              </div>
            )}
            {selectedMaterial.part_number && (
              <div>
                <label className="text-sm font-medium text-gray-700">Part Number</label>
                <p className="text-gray-900">{selectedMaterial.part_number}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}