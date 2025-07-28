package com.boardgame.backend_spring.content.dto;

import java.util.List;

public class DescriptionScriptResponse {
    private Long planId;
    private String target;
    private Script script;
    private String estimatedDuration;

    public static class Script {
        private String title;
        private List<String> body;

        public Script() {}
        public Script(String title, List<String> body) {
            this.title = title;
            this.body = body;
        }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public List<String> getBody() { return body; }
        public void setBody(List<String> body) { this.body = body; }
    }

    public DescriptionScriptResponse(Long planId, String target, Script script, String estimatedDuration) {
        this.planId = planId;
        this.target = target;
        this.script = script;
        this.estimatedDuration = estimatedDuration;
    }
    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public Script getScript() { return script; }
    public void setScript(Script script) { this.script = script; }
    public String getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(String estimatedDuration) { this.estimatedDuration = estimatedDuration; }
}
