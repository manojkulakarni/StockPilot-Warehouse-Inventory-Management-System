package com.stockpilot.repository;
import com.stockpilot.entity.CustomerOrder; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder,Long>{ List<CustomerOrder> findTop10ByOrderByCreatedAtDesc(); }