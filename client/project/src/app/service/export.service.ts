import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import { Column, ExportColumn } from 'src/app/models';

// define an interface for jsPDF autotable
interface jsPDFWithPlugin extends jsPDF {
  autotable: (options: UserOptions) => jsPDF;
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor() {}

  exportExcel(tableId: string, fileName: string): void {
    let tableData = document.getElementById(tableId);
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelFileName = fileName + '.xlsx';
    XLSX.writeFile(workbook, excelFileName);
  }

  exportPdf(headerCol: ExportColumn[], data: any, fileName: string): void {
    const doc = new jsPDF('landscape', 'px', 'a4') as jsPDFWithPlugin;
    // @ts-ignore
    doc.autoTable(headerCol, data);
    const pdfFileName = fileName + '.pdf';
    doc.save(pdfFileName);
  }
}
