package com.stockpilot.controller;
import com.stockpilot.entity.*; import com.stockpilot.service.WarehouseService; import jakarta.validation.Valid; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api") @CrossOrigin(origins={"http://localhost:5173","http://127.0.0.1:5173"}) public class WarehouseController {
 private final WarehouseService service; public WarehouseController(WarehouseService s){service=s;}
 @GetMapping("/dashboard") public Map<String,Object> dashboard(){return service.dashboard();}
 @GetMapping("/products") public List<Product> products(@RequestParam(required=false) String q){return service.allProducts(q);}
 @GetMapping("/products/{id}") public Product product(@PathVariable Long id){return service.product(id);}
 @PostMapping("/products") public Product create(@Valid @RequestBody Product p){return service.create(p);}
 @PutMapping("/products/{id}") public Product update(@PathVariable Long id,@Valid @RequestBody Product p){return service.update(id,p);}
 @DeleteMapping("/products/{id}") public void delete(@PathVariable Long id){service.delete(id);}
 @PostMapping("/products/{id}/stock") public Product stock(@PathVariable Long id,@RequestBody Map<String,Object> body){return service.changeStock(id,Integer.parseInt(body.get("quantity").toString()),body.get("type").toString(),Objects.toString(body.get("note"),""));}
 @GetMapping("/stock-movements") public List<StockMovement> movements(){return service.movements();}
 @GetMapping("/orders") public List<CustomerOrder> orders(){return service.orders();}
 @PostMapping("/orders") public CustomerOrder order(@RequestBody Map<String,Object> body){return service.createOrder(Objects.toString(body.get("customerName"),""),(List<Map<String,Object>>)body.get("items"));}
 @GetMapping("/alerts/low-stock") public List<Product> lowStock(){return service.lowStock();}
}