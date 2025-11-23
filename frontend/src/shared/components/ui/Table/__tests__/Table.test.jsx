import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Table from '../Table'

describe('Table Component', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
  ]

  const mockColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
  ]

  it('renders table with data on desktop', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    // Check headers are rendered (appear in both desktop table and mobile labels)
    const nameElements = screen.getAllByText('Name')
    expect(nameElements.length).toBeGreaterThan(0)
    
    const emailElements = screen.getAllByText('Email')
    expect(emailElements.length).toBeGreaterThan(0)
    
    const statusElements = screen.getAllByText('Status')
    expect(statusElements.length).toBeGreaterThan(0)
    
    // Check data is rendered (appears in both desktop and mobile)
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0)
  })

  it('renders empty state when no data', () => {
    render(<Table columns={mockColumns} data={[]} emptyMessage="No records found" />)
    
    expect(screen.getByText('No records found')).toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', () => {
    const onRowClick = vi.fn()
    render(<Table columns={mockColumns} data={mockData} onRowClick={onRowClick} />)
    
    // Find all instances (desktop + mobile) and click first desktop row
    const elements = screen.getAllByText('John Doe')
    const desktopRow = elements[0].closest('tr')
    if (desktopRow) {
      fireEvent.click(desktopRow)
      expect(onRowClick).toHaveBeenCalledWith(mockData[0])
    }
  })

  it('sorts data when sortable column header is clicked', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    // Find Name column header (appears in both desktop and mobile label, but header is in desktop)
    const headers = screen.getAllByText('Name')
    const nameHeader = headers[0] // Get the first one (desktop table header)
    fireEvent.click(nameHeader)
    
    // Check for sort indicator
    expect(screen.getByText('↑')).toBeInTheDocument()
    
    // Click again to reverse sort
    fireEvent.click(nameHeader)
    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('renders action buttons when actions prop provided', () => {
    const actions = (row) => (
      <button onClick={() => console.log(row)}>Edit</button>
    )
    
    render(<Table columns={mockColumns} data={mockData} actions={actions} />)
    
    // Should render Actions header
    expect(screen.getByText('Actions')).toBeInTheDocument()
    
    // Should render action buttons for each row (both desktop and mobile views)
    const editButtons = screen.getAllByText('Edit')
    // Desktop (3) + Mobile (3) = 6 total
    expect(editButtons).toHaveLength(mockData.length * 2)
  })

  it('uses custom render function when provided', () => {
    const columnsWithRender = [
      {
        key: 'name',
        label: 'Name',
        render: (row) => <span data-testid="custom-name">{row.name.toUpperCase()}</span>
      },
    ]
    
    render(<Table columns={columnsWithRender} data={mockData} />)
    
    // Check custom render is used (appears in both desktop and mobile)
    const elements = screen.getAllByText('JOHN DOE')
    expect(elements.length).toBe(2) // One in desktop table, one in mobile card
    
    const customElements = screen.getAllByTestId('custom-name')
    expect(customElements.length).toBeGreaterThan(0)
  })

  it('uses custom keyField when provided', () => {
    const dataWithCustomKey = mockData.map(item => ({ ...item, customId: item.id }))
    
    render(<Table columns={mockColumns} data={dataWithCustomKey} keyField="customId" />)
    
    // Should render without errors (will appear in both desktop and mobile views)
    const elements = screen.getAllByText('John Doe')
    expect(elements.length).toBeGreaterThan(0)
  })

  it('does not make rows clickable when onRowClick not provided', () => {
    render(<Table columns={mockColumns} data={mockData} />)
    
    // Find first instance (desktop table)
    const elements = screen.getAllByText('John Doe')
    const row = elements[0].closest('tr')
    
    // Should not have cursor-pointer class
    if (row) {
      expect(row).not.toHaveClass('cursor-pointer')
    }
  })
})
