package com.fidanlik.fidanysserver.common.export;

import com.fidanlik.fidanysserver.fidan.model.Plant;
import com.fidanlik.fidanysserver.fidan.service.PlantService;
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;
    private final PlantService plantService;
    // Gelecekte buraya CustomerService, OrderService gibi diğer servisleri ekleyeceğiz.

    @GetMapping("/{format}")
    public ResponseEntity<InputStreamResource> exportData(
            @PathVariable String format,
            @RequestParam String entity,
            @AuthenticationPrincipal User currentUser) throws IOException {

        String tenantId = currentUser.getTenantId();
        List<String> headers = new ArrayList<>();
        List<Map<String, Object>> data = new ArrayList<>();
        String reportTitle = "";

        // Frontend'den gelen 'entity' parametresine göre ilgili veriyi hazırla
        if ("plants".equalsIgnoreCase(entity)) {
            reportTitle = "Fidan Kimlik Raporu";
            headers = List.of("Fidan Türü", "Fidan Çeşidi", "Anaç", "Boy", "Yaş", "Arazi");
            List<Plant> plants = plantService.getAllPlantsByTenant(tenantId);
            for (Plant plant : plants) {
                // LinkedHashMap kullanarak sıralamayı koruyoruz
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("Fidan Türü", plant.getPlantType() != null ? plant.getPlantType().getName() : "");
                row.put("Fidan Çeşidi", plant.getPlantVariety() != null ? plant.getPlantVariety().getName() : "");
                row.put("Anaç", plant.getRootstock() != null ? plant.getRootstock().getName() : "");
                row.put("Boy", plant.getPlantSize() != null ? plant.getPlantSize().getName() : "");
                row.put("Yaş", plant.getPlantAge() != null ? plant.getPlantAge().getName() : "");
                row.put("Arazi", plant.getLand() != null ? plant.getLand().getName() : "");
                data.add(row);
            }
        }
        // else if ("customers".equalsIgnoreCase(entity)) { ... Müşteriler için mantık buraya eklenecek ... }
        else {
            // Bilinmeyen bir entity istenirse hata döndür
            return ResponseEntity.badRequest().build();
        }

        // Veriyi istenen formata dönüştür
        ByteArrayInputStream in;
        HttpHeaders httpHeaders = new HttpHeaders();
        String filename = entity + "-raporu." + format;
        httpHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);

        if ("pdf".equalsIgnoreCase(format)) {
            in = exportService.generatePdf(reportTitle, headers, data);
            httpHeaders.setContentType(MediaType.APPLICATION_PDF);
        } else if ("csv".equalsIgnoreCase(format)) {
            in = exportService.generateCsv(headers, data);
            httpHeaders.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok()
                .headers(httpHeaders)
                .body(new InputStreamResource(in));
    }
}