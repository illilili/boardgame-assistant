package com.boardgame.backend_spring.copyright.dto;

import java.util.List;

public class ContentCopyrightCheckResponse {
    private float similarity;
    private boolean isSafe;
    private List<String> matches;

    public ContentCopyrightCheckResponse(float similarity, boolean isSafe, List<String> matches) {
        this.similarity = similarity;
        this.isSafe = isSafe;
        this.matches = matches;
    }

    public float getSimilarity() { return similarity; }
    public void setSimilarity(float similarity) { this.similarity = similarity; }
    public boolean isSafe() { return isSafe; }
    public void setSafe(boolean isSafe) { this.isSafe = isSafe; }
    public List<String> getMatches() { return matches; }
    public void setMatches(List<String> matches) { this.matches = matches; }
}
