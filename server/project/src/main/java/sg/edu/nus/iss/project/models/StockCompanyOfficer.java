package sg.edu.nus.iss.project.models;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class StockCompanyOfficer {
    private String name;
    private String title;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public static StockCompanyOfficer convertFromJson(JsonObject jsObj) {
        // System.out.println("1. jsonObject >> " + jsObj);
        // System.out.println("2. age >>> " + jsObj.getInt("age"));

        StockCompanyOfficer sco = new StockCompanyOfficer();
        sco.setName(jsObj.getString("name"));
        sco.setTitle(jsObj.getString("title"));
        return sco;
    }

    public JsonObjectBuilder topJsonObjectBuilder() {
        return Json.createObjectBuilder()
                .add("name", name)
                .add("title", title);

    }

    public Document toDocument() {
        Document d = new Document();
        d.append("name", name)
                .append("title", title);
        return d;
    }

    public static StockCompanyOfficer convertFromDocument(Document d) {
        StockCompanyOfficer so = new StockCompanyOfficer();
        if (d != null) {
            so.setName(d.getString("name"));
            so.setTitle(d.getString("title"));
        }
        return so;
    }

}
