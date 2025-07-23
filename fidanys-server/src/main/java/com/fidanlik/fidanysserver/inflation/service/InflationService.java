package com.fidanlik.fidanysserver.inflation.service;

import com.fidanlik.fidanysserver.inflation.dto.TcmbItem;
import com.fidanlik.fidanysserver.inflation.dto.TcmbResponse;
import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.inflation.repository.InflationDataRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InflationService {

    private static final Logger log = LoggerFactory.getLogger(InflationService.class);
    private final InflationDataRepository inflationDataRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${tcmb.api.key}")
    private String apiKey;

    // @Transactional anotasyonunu ve ilgili importu tamamen kaldırdık.
    public void fetchAndSaveInflationData(LocalDate startDate, LocalDate endDate) {

        DateTimeFormatter tcmbApiFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String formattedStartDate = startDate.format(tcmbApiFormatter);
        String formattedEndDate = endDate.format(tcmbApiFormatter);

        log.info("{} ve {} tarihleri arasındaki enflasyon verileri çekiliyor...", formattedStartDate, formattedEndDate);

        String finalUrl = String.format(
                "https://evds2.tcmb.gov.tr/service/evds/series=TP.FG.J01&startDate=%s&endDate=%s&type=json&formulas=1&frequency=5",
                formattedStartDate,
                formattedEndDate
        );

        TcmbResponse response = webClientBuilder.build()
                .get()
                .uri(finalUrl)
                .header("key", apiKey)
                .header("User-Agent", "Mozilla/5.0")
                .retrieve()
                .bodyToMono(TcmbResponse.class)
                .block();

        if (response == null || response.getItems() == null) {
            log.error("TCMB'den veri çekilemedi veya gelen yanıt boş.");
            return;
        }

        List<TcmbItem> items = response.getItems();
        DateTimeFormatter dbFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        log.info("{} adet veri kalemi bulundu. Veritabanı işleniyor...", items.size());

        List<InflationData> toSave = new ArrayList<>();

        for (TcmbItem item : items) {
            if (item.getValue() == null || item.getValue().trim().isEmpty() || item.getValue().equalsIgnoreCase("null")) {
                continue;
            }

            LocalDate itemDate = LocalDate.parse(item.getDate(), dbFormatter);
            BigDecimal itemValue = new BigDecimal(item.getValue());

            InflationData data = inflationDataRepository.findByDate(itemDate)
                    .orElse(new InflationData()); // Varsa al, yoksa yeni oluştur

            data.setDate(itemDate);
            data.setValue(itemValue);
            data.setSeriesName(item.getSeriesCode());
            toSave.add(data);
        }

        if (!toSave.isEmpty()) {
            log.info("Kaydedilecek {} adet veri var. Veritabanına yazılıyor...", toSave.size());
            inflationDataRepository.saveAll(toSave); // Tüm verileri tek seferde kaydet
            log.info("Veriler başarıyla veritabanına yazıldı.");
        }

        log.info("Enflasyon verilerini çekme ve kaydetme işlemi başarıyla tamamlandı.");
    }

    public List<InflationData> getAllInflationData() {
        log.info("Tüm enflasyon verileri veritabanından getiriliyor...");
        return inflationDataRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "date"));
    }
}