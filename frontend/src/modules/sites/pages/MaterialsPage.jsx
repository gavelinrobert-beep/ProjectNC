import { useState } from 'react'
import { useMaterials } from '../hooks/useMaterials'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { ErrorMessage, TableSkeleton } from '../../../shared/components/ui'
import { formatCurrency } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

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
      render: (value) => formatCurrency(value, 'USD')
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

  const totalMaterials = materials?.length || 0
  const categories = new Set(materials?.map(m => m.category).filter(Boolean))
  const categoriesCount = categories.size
  const avgCost = materials?.length > 0
    ? materials.reduce((sum, m) => sum + (m.standard_cost || 0), 0) / materials.length
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
          Manage materials and supplies
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={TEXT.h1}>Materials</h1>
          <p className={TEXT.bodySmall + ' mt-2'}>Manage material types and specifications</p>
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
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Material Types</div>
          <div className="text-2xl font-bold text-gray-900">{totalMaterials}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Categories</div>
          <div className="text-2xl font-bold text-primary-600">{categoriesCount}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Average Unit Cost</div>
          <div className="text-2xl font-bold text-success-600">${avgCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className={CARD.base + ' p-4 mb-6'}>
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
                <p className="text-gray-900">{formatCurrency(selectedMaterial.standard_cost, 'USD')}</p>
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