package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.bson.Document;
import org.springframework.jdbc.support.rowset.SqlRowSet;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

public class User {
    private String userId;
    private String username;
    private String firstname;
    private String lastname;
    private byte[] profilePic;

    public User() {
    }

    public User(String userId, String username) {
        this.userId = userId;
        this.username = username;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public byte[] getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(byte[] profilePic) {
        this.profilePic = profilePic;
    }

    public static User convertFromResult(SqlRowSet rs) {
        User user = new User();
        user.setUserId(rs.getString("user_id"));
        user.setUsername(rs.getString("username"));
        user.setFirstname(rs.getString("firstname"));
        user.setLastname(rs.getString("lastname"));
        return user;
    }

    public Document toDocument() {
        Document doc = new Document();
        doc.append("userId", userId);
        doc.append("username", username);
        return doc;
    }

    public static User convertFromJsonString(String js) throws IOException {
        User us = null;
        if (js != null) {
            us = new User();
            try (InputStream is = new ByteArrayInputStream(js.getBytes())) {
                JsonReader jr = Json.createReader(is);
                JsonObject jsObj = jr.readObject();
                us.setUserId(jsObj.getString("userId"));
                us.setUsername(jsObj.getString("username"));
                is.close();
            }
        }
        return us;
    }

}
