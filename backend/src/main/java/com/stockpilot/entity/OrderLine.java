package com.stockpilot.entity;
import jakarta.persistence.*;
@Entity @Table(name="order_lines") public class OrderLine {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Product product;
 @ManyToOne(optional=false) private CustomerOrder order;
 private int quantity;
 public OrderLine(){} public OrderLine(Product p,int q){product=p;quantity=q;}
 public Long getId(){return id;} public Product getProduct(){return product;} public int getQuantity(){return quantity;} public CustomerOrder getOrder(){return order;} public void setOrder(CustomerOrder o){order=o;}
}