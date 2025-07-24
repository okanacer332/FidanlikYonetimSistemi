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
        DateTimeFormatter dbFormatter = DateTimeFormatter.ofPattern("yyyy-M");

        log.info("{} adet veri kalemi bulundu. Veritabanı işleniyor...", items.size());

        List<InflationData> toSave = new ArrayList<>();

        for (TcmbItem item : items) {
            if (item.getValue() == null || item.getValue().trim().isEmpty() || item.getValue().equalsIgnoreCase("null")) {
                log.warn("TCMB verisinde boş veya geçersiz değer atlandı: {}", item); // Geçersiz öğeleri logla
                continue;
            }

            try { // Parsing hatalarını yakalamak için try-catch eklendi
                java.time.YearMonth yearMonth = java.time.YearMonth.parse(item.getDate(), dbFormatter);
                LocalDate itemDate = yearMonth.atDay(1);
                BigDecimal itemValue = new BigDecimal(item.getValue());

                InflationData data = inflationDataRepository.findByDate(itemDate)
                        .orElse(new InflationData());

                data.setDate(itemDate);
                data.setValue(itemValue);
                data.setSeriesName("TP.FG.J01"); // Serinin kodu API isteğinizden bilindiği için doğrudan atandı
                toSave.add(data);
                log.debug("Listeye eklenecek veri: {}", data); // Her öğeyi eklemeden önce logla

            } catch (Exception e) {
                log.error("TCMB verisi '{}' işlenirken hata oluştu: {}", item, e.getMessage()); // Parsing hatasını detaylı logla
            }
        }

        if (!toSave.isEmpty()) {
            log.info("Kaydedilecek {} adet veri var. Veritabanına yazılıyor...", toSave.size());
            log.debug("Kaydedilecek verilerin ilk 3 tanesi: {}", toSave.stream().limit(3).toList()); // Debug amaçlı ilk 3 veriyi göster
            try {
                List<InflationData> savedEntities = inflationDataRepository.saveAll(toSave); // saveAll'un dönüş değerini yakala
                log.info("Veriler başarıyla veritabanına yazıldı. Kaydedilen toplam: {}", savedEntities.size()); // Dönüş değerini logla
                log.debug("Kaydedilen verilerin ilk 3 tanesi (id'leri ile): {}", savedEntities.stream().limit(3).toList()); // Kaydedilen verilerin ID'lerini kontrol et
            } catch (Exception e) {
                log.error("Veriler veritabanına kaydedilirken beklenmedik bir hata oluştu: {}", e.getMessage(), e); // saveAll hatasını yakala
            }
        } else {
            log.warn("Kaydedilecek veri bulunamadı.");
        }

        log.info("Enflasyon verilerini çekme ve kaydetme işlemi başarıyla tamamlandı.");
    }

    public List<InflationData> getAllInflationData() {
        log.info("Tüm enflasyon verileri veritabanından getiriliyor...");
        List<InflationData> allData = inflationDataRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "date"));
        log.info("Veritabanından toplam {} adet enflasyon verisi bulundu.", allData.size()); // Getirilen veri sayısını logla
        log.debug("Veritabanından getirilen ilk 3 enflasyon verisi: {}", allData.stream().limit(3).toList()); // Getirilen verilerin ilk 3'ünü logla
        return allData;
    }
}