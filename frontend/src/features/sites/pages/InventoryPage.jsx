import { useState } from 'react'
import { sitesApi } from '../api/sitesApi'
import { useApi } from '../../../hooks/useApi'
import Button from '../../../components/ui/Button'
import Table from '../../../components/ui/Table'
import Modal from '../../../components/ui/Modal'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

export default function InventoryPage() {
  const { data: inventory, loading, error, refetch } = useApi(() => sitesApi.getAllInventory())
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const getStockStatus = (item) => {
    if (!item.quantity || item.quantity === 0) return 'out_of_stock'
    if (item.quantity <= (item.reorder_level || 0)) return 'low_stock'
    return 'in_stock'
  }

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
      render: (value, row) => (
        <div>
          <div className="font-medium">{value || 'N/A'}</div>
          {row.sku && <div className="text-xs text-gray-500">{row.sku}</div>}
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => value || 'N/A'
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value, row) => `${value || 0} ${row.unit || ''}`
    },
    {
      key: 'reorder_level',
      label: 'Reorder Level',
      render: (value) => value || 'N/A'
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const status = getStockStatus(row)
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(status)}`}>
            {getStockStatusLabel(status)}
          </span>
        )
      }
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
            setSelectedItem(row)
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
            <h3 className="text-lg font-semibold text-red-900">Error Loading Inventory</h3>
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
        <LoadingSpinner size="lg" text="Loading inventory..." />
      </div>
    )
  }

  const totalItems = inventory?.length || 0
  const lowStockItems = inventory?.filter(item => getStockStatus(item) === 'low_stock').length || 0
  const outOfStockItems = inventory?.filter(item => getStockStatus(item) === 'out_of_stock').length || 0
  const totalValue = inventory?.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_cost || 0)), 0) || 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-600 mt-2">Track materials and stock levels</p>
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Low Stock</div>
          <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="text-2xl font-bold text-blue-600">${totalValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={inventory || []}
        loading={loading}
        onRowClick={(row) => {
          setSelectedItem(row)
          setShowModal(true)
        }}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Inventory Item: ${selectedItem?.item_name || selectedItem?.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button>Edit Item</Button>
          </>
        }
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
          </div>
        )}
      </Modal>
    </div>
  )
}