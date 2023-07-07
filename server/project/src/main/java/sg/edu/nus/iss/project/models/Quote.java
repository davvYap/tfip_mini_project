package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

public class Quote {
    private String q;
    private String a;
    private String h;

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q;
    }

    public String getA() {
        return a;
    }

    public void setA(String a) {
        this.a = a;
    }

    public String getH() {
        return h;
    }

    public void setH(String h) {
        this.h = h;
    }

    public static Quote convertFromJsonString(String json) throws IOException {
        Quote q = new Quote();
        try (InputStream is = new ByteArrayInputStream(json.getBytes())) {
            JsonReader reader = Json.createReader(is);
            JsonArray jsArr = reader.readArray();
            JsonObject jsObj = jsArr.getJsonObject(0);
            q.setQ(jsObj.getString("q"));
            q.setA(jsObj.getString("a"));
            q.setH(jsObj.getString("h"));
        }
        return q;
    }

}
