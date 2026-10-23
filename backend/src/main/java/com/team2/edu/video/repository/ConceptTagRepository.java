package com.team2.edu.video.repository;

import com.team2.edu.video.entity.ConceptTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConceptTagRepository extends JpaRepository<ConceptTag, Integer> {
    boolean existsByCategory_IdAndName(Integer categoryId, String name);
}
