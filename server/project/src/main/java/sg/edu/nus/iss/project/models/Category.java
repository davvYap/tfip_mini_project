package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.jdbc.support.rowset.SqlRowSet;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;

public class Category {
    private int categoryId;
    private String categoryName;
    private String type;

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public static Category convertFromResult(SqlRowSet rs) {
        Category cat = new Category();
        cat.setCategoryId(rs.getInt("cat_id"));
        cat.setCategoryName(rs.getString("cat_name"));
        cat.setType(rs.getString("type"));
        return cat;
    }

    public JsonObjectBuilder toJsonObjectBuilder() {
        return Json.createObjectBuilder()
                .add("categoryId", categoryId)
                .add("categoryName", categoryName)
                .add("type", type);
    }

    public static Category convertFromJsonString(String json) throws IOException {
        Category cat = new Category();
        try (InputStream is = new ByteArrayInputStream(json.getBytes())) {
            JsonReader reader = Json.createReader(is);
            JsonObject jsObj = reader.readObject();
            cat.setCategoryId(jsObj.getInt("categoryId"));
            cat.setCategoryName(jsObj.getString("categoryName"));
            cat.setType(jsObj.getString("type"));
        }
        return cat;
    }

}
