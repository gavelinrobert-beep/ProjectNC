import { useState } from 'react'
import { useInventory } from '../hooks/useInventory'
import Button from '../../../components/ui/Button'
import { Table, ErrorMessage, ErrorState, EmptyState, LoadingState, NoResults, TableSkeleton } from '../../../shared/components/ui'
import Modal from '../../../shared/components/ui/Modal/Modal'
import { useModal } from '../../../shared/hooks/useModal'
import SearchBar from '../../../components/ui/SearchBar'
import FilterDropdown from '../../../components/ui/FilterDropdown'
import { useFilter } from '../../../hooks/useFilter'
import { exportToCSV, exportToJSON } from '../../../utils/exportUtils'
import { TEXT, CARD } from '../../../shared/constants/design'

export default function InventoryPage() {
  const { data: inventory, isLoading: loading, error, refetch } = useInventory()
  const [selectedItem, setSelectedItem] = useState(null)
  const viewModal = useModal()

  const getStockStatus = (item) => {
    if (!item.quantity || item.quantity === 0) return 'out_of_stock'
    if (item.quantity <= (item.reorder_level || 0)) return 'low_stock'
    return 'in_stock'
  }

  const {
    filteredData,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    stockLevelFilter,
    setStockLevelFilter,
    clearFilters
  } = useFilter(inventory, {
    searchFields: ['name', 'sku', 'category'],
    getStockStatus
  })

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockStatusLabel = (status) => {
    switch (status) {
      case 'in_stock': return 'In Stock'
      case 'low_stock': return 'Low Stock'
      case 'out_of_stock': return 'Out of Stock'
      default: return 'Unknown'
    }
  }

  const columns = [
    {
      key: 'item_name',
      label: 'Item / SKU',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium">{row.item_name || 'N/A'}</div>
          {row.sku && <div className="text-xs text-gray-500">{row.sku}</div>}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (row) => row.category || 'N/A'
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (row) => `${row.quantity || 0} ${row.unit || ''}`
    },
    {
      key: 'reorder_level',
      label: 'Reorder Level',
      sortable: true,
      render: (row) => row.reorder_level || 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const status = getStockStatus(row)
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(status)}`}>
            {getStockStatusLabel(status)}
          </span>
        )
      }
    },
  ]

  const actions = (row) => (
    <Button
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation()
        setSelectedItem(row)
        viewModal.openModal()
      }}
    >
      View
    </Button>
  )

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message="Loading inventory..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Unable to load inventory"
          message="There was a problem loading inventory. Please try again."
          onRetry={refetch}
        />
      </div>
    )
  }

  // Empty state (no inventory items at all)
  if (!inventory || inventory.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="📋"
          title="No inventory items"
          description="Start tracking your inventory by adding your first item. Monitor stock levels, track usage, and manage reorders."
          actionLabel="+ Add First Item"
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

  const totalItems = inventory?.length || 0
  const lowStockItems = inventory?.filter(item => getStockStatus(item) === 'low_stock').length || 0
  const outOfStockItems = inventory?.filter(item => getStockStatus(item) === 'out_of_stock').length || 0
  const totalValue = inventory?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_cost || 0)), 0) || 0

  return (
    <div className="p-6">
      {/* Module indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Sites Module
        </span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-600">
          Track inventory levels and movements
        </span>
      </div>

      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={TEXT.h1}>Inventory</h1>
          <p className={TEXT.bodySmall + ' mt-2'}>Track materials and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={refetch} disabled={loading}>
            🔄 Refresh
          </Button>
          <Button icon="+">
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Items</div>
          <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Low Stock</div>
          <div className="text-2xl font-bold text-warning-600">{lowStockItems}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Out of Stock</div>
          <div className="text-2xl font-bold text-danger-600">{outOfStockItems}</div>
        </div>
        <div className={CARD.p4}>
          <div className={TEXT.caption}>Total Value</div>
          <div className="text-2xl font-bold text-primary-600">${totalValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <div className={CARD.base + ' p-4 mb-6'}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              placeholder="Search inventory..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={Array.from(new Set(inventory?.map(i => i.category).filter(Boolean) || [])).map(cat => ({
              value: cat,
              label: cat
            }))}
          />

          <FilterDropdown
            label="Stock Level"
            value={stockLevelFilter}
            onChange={setStockLevelFilter}
            options={[
              { value: 'in_stock', label: 'In Stock' },
              { value: 'low_stock', label: 'Low Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' }
            ]}
          />

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={clearFilters} size="sm">
              Clear
            </Button>
            <Button variant="secondary" onClick={() => exportToCSV(filteredData, 'inventory')} size="sm">
              📥 CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToJSON(filteredData, 'inventory')} size="sm">
              📥 JSON
            </Button>
          </div>
        </div>
        {filteredData.length !== inventory?.length && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredData.length} of {inventory?.length || 0} items
          </div>
        )}
      </div>

      {/* Table with mobile card layout */}
      <Table
        columns={columns}
        data={filteredData || []}
        onRowClick={(row) => {
          setSelectedItem(row)
          viewModal.openModal()
        }}
        actions={actions}
        emptyMessage="No inventory items found"
      />

      {/* Detail Modal */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.closeModal}
        title={`Inventory Item: ${selectedItem?.item_name || selectedItem?.id}`}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Item Name</label>
              <p className="text-gray-900">{selectedItem.item_name || 'N/A'}</p>
            </div>
            {selectedItem.sku && (
              <div>
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <p className="text-gray-900">{selectedItem.sku}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <p className="text-gray-900">{selectedItem.category || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <p className="text-gray-900">{selectedItem.quantity || 0} {selectedItem.unit || ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(getStockStatus(selectedItem))}`}>
                  {getStockStatusLabel(getStockStatus(selectedItem))}
                </span>
              </div>
            </div>
            {selectedItem.reorder_level && (
              <div>
                <label className="text-sm font-medium text-gray-700">Reorder Level</label>
                <p className="text-gray-900">{selectedItem.reorder_level}</p>
              </div>
            )}
            {selectedItem.unit_cost && (
              <div>
                <label className="text-sm font-medium text-gray-700">Unit Cost</label>
                <p className="text-gray-900">${selectedItem.unit_cost.toFixed(2)}</p>
              </div>
            )}
            {selectedItem.depot_id && (
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{selectedItem.depot_id}</p>
              </div>
            )}
            {selectedItem.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedItem.description}</p>
              </div>
            )}
            
            {/* Modal Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={viewModal.closeModal}>
                Close
              </Button>
              <Button>Edit Item</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}