package com.fidanlik.fidanysserver.common.export;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExportService {

    public ByteArrayInputStream generatePdf(String title, List<String> headers, List<Map<String, Object>> data) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph(title).setBold().setFontSize(18));

        Table table = new Table(headers.size());

        // Başlıkları ekle
        for (String header : headers) {
            table.addHeaderCell(new Paragraph(header).setBold());
        }

        // Veri satırlarını ekle
        for (Map<String, Object> rowData : data) {
            for (String header : headers) {
                Object value = rowData.get(header);
                table.addCell(new Paragraph(value != null ? value.toString() : ""));
            }
        }

        document.add(table);
        document.close();

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateCsv(List<String> headers, List<Map<String, Object>> data) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        // Excel'in Türkçe karakterleri doğru görmesi için BOM (Byte Order Mark) ekliyoruz.
        out.write(0xEF);
        out.write(0xBB);
        out.write(0xBF);

        try (CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT.withHeader(headers.toArray(new String[0])))) {
            for (Map<String, Object> rowData : data) {
                // Veriyi başlık sırasına göre yazdır
                csvPrinter.printRecord(headers.stream().map(header -> rowData.get(header)).collect(Collectors.toList()));
            }
            csvPrinter.flush();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}