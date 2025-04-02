import { FuzzingResult, ExportFormat } from "@/types/results";
import { jsPDF } from "jspdf";
import { stringify } from "csv-stringify/sync";
import { saveAs } from "file-saver";

export const exportResults = async (
  results: FuzzingResult[],
  format: ExportFormat
) => {
  switch (format) {
    case "json":
      return exportToJson(results);
    case "csv":
      return exportToCsv(results);
    case "pdf":
      return exportToPdf(results);
    default:
      throw new Error("Unsupported export format");
  }
};

const exportToJson = (results: FuzzingResult[]) => {
  const blob = new Blob([JSON.stringify(results, null, 2)], {
    type: "application/json",
  });
  saveAs(blob, `fuzzify-results-${new Date().toISOString()}.json`);
};

const exportToCsv = (results: FuzzingResult[]) => {
  const headers = [
    "Module",
    "Type",
    "URL",
    "Status",
    "Description",
    "Severity",
    "Timestamp",
  ];
  const rows = results.flatMap((result) =>
    result.findings.map((finding) => [
      result.module,
      finding.type,
      finding.url,
      finding.status,
      finding.description,
      finding.severity,
      result.timestamp,
    ])
  );

  const csvContent = stringify([headers, ...rows], {
    header: false,
    columns: headers.reduce(
      (acc, header) => ({ ...acc, [header]: header }),
      {}
    ),
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `fuzzify-results-${new Date().toISOString()}.csv`);
};

const exportToPdf = (results: FuzzingResult[]) => {
  const doc = new jsPDF();
  let yOffset = 20;

  // Add title
  doc.setFontSize(16);
  doc.text("Fuzzify Security Scan Results", 20, yOffset);
  yOffset += 20;

  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yOffset);
  yOffset += 20;

  // Add results
  doc.setFontSize(12);
  results.forEach((result, index) => {
    // Check if we need a new page
    if (yOffset > 250) {
      doc.addPage();
      yOffset = 20;
    }

    // Add result header
    doc.setFont(undefined, "bold");
    doc.text(`Finding ${index + 1}: ${result.module}`, 20, yOffset);
    yOffset += 10;

    // Add result details
    doc.setFont(undefined, "normal");
    doc.text(`Type: ${result.type}`, 20, yOffset);
    yOffset += 7;
    doc.text(`URL: ${result.url}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Status: ${result.status}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Severity: ${result.severity}`, 20, yOffset);
    yOffset += 7;
    doc.text(`Description: ${result.description}`, 20, yOffset);
    yOffset += 15;
  });

  // Save the PDF
  doc.save(`fuzzify-results-${new Date().toISOString()}.pdf`);
};
