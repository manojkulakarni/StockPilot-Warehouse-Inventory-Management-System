package com.stockpilot.repository;
import com.stockpilot.entity.StockMovement; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface StockMovementRepository extends JpaRepository<StockMovement,Long>{ List<StockMovement> findTop12ByOrderByCreatedAtDesc(); }