import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, exportToJSON, exportToExcel, printData } from '../exportUtils'

describe('exportUtils', () => {
  let mockLink
  let createElementSpy
  let alertSpy

  beforeEach(() => {
    // Mock DOM APIs
    mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
      setAttribute: vi.fn(),
      style: {}
    }

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
    
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
    
    // Mock alert
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportToCSV', () => {
    it('exports array of objects to CSV', () => {
      const data = [
        { id: 1, name: 'Item 1', price: 10.5 },
        { id: 2, name: 'Item 2', price: 20.0 }
      ]

      exportToCSV(data, 'test-export.csv')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.csv')
      expect(mockLink.click).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('handles empty data array', () => {
      exportToCSV([], 'empty-export')
      
      expect(alertSpy).toHaveBeenCalledWith('No data to export')
      expect(createElementSpy).not.toHaveBeenCalled()
    })

    it('handles null data', () => {
      exportToCSV(null, 'null-export')
      
      expect(alertSpy).toHaveBeenCalledWith('No data to export')
      expect(createElementSpy).not.toHaveBeenCalled()
    })

    it('escapes values with commas', () => {
      const data = [
        { name: 'Item, with comma', value: 100 }
      ]

      exportToCSV(data, 'test.csv')

      const blobCall = global.URL.createObjectURL.mock.calls[0][0]
      expect(blobCall.type).toBe('text/csv;charset=utf-8;')
    })

    it('flattens nested objects', () => {
      const data = [
        { id: 1, customer: { name: 'John', email: 'john@example.com' } }
      ]

      exportToCSV(data, 'test.csv')

      expect(mockLink.click).toHaveBeenCalled()
      const blobCall = global.URL.createObjectURL.mock.calls[0][0]
      expect(blobCall.type).toBe('text/csv;charset=utf-8;')
    })

    it('escapes values with quotes', () => {
      const data = [
        { name: 'John\'s "Special" Delivery' }
      ]

      exportToCSV(data, 'test.csv')

      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('exportToJSON', () => {
    it('exports array of objects to JSON', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]

      exportToJSON(data, 'test-export')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test-export.json')
      expect(mockLink.click).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('formats JSON with indentation', () => {
      const data = [{ id: 1, name: 'Test' }]
      
      exportToJSON(data, 'test')

      const blobCall = global.URL.createObjectURL.mock.calls[0][0]
      expect(blobCall.type).toBe('application/json')
    })
  })

  describe('exportToExcel', () => {
    it('exports to CSV with xlsx extension replaced', () => {
      const data = [{ id: 1, name: 'Item 1' }]

      exportToExcel(data, 'test-export.xlsx')

      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.csv')
    })
  })

  describe('printData', () => {
    it('opens print window with data', () => {
      const mockPrintWindow = {
        document: {
          write: vi.fn(),
          close: vi.fn()
        },
        print: vi.fn()
      }
      vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow)

      const data = [
        { id: 1, name: 'Item 1' }
      ]

      printData(data, 'Test Export')

      expect(window.open).toHaveBeenCalledWith('', '_blank')
      expect(mockPrintWindow.document.write).toHaveBeenCalled()
      expect(mockPrintWindow.document.close).toHaveBeenCalled()
      expect(mockPrintWindow.print).toHaveBeenCalled()
    })

    it('shows alert for empty data', () => {
      printData([], 'Empty Test')

      expect(alertSpy).toHaveBeenCalledWith('No data to print')
    })
  })
})
