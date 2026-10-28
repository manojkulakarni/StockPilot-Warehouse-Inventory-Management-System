package com.stockpilot.entity;
import jakarta.persistence.*; import java.time.LocalDateTime; import java.util.*;
@Entity @Table(name="customer_orders") public class CustomerOrder {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String customerName;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private Status status=Status.PENDING;
 @OneToMany(mappedBy="order",cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.EAGER) private List<OrderLine> items=new ArrayList<>();
 private LocalDateTime createdAt=LocalDateTime.now();
 public enum Status { PENDING, PROCESSING, COMPLETED, CANCELLED }
 public CustomerOrder(){} public CustomerOrder(String n){customerName=n;}
 public Long getId(){return id;} public String getCustomerName(){return customerName;} public void setCustomerName(String n){customerName=n;} public Status getStatus(){return status;} public void setStatus(Status s){status=s;} public List<OrderLine> getItems(){return items;} public LocalDateTime getCreatedAt(){return createdAt;}
 public void addItem(OrderLine item){items.add(item);item.setOrder(this);}
}
