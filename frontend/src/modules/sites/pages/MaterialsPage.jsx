import { useState } from 'react'
import { useMaterials, useDeleteMaterial } from '../hooks/useMaterials'
import Button from '../../../components/ui/Button'
import { Table, ErrorMessage, ErrorState, EmptyState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import Modal from '../../../shared/components/ui/Modal/Modal'
import ConfirmModal from '../../../shared/components/ui/Modal/ConfirmModal'
import { useModal } from '../../../shared/hooks/useModal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { formatCurrency } from '../../../shared/utils'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function MaterialsPage() {
  const { data: materials, isLoading: loading, error, refetch } = useMaterials()
  const { mutate: deleteMaterial, isPending: deleting } = useDeleteMaterial()
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const viewModal = useModal()
  const deleteModal = useModal()

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
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (row) => row.category || 'N/A'
    },
    {
      key: 'unit',
      label: 'Unit of Measure',
      render: (row) => row.unit || 'N/A'
    },
    {
      key: 'standard_cost',
      label: 'Standard Cost',
      sortable: true,
      render: (row) => formatCurrency(row.standard_cost, 'USD')
    },
    {
      key: 'supplier',
      label: 'Supplier',
      sortable: true,
      render: (row) => row.supplier || 'N/A'
    },
  ]

  const actions = (row) => (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation()
          setSelectedMaterial(row)
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
          setSelectedMaterial(row)
          deleteModal.openModal()
        }}
      >
        Delete
      </Button>
    </>
  )

  const handleDelete = async () => {
    if (selectedMaterial) {
      deleteMaterial(selectedMaterial.id)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
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
          title="Unable to load materials"
          message="There was a problem loading materials. Please try again."
          onRetry={refetch}
        />
      </div>
    )
  }

  // Empty state (no materials at all)
  if (!materials || materials.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="📦"
          title="No materials tracked"
          description="Start tracking materials by adding your first material. Manage costs, suppliers, and specifications."
          actionLabel="+ Add First Material"
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

      {/* Table with mobile card layout */}
      <Table
        columns={columns}
        data={filteredData || []}
        onRowClick={(row) => {
          setSelectedMaterial(row)
          viewModal.openModal()
        }}
        actions={actions}
        emptyMessage="No materials found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title={`Material: ${selectedMaterial?.name || selectedMaterial?.id}`}
        size="lg"
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
            
            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={viewModal.closeModal}>
                Close
              </Button>
              <Button>Edit Material</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        title="Delete Material?"
        message="Are you sure you want to delete this material? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}