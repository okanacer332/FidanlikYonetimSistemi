package com.fidanlik.fidanysserver.reporting.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CustomerSalesReport {
    private String customerFirstName;
    private String customerLastName;
    private BigDecimal totalSalesAmount;
    private int orderCount;
}
