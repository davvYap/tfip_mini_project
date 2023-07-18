package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

public class StockProfile {
    private String symbol;
    private String name;
    private String industry;
    private long fulltimeEmployees;
    private String website;
    private String longBusinessSummary;
    private List<StockCompanyOfficer> companyOfficers;
    private String country;

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public long getFulltimeEmployees() {
        return fulltimeEmployees;
    }

    public void setFulltimeEmployees(long fulltimeEmployees) {
        this.fulltimeEmployees = fulltimeEmployees;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLongBusinessSummary() {
        return longBusinessSummary;
    }

    public void setLongBusinessSummary(String longBusinessSummary) {
        this.longBusinessSummary = longBusinessSummary;
    }

    public List<StockCompanyOfficer> getCompanyOfficers() {
        return companyOfficers;
    }

    public void setCompanyOfficers(List<StockCompanyOfficer> companyOfficers) {
        this.companyOfficers = companyOfficers;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    @Override
    public String toString() {
        return "StockProfile [symbol=" + symbol + ", name=" + name + ", industry=" + industry + ", fulltimeEmployees="
                + fulltimeEmployees + ", website=" + website + ", longBusinessSummary=" + longBusinessSummary
                + ", companyOfficers=" + companyOfficers + ", country=" + country + "]";
    }

    public static StockProfile convertFromJson(String json) throws IOException {
        StockProfile sp = new StockProfile();
        if (json != null) {
            try (InputStream is = new ByteArrayInputStream(json.getBytes())) {
                JsonReader reader = Json.createReader(is);
                JsonObject jsObj = reader.readObject();
                sp.setCountry(jsObj.getString("country"));
                sp.setFulltimeEmployees(jsObj.getJsonNumber("fullTimeEmployees").longValue());
                sp.setIndustry(jsObj.getString("industry"));
                sp.setLongBusinessSummary(jsObj.getString("longBusinessSummary"));
                sp.setWebsite(jsObj.getString("website"));

                List<StockCompanyOfficer> officers = jsObj.getJsonArray("companyOfficers").stream()
                        .map(ofc -> (JsonObject) ofc)
                        .map(ofc -> StockCompanyOfficer.convertFromJson(ofc))
                        .toList();
                sp.setCompanyOfficers(officers);
            }
        }
        return sp;
    }

    public static StockProfile convertFromJsonObject(JsonObject jsObj) {
        StockProfile sp = new StockProfile();
        sp.setCountry(jsObj.getString("country"));
        sp.setFulltimeEmployees(jsObj.getJsonNumber("fullTimeEmployees").longValue());
        sp.setIndustry(jsObj.getString("industry"));
        sp.setLongBusinessSummary(jsObj.getString("longBusinessSummary"));
        sp.setWebsite(jsObj.getString("website"));

        // System.out.println(jsObj.getJsonArray("companyOfficers"));

        List<StockCompanyOfficer> officers = jsObj.getJsonArray("companyOfficers").stream()
                .map(ofc -> (JsonObject) ofc)
                .map(ofc -> StockCompanyOfficer.convertFromJson(ofc))
                .toList();
        sp.setCompanyOfficers(officers);
        return sp;
    }

    public JsonObject toJsonObject() {
        JsonArrayBuilder jsArr = Json.createArrayBuilder();
        companyOfficers.forEach(co -> jsArr.add(co.topJsonObjectBuilder()));

        return Json.createObjectBuilder()
                .add("country", country)
                .add("name", name)
                .add("symbol", symbol)
                .add("industry", industry)
                .add("fulltimeEmployees", fulltimeEmployees)
                .add("website", website)
                .add("longBusinessSummary", longBusinessSummary)
                .add("companyOfficers", jsArr).build();
    }

    public Document toDocument() {
        // here companyOfficers null check
        List<Document> docs = companyOfficers.stream().map(co -> co.toDocument()).toList();

        Document d = new Document();
        d.append("country", country)
                .append("name", name)
                .append("symbol", symbol)
                .append("industry", industry)
                .append("fulltimeEmployees", fulltimeEmployees)
                .append("website", website)
                .append("longBusinessSummary", longBusinessSummary)
                .append("companyOfficers", docs);

        return d;
    }

    public static StockProfile convertFromDocument(Document d) {
        StockProfile sp = new StockProfile();
        if (d != null) {
            List<Document> doc = d.getList("companyOfficers", Document.class);
            List<StockCompanyOfficer> officers = doc.stream().map(dd -> StockCompanyOfficer.convertFromDocument(dd))
                    .toList();
            sp.setCompanyOfficers(officers);
            sp.setCountry(d.getString("country"));
            sp.setFulltimeEmployees(d.getLong("fulltimeEmployees"));
            sp.setIndustry(d.getString("industry"));
            sp.setLongBusinessSummary(d.getString("longBusinessSummary"));
            sp.setName(d.getString("name"));
            sp.setSymbol(d.getString("symbol"));
            sp.setWebsite(d.getString("website"));
        }
        return sp;
    }

}