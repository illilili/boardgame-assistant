package com.boardgame.backend_spring.trendanalysis.original.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "boardgame_trends")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardgameTrend {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "game_id", unique = true, nullable = false)
    private String gameId;
    
    @Column(name = "name", nullable = false, length = 500)
    private String name;
    
    @Column(name = "geek_rating", precision = 5, scale = 3)
    private BigDecimal geekRating;
    
    @Column(name = "average_rating", precision = 4, scale = 2)
    private BigDecimal averageRating;
    
    @Column(name = "min_players")
    private Integer minPlayers;
    
    @Column(name = "max_players")
    private Integer maxPlayers;
    
    @Column(name = "min_age")
    private Integer minAge;
    
    @Column(name = "average_weight", precision = 10, scale = 8)
    private BigDecimal averageWeight;
    
    @Column(name = "year_published")
    private Integer yearPublished;
    
    @Column(name = "playing_time")
    private Integer playingTime;
    
    @Column(name = "min_play_time")
    private Integer minPlayTime;
    
    @Column(name = "max_play_time")
    private Integer maxPlayTime;
    
    @Column(name = "bayes_average_rating", precision = 4, scale = 2)
    private BigDecimal bayesAverageRating;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "categories", columnDefinition = "TEXT")
    private String categories;
    
    @Column(name = "mechanics", columnDefinition = "TEXT")
    private String mechanics;
    
    @Column(name = "game_type", length = 100)
    private String gameType;
    
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}