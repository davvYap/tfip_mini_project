package sg.edu.nus.iss.project.models;

import org.springframework.jdbc.support.rowset.SqlRowSet;

import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;

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

}
