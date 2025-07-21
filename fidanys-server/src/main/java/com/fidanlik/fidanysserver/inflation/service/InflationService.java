package com.fidanlik.fidanysserver.inflation.service;

import com.fidanlik.fidanysserver.inflation.dto.TcmbItemDto;
import com.fidanlik.fidanysserver.inflation.dto.TcmbResponseDto;
import com.fidanlik.fidanysserver.inflation.model.InflationData;
import com.fidanlik.fidanysserver.inflation.repository.InflationDataRepository;
// DÜZELTME: Bu import, kullanıcı bilgilerini almak için eklendi
import com.fidanlik.fidanysserver.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
// DÜZELTME: Bu import'lar SecurityContext'e erişim için eklendi
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class InflationService {

    private final InflationDataRepository inflationDataRepository;
    private final RestTemplate restTemplate;

    @Value("${tcmb.api.key}")
    private String tcmbApiKey;

    /**
     * Aktif kullanıcıya (tenant) ait, sisteme kayıtlı tüm enflasyon verilerini getirir.
     * @return Veritabanındaki enflasyon verilerinin listesi.
     */
    public List<InflationData> getInflationDataForCurrentTenant() {
        String tenantId = getCurrentTenantId(); // Metod çağrısı ile tenantId'yi al
        return inflationDataRepository.findAllByTenantId(tenantId);
    }

    /**
     * TCMB'nin EVDS API'sinden son 5 yıllık TÜFE verisini çeker ve veritabanına kaydeder.
     * Sadece veritabanında mevcut olmayan verileri ekler.
     */
    public void fetchAndSaveInflationData() {
        String tenantId = getCurrentTenantId();
        log.info("Fetching inflation data from TCMB for tenant: {}", tenantId);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(5);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        String url = String.format(
                "https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.CPI.A&startDate=%s&endDate=%s&type=json&key=%s",
                startDate.format(formatter),
                endDate.format(formatter),
                tcmbApiKey
        );

        try {
            TcmbResponseDto response = restTemplate.getForObject(url, TcmbResponseDto.class);

            if (response != null && response.getItems() != null) {
                for (TcmbItemDto item : response.getItems()) {
                    String period = item.getDate().substring(6) + "-" + item.getDate().substring(3, 5);

                    if (inflationDataRepository.findByTenantIdAndPeriod(tenantId, period).isEmpty()) {
                        InflationData inflationData = new InflationData();
                        inflationData.setTenantId(tenantId);
                        inflationData.setPeriod(period);
                        if (Objects.nonNull(item.getCpiValue()) && !item.getCpiValue().isBlank()) {
                            inflationData.setCpiValue(Double.parseDouble(item.getCpiValue()));
                            inflationDataRepository.save(inflationData);
                            log.info("Saved inflation data for period: {}", period);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch or save inflation data from TCMB for tenant {}", tenantId, e);
            throw new RuntimeException("TCMB API'sinden veri alınırken bir hata oluştu.", e);
        }
    }

    /**
     * DÜZELTME: Bu yeni yardımcı metod, SecurityContext'ten mevcut kullanıcıyı
     * ve onun tenantId'sini güvenli bir şekilde alır.
     * @return Aktif kullanıcının tenantId'si.
     */
    private String getCurrentTenantId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Kullanıcı kimliği doğrulanamadı.");
        }
        // Spring Security, `authentication.getPrincipal()` metodunda genellikle UserDetails
        // arayüzünü implemente eden bir nesne saklar. Projenizdeki User modeli bu görevi görüyor.
        User userPrincipal = (User) authentication.getPrincipal();
        return userPrincipal.getTenantId();
    }
}