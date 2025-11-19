/**
 * PDF export utilities using jsPDF and html2canvas.
 * Provides professional PDF reports with Swedish formatting.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatSwedishDate, formatSwedishDateTime, formatSEK, formatSwedishNumber } from './formatters';

/**
 * Generate a weekly performance report PDF
 * @param {object} data - Report data including metrics, charts, and summary
 * @returns {Promise<void>}
 */
export async function generateWeeklyReport(data) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Add header with AEGIS branding
  pdf.setFontSize(24);
  pdf.setTextColor(33, 150, 243);
  pdf.text('AEGIS', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(16);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Veckorapport', margin, yPosition);

  yPosition += 5;
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Genererad: ${formatSwedishDateTime(new Date())}`, margin, yPosition);

  yPosition += 15;

  // Add summary section
  pdf.setFontSize(14);
  pdf.setTextColor(50, 50, 50);
  pdf.text('Sammanfattning', margin, yPosition);
  
  yPosition += 8;
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);

  const summary = [
    `Period: ${data.periodStart ? formatSwedishDate(data.periodStart) : 'N/A'} - ${data.periodEnd ? formatSwedishDate(data.periodEnd) : 'N/A'}`,
    `Totalt antal leveranser: ${formatSwedishNumber(data.totalDeliveries || 0)}`,
    `Avstånd: ${formatSwedishNumber(data.totalDistance || 0)} km`,
    `I tid-procent: ${data.onTimeRate || 0}%`,
    `Totalkostnad: ${formatSEK(data.totalCost || 0)}`,
  ];

  summary.forEach((line) => {
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Add performance metrics section
  pdf.setFontSize(14);
  pdf.setTextColor(50, 50, 50);
  pdf.text('Prestationsmått', margin, yPosition);
  
  yPosition += 8;

  // Add chart if available (as image)
  if (data.chartElement) {
    try {
      const canvas = await html2canvas(data.chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need a new page
      if (yPosition + imgHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Error capturing chart:', error);
      pdf.setFontSize(10);
      pdf.setTextColor(200, 0, 0);
      pdf.text('Kunde inte inkludera diagram', margin, yPosition);
      yPosition += 8;
    }
  }

  // Add footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  const footerText = `AEGIS Logistics Platform - Konfidentiellt - Sida 1`;
  pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  const filename = `aegis-veckorapport-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);

  return filename;
}

/**
 * Generate a detailed metrics report PDF
 * @param {object} data - Metrics data
 * @returns {Promise<void>}
 */
export async function generateMetricsReport(data) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(33, 150, 243);
  pdf.text('AEGIS Prestationsrapport', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Rapport genererad: ${formatSwedishDateTime(new Date())}`, margin, yPosition);

  yPosition += 15;

  // Fleet Status
  if (data.fleetStatus) {
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text('Fordonsstatus', margin, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    
    const fleetLines = [
      `Totalt antal fordon: ${formatSwedishNumber(data.fleetStatus.total || 0)}`,
      `Tillgängliga: ${formatSwedishNumber(data.fleetStatus.available || 0)}`,
      `I användning: ${formatSwedishNumber(data.fleetStatus.inUse || 0)}`,
      `Underhåll: ${formatSwedishNumber(data.fleetStatus.maintenance || 0)}`,
      `Utnyttjandegrad: ${data.fleetStatus.utilizationRate || 0}%`,
    ];
    
    fleetLines.forEach((line) => {
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
  }

  // Performance Metrics
  if (data.performance) {
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text('Prestandamått', margin, yPosition);
    
    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    
    const perfLines = [
      `Leveranser: ${formatSwedishNumber(data.performance.deliveries || 0)}`,
      `Avstånd: ${formatSwedishNumber(data.performance.distance || 0)} km`,
      `Genomsnittlig leveranstid: ${data.performance.avgTime || 0} timmar`,
      `I tid-procent: ${data.performance.onTimeRate || 0}%`,
    ];
    
    perfLines.forEach((line) => {
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  const footerText = `AEGIS Logistics Platform - Konfidentiellt`;
  pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save
  const filename = `aegis-prestationsrapport-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);

  return filename;
}

/**
 * Capture an element as PDF
 * @param {HTMLElement} element - DOM element to capture
 * @param {string} filename - Output filename
 * @returns {Promise<string>} - Filename of saved PDF
 */
export async function captureElementAsPDF(element, filename = 'rapport.pdf') {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 2 * margin);

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 2 * margin);
    }

    pdf.save(filename);
    return filename;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export default {
  generateWeeklyReport,
  generateMetricsReport,
  captureElementAsPDF,
};
