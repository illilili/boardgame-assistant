package com.boardgame.backend_spring.content.dto;

public class Generate3DModelRequest {
    private Long planId;
    private Long planElementId;
    private String elementName;
    private String description;
    private String style;

    public Generate3DModelRequest() {}

    public Generate3DModelRequest(Long planId, Long planElementId, String elementName, String description, String style) {
        this.planId = planId;
        this.planElementId = planElementId;
        this.elementName = elementName;
        this.description = description;
        this.style = style;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public Long getPlanElementId() { return planElementId; }
    public void setPlanElementId(Long planElementId) { this.planElementId = planElementId; }
    public String getElementName() { return elementName; }
    public void setElementName(String elementName) { this.elementName = elementName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
}
