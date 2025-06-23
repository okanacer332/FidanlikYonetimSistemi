package com.fidanlik.fidanysserver.invoicing.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvoiceItem {
    private String plantId;
    private String description;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}