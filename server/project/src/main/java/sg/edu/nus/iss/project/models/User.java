package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.bson.Document;
import org.springframework.jdbc.support.rowset.SqlRowSet;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.json.JsonString;

public class User {
    private String userId;
    private String username;
    private String password;
    private String email;
    private String firstname;
    private String lastname;
    private String profileIcon;

    public User() {
    }

    public User(String userId, String username) {
        this.userId = userId;
        this.username = username;
    }

    public User(String username, String password, String email, String firstname, String lastname) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getProfileIcon() {
        return profileIcon;
    }

    public void setProfileIcon(String profileIcon) {
        this.profileIcon = profileIcon;
    }

    public static User convertFromResult(SqlRowSet rs) {
        User user = new User();
        user.setUserId(rs.getString("user_id"));
        user.setUsername(rs.getString("username"));
        user.setFirstname(rs.getString("firstname"));
        user.setLastname(rs.getString("lastname"));
        user.setPassword(rs.getString("password"));
        user.setEmail(rs.getString("email"));
        return user;
    }

    public Document toDocument() {
        Document doc = new Document();
        doc.append("userId", userId);
        doc.append("username", username);
        return doc;
    }

    public static User convertFromJsonStringAuth(String js) throws IOException {
        User us = null;
        if (js != null) {
            us = new User();
            try (InputStream is = new ByteArrayInputStream(js.getBytes())) {
                JsonReader jr = Json.createReader(is);
                JsonObject jsObj = jr.readObject();
                us.setUsername(jsObj.getString("username"));
                us.setPassword(jsObj.getString("password"));
                is.close();
            }
        }
        return us;
    }

    public static User convertFromJsonString(String js) throws IOException {
        User us = null;
        if (js != null) {
            us = new User();
            try (InputStream is = new ByteArrayInputStream(js.getBytes())) {
                JsonReader jr = Json.createReader(is);
                JsonObject jsObj = jr.readObject();
                us.setUsername(jsObj.getString("username"));
                us.setPassword(jsObj.getString("password"));
                us.setEmail(jsObj.getString("email"));
                us.setFirstname(jsObj.getString("firstname"));
                us.setLastname(jsObj.getString("lastname"));
                is.close();
            }
        }
        return us;
    }

    public static User convertFromJsonStringGoogleUser(String js) throws IOException {
        User us = null;
        if (js != null) {
            us = new User();
            try (InputStream is = new ByteArrayInputStream(js.getBytes())) {
                JsonReader jr = Json.createReader(is);
                JsonObject jsObj = jr.readObject();
                JsonString userJson = jsObj.getJsonString("userId");
                if (userJson != null) {
                    us.setUserId(jsObj.getString("userId"));
                } else {
                    us.setUserId("NA");
                }

                JsonString usernameJson = jsObj.getJsonString("username");
                if (usernameJson != null) {
                    us.setUsername(jsObj.getString("username"));
                } else {
                    us.setUsername("NA");
                }

                JsonString passwordJson = jsObj.getJsonString("password");
                if (passwordJson != null) {
                    us.setPassword(jsObj.getString("password"));
                } else {
                    us.setPassword("NA");
                }

                JsonString emailJson = jsObj.getJsonString("email");
                if (emailJson != null) {
                    us.setEmail(jsObj.getString("email"));
                } else {
                    us.setEmail("NA");

                }

                JsonString firstnameJson = jsObj.getJsonString("firstname");
                if (firstnameJson != null) {
                    us.setFirstname(jsObj.getString("firstname"));
                } else {
                    us.setFirstname("NA");
                }

                JsonString lastnameJson = jsObj.getJsonString("lastname");
                if (lastnameJson != null) {
                    us.setLastname(jsObj.getString("lastname"));
                } else {
                    us.setLastname("NA");
                }
                is.close();
            }
        }
        return us;
    }

    public JsonObjectBuilder toJsonBuilder() {
        return Json.createObjectBuilder()
                .add("firstname", firstname)
                .add("lastname", lastname)
                .add("password", password)
                .add("email", email)
                .add("username", username);
    }

}
