/**
 * Excel/CSV export utilities using the xlsx library.
 * Provides data export functionality with Swedish formatting.
 */
import * as XLSX from 'xlsx';
import { formatSwedishDate, formatSwedishNumber, formatSEK } from './formatters';

/**
 * Export data to Excel file
 * @param {Array<object>} data - Array of objects to export
 * @param {string} filename - Filename without extension
 * @param {string} sheetName - Name of the worksheet
 * @returns {void}
 */
export function exportToExcel(data, filename = 'export', sheetName = 'Data') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fullFilename);

    return fullFilename;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

/**
 * Export data to CSV file
 * @param {Array<object>} data - Array of objects to export
 * @param {string} filename - Filename without extension
 * @returns {void}
 */
export function exportToCSV(data, filename = 'export') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);

    // Convert to CSV
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}.csv`;
    
    link.href = URL.createObjectURL(blob);
    link.download = fullFilename;
    link.click();

    // Cleanup
    URL.revokeObjectURL(link.href);

    return fullFilename;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

/**
 * Export shipments data to Excel with formatting
 * @param {Array<object>} shipments - Shipments data
 * @returns {string} - Filename of exported file
 */
export function exportShipmentsToExcel(shipments) {
  if (!shipments || shipments.length === 0) {
    throw new Error('No shipments data to export');
  }

  // Format data for export
  const formattedData = shipments.map(shipment => ({
    'Spårningsnummer': shipment.tracking_number || 'N/A',
    'Status': shipment.status || 'N/A',
    'Avsändare': shipment.sender_name || 'N/A',
    'Mottagare': shipment.recipient_name || 'N/A',
    'Upphämtning': shipment.pickup_address || 'N/A',
    'Leverans': shipment.delivery_address || 'N/A',
    'Skapad': shipment.created_at ? formatSwedishDate(shipment.created_at) : 'N/A',
    'Upphämtad': shipment.picked_up_at ? formatSwedishDate(shipment.picked_up_at) : 'N/A',
    'Levererad': shipment.delivered_at ? formatSwedishDate(shipment.delivered_at) : 'N/A',
    'Vikt (kg)': shipment.weight_kg ? formatSwedishNumber(shipment.weight_kg) : 'N/A',
    'Kostnad': shipment.cost ? formatSEK(shipment.cost) : 'N/A',
  }));

  return exportToExcel(formattedData, 'aegis-leveranser', 'Leveranser');
}

/**
 * Export assets data to Excel with formatting
 * @param {Array<object>} assets - Assets data
 * @returns {string} - Filename of exported file
 */
export function exportAssetsToExcel(assets) {
  if (!assets || assets.length === 0) {
    throw new Error('No assets data to export');
  }

  // Format data for export
  const formattedData = assets.map(asset => ({
    'Fordons-ID': asset.id || 'N/A',
    'Registreringsnummer': asset.license_plate || 'N/A',
    'Typ': asset.type || 'N/A',
    'Status': asset.status || 'N/A',
    'Tillverkare': asset.manufacturer || 'N/A',
    'Modell': asset.model || 'N/A',
    'År': asset.year || 'N/A',
    'Bränslenivå (%)': asset.fuel_level || 'N/A',
    'Mätarställning (km)': asset.odometer_km ? formatSwedishNumber(asset.odometer_km) : 'N/A',
    'Underhållsstatus': asset.maintenance_status || 'N/A',
    'Senaste underhåll': asset.last_maintenance ? formatSwedishDate(asset.last_maintenance) : 'N/A',
    'Förare': asset.assigned_driver || 'N/A',
    'Anläggning': asset.current_facility || 'N/A',
  }));

  return exportToExcel(formattedData, 'aegis-fordon', 'Fordon');
}

/**
 * Export drivers data to Excel with formatting
 * @param {Array<object>} drivers - Drivers data
 * @returns {string} - Filename of exported file
 */
export function exportDriversToExcel(drivers) {
  if (!drivers || drivers.length === 0) {
    throw new Error('No drivers data to export');
  }

  // Format data for export
  const formattedData = drivers.map(driver => ({
    'Namn': driver.name || 'N/A',
    'Status': driver.status || 'N/A',
    'Telefon': driver.phone || 'N/A',
    'E-post': driver.email || 'N/A',
    'Körkortsnummer': driver.license_number || 'N/A',
    'Tilldelat fordon': driver.assigned_vehicle || 'N/A',
    'Anställd sedan': driver.hired_date ? formatSwedishDate(driver.hired_date) : 'N/A',
    'Senaste körning': driver.last_shift ? formatSwedishDate(driver.last_shift) : 'N/A',
  }));

  return exportToExcel(formattedData, 'aegis-forare', 'Förare');
}

/**
 * Export performance metrics to Excel
 * @param {object} metrics - Performance metrics data
 * @returns {string} - Filename of exported file
 */
export function exportMetricsToExcel(metrics) {
  if (!metrics) {
    throw new Error('No metrics data to export');
  }

  // Create summary data
  const summaryData = [
    { Mått: 'Totalt antal leveranser', Värde: formatSwedishNumber(metrics.totalDeliveries || 0) },
    { Mått: 'Totalt avstånd (km)', Värde: formatSwedishNumber(metrics.totalDistance || 0) },
    { Mått: 'Genomsnittlig leveranstid (timmar)', Värde: formatSwedishNumber(metrics.avgDeliveryTime || 0) },
    { Mått: 'I tid-procent', Värde: `${metrics.onTimeRate || 0}%` },
    { Mått: 'Totalkostnad', Värde: formatSEK(metrics.totalCost || 0) },
    { Mått: 'Genomsnittlig kostnad per leverans', Värde: formatSEK(metrics.avgCostPerDelivery || 0) },
  ];

  // Create workbook with multiple sheets
  const wb = XLSX.utils.book_new();

  // Add summary sheet
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Sammanfattning');

  // Add historical data if available
  if (metrics.historicalData && metrics.historicalData.length > 0) {
    const historicalWs = XLSX.utils.json_to_sheet(metrics.historicalData);
    XLSX.utils.book_append_sheet(wb, historicalWs, 'Historiska data');
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `aegis-prestandamatning-${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);

  return filename;
}

/**
 * Export multiple sheets to a single Excel file
 * @param {object} sheets - Object with sheet names as keys and data arrays as values
 * @param {string} filename - Filename without extension
 * @returns {string} - Filename of exported file
 */
export function exportMultipleSheets(sheets, filename = 'export') {
  if (!sheets || Object.keys(sheets).length === 0) {
    throw new Error('No sheets data to export');
  }

  try {
    const wb = XLSX.utils.book_new();

    // Add each sheet
    Object.entries(sheets).forEach(([sheetName, data]) => {
      if (data && data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}-${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fullFilename);

    return fullFilename;
  } catch (error) {
    console.error('Error exporting multiple sheets:', error);
    throw error;
  }
}

export default {
  exportToExcel,
  exportToCSV,
  exportShipmentsToExcel,
  exportAssetsToExcel,
  exportDriversToExcel,
  exportMetricsToExcel,
  exportMultipleSheets,
};
