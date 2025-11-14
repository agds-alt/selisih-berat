import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export interface ExportEntry {
  id: number
  no_resi: string
  nama: string
  berat_resi: number
  berat_aktual: number
  selisih: number
  status: string
  foto_url_1?: string
  foto_url_2?: string
  catatan?: string
  created_by: string
  created_at: string
}

/**
 * Export data to Excel file
 */
export async function exportToExcel(data: ExportEntry[], filename: string = 'export.xlsx'): Promise<void> {
  try {
    // Format data for Excel
    const formattedData = data.map((entry) => ({
      'ID': entry.id,
      'No Resi': entry.no_resi,
      'Nama': entry.nama,
      'Berat Resi (kg)': entry.berat_resi,
      'Berat Aktual (kg)': entry.berat_aktual,
      'Selisih (kg)': entry.selisih,
      'Status': entry.status,
      'Foto 1': entry.foto_url_1 || '-',
      'Foto 2': entry.foto_url_2 || '-',
      'Catatan': entry.catatan || '-',
      'Dibuat Oleh': entry.created_by,
      'Tanggal Dibuat': formatDateForExport(entry.created_at),
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData)

    // Set column widths
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 20 }, // No Resi
      { wch: 25 }, // Nama
      { wch: 15 }, // Berat Resi
      { wch: 15 }, // Berat Aktual
      { wch: 12 }, // Selisih
      { wch: 12 }, // Status
      { wch: 50 }, // Foto 1
      { wch: 50 }, // Foto 2
      { wch: 30 }, // Catatan
      { wch: 15 }, // Dibuat Oleh
      { wch: 20 }, // Tanggal
    ]
    worksheet['!cols'] = columnWidths

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entries')

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    // Trigger download
    triggerDownload(blob, filename)
  } catch (error: any) {
    console.error('Error exporting to Excel:', error)
    throw new Error(`Failed to export to Excel: ${error.message}`)
  }
}

/**
 * Export data to CSV file
 */
export async function exportToCSV(data: ExportEntry[], filename: string = 'export.csv'): Promise<void> {
  try {
    // Format data for CSV
    const formattedData = data.map((entry) => ({
      'ID': entry.id,
      'No Resi': entry.no_resi,
      'Nama': entry.nama,
      'Berat Resi (kg)': entry.berat_resi,
      'Berat Aktual (kg)': entry.berat_aktual,
      'Selisih (kg)': entry.selisih,
      'Status': entry.status,
      'Foto 1': entry.foto_url_1 || '-',
      'Foto 2': entry.foto_url_2 || '-',
      'Catatan': entry.catatan || '-',
      'Dibuat Oleh': entry.created_by,
      'Tanggal Dibuat': formatDateForExport(entry.created_at),
    }))

    // Convert to CSV
    const csv = Papa.unparse(formattedData, {
      quotes: true,
      delimiter: ',',
      header: true,
    })

    // Create blob
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

    // Trigger download
    triggerDownload(blob, filename)
  } catch (error: any) {
    console.error('Error exporting to CSV:', error)
    throw new Error(`Failed to export to CSV: ${error.message}`)
  }
}

/**
 * Format date for export
 */
function formatDateForExport(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return dateString
  }
}

/**
 * Trigger browser download
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(prefix: string = 'entries', extension: string = 'xlsx'): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `${prefix}_${timestamp}.${extension}`
}
