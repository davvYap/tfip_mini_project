package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

public class StockIdea {

    private String id;
    private String idea;
    private int sentiment;
    private String userId;
    private String fullName;
    private String profileIcon;
    private long date;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIdea() {
        return idea;
    }

    public void setIdea(String idea) {
        this.idea = idea;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getSentiment() {
        return sentiment;
    }

    public void setSentiment(int sentiment) {
        this.sentiment = sentiment;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfileIcon() {
        return profileIcon;
    }

    public void setProfileIcon(String profileIcon) {
        this.profileIcon = profileIcon;
    }

    public long getDate() {
        return date;
    }

    public void setDate(long date) {
        this.date = date;
    }

    @Override
    public String toString() {
        return "StockIdea [id=" + id + ", idea=" + idea + ", sentiment=" + sentiment + ", userId=" + userId
                + ", fullName=" + fullName + ", date=" + date + "]";
    }

    public Document toDocument() {
        Document d = new Document();
        d.append("id", id)
                .append("userId", userId)
                .append("idea", idea)
                .append("sentiment", sentiment)
                .append("fullName", fullName)
                .append("profileIcon", profileIcon)
                .append("date", date);
        return d;
    }

    public static StockIdea convertFromDocument(Document d) {
        StockIdea idea = new StockIdea();
        idea.setId(d.getString("id"));
        idea.setIdea(d.getString("idea"));
        idea.setSentiment(d.getInteger("sentiment"));
        idea.setUserId(d.getString("userId"));
        idea.setFullName(d.getString("fullName"));
        idea.setProfileIcon(d.getString("profileIcon"));
        idea.setDate(d.getLong("date"));
        return idea;
    }

    public static StockIdea convertFromJsonString(String json) throws IOException {
        StockIdea idea = new StockIdea();
        try (InputStream is = new ByteArrayInputStream(json.getBytes())) {
            JsonReader reader = Json.createReader(is);
            JsonObject jsObj = reader.readObject();
            idea.setIdea(jsObj.getString("idea"));
            idea.setSentiment(jsObj.getInt("sentiment"));
            idea.setUserId(jsObj.getString("userId"));
            idea.setFullName(jsObj.getString("fullName"));
            idea.setProfileIcon(jsObj.getString("profileIcon"));
        }
        return idea;
    }

    public JsonObject toJsonObject() {
        return Json.createObjectBuilder()
                .add("id", id)
                .add("userId", userId)
                .add("idea", idea)
                .add("sentiment", sentiment)
                .add("fullName", fullName)
                .add("profileIcon", profileIcon)
                .add("date", date)
                .build();
    }

}
