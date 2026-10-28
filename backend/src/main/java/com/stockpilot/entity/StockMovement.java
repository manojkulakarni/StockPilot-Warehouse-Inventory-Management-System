package com.stockpilot.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="stock_movements") public class StockMovement {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false,fetch=FetchType.EAGER) private Product product;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private Type type;
 private int quantity; private int balanceAfter; private String note; private LocalDateTime createdAt=LocalDateTime.now();
 public enum Type { STOCK_IN, STOCK_OUT, ADJUSTMENT }
 public StockMovement(){} public StockMovement(Product p,Type t,int q,int b,String n){product=p;type=t;quantity=q;balanceAfter=b;note=n;}
 public Long getId(){return id;} public Product getProduct(){return product;} public Type getType(){return type;} public int getQuantity(){return quantity;} public int getBalanceAfter(){return balanceAfter;} public String getNote(){return note;} public LocalDateTime getCreatedAt(){return createdAt;}
}