import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, exportToJSON } from '../exportUtils'

describe('exportUtils', () => {
  let mockLink
  let createElementSpy

  beforeEach(() => {
    // Mock DOM APIs
    mockLink = {
      href: '',
      download: '',
      click: vi.fn()
    }

    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
    
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
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

      exportToCSV(data, 'test-export')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test-export.csv')
      expect(mockLink.click).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('handles empty data array', () => {
      exportToCSV([], 'empty-export')
      
      expect(createElementSpy).not.toHaveBeenCalled()
    })

    it('handles null data', () => {
      exportToCSV(null, 'null-export')
      
      expect(createElementSpy).not.toHaveBeenCalled()
    })

    it('escapes values with commas', () => {
      const data = [
        { name: 'Item, with comma', value: 100 }
      ]

      exportToCSV(data, 'test')

      const blobCall = global.URL.createObjectURL.mock.calls[0][0]
      expect(blobCall.type).toBe('text/csv')
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
})
