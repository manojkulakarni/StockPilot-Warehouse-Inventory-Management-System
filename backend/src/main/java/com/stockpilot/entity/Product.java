package com.stockpilot.entity;
import jakarta.persistence.*; import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.time.LocalDateTime;
@Entity @Table(name="products", uniqueConstraints=@UniqueConstraint(columnNames="sku"))
public class Product {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @NotBlank @Column(nullable=false) private String name;
 @NotBlank @Column(nullable=false, unique=true) private String sku;
 @NotBlank private String category;
 @Min(0) private int quantity;
 @Min(0) private int reorderLevel=10;
 @DecimalMin("0.0") @Column(precision=12,scale=2) private BigDecimal unitPrice=BigDecimal.ZERO;
 private String location="A-01";
 private LocalDateTime createdAt=LocalDateTime.now(); private LocalDateTime updatedAt=LocalDateTime.now();
 @PreUpdate public void touch(){updatedAt=LocalDateTime.now();}
 public Product(){} public Product(String name,String sku,String category,int quantity,int reorderLevel,BigDecimal unitPrice,String location){this.name=name;this.sku=sku;this.category=category;this.quantity=quantity;this.reorderLevel=reorderLevel;this.unitPrice=unitPrice;this.location=location;}
 public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getSku(){return sku;} public void setSku(String v){sku=v;} public String getCategory(){return category;} public void setCategory(String v){category=v;} public int getQuantity(){return quantity;} public void setQuantity(int v){quantity=v;} public int getReorderLevel(){return reorderLevel;} public void setReorderLevel(int v){reorderLevel=v;} public BigDecimal getUnitPrice(){return unitPrice;} public void setUnitPrice(BigDecimal v){unitPrice=v;} public String getLocation(){return location;} public void setLocation(String v){location=v;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}