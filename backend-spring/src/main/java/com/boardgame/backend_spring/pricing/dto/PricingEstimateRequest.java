package com.boardgame.backend_spring.pricing.dto;

import java.util.List;

public class PricingEstimateRequest {
    private Long projectId;
    private List<Component> components;

    public static class Component {
        private String type;
        private Integer quantity;
        private Integer pages;

        public Component() {}
        public Component(String type, Integer quantity, Integer pages) {
            this.type = type;
            this.quantity = quantity;
            this.pages = pages;
        }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Integer getPages() { return pages; }
        public void setPages(Integer pages) { this.pages = pages; }
    }

    public PricingEstimateRequest() {}
    public PricingEstimateRequest(Long projectId, List<Component> components) {
        this.projectId = projectId;
        this.components = components;
    }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public List<Component> getComponents() { return components; }
    public void setComponents(List<Component> components) { this.components = components; }
}
