package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;

public class MortgagePortfolio {
    private String id;
    private double monthlyRepayment;
    private int totalPeriod;
    private double totalRepayment;
    private double interest;
    private double loanAmount;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public double getMonthlyRepayment() {
        return monthlyRepayment;
    }

    public void setMonthlyRepayment(double monthlyRepayment) {
        this.monthlyRepayment = monthlyRepayment;
    }

    public int getTotalPeriod() {
        return totalPeriod;
    }

    public void setTotalPeriod(int totalPeriod) {
        this.totalPeriod = totalPeriod;
    }

    public double getTotalRepayment() {
        return totalRepayment;
    }

    public void setTotalRepayment(double totalRepayment) {
        this.totalRepayment = totalRepayment;
    }

    public double getInterest() {
        return interest;
    }

    public void setInterest(double interest) {
        this.interest = interest;
    }

    public double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(double loanAmount) {
        this.loanAmount = loanAmount;
    }

    public static MortgagePortfolio convertFromJsonString(String json) throws IOException {
        MortgagePortfolio mp = new MortgagePortfolio();
        try (InputStream is = new ByteArrayInputStream(json.getBytes())) {
            JsonReader reader = Json.createReader(is);
            JsonObject jsObj = reader.readObject();
            mp.setId(jsObj.getString("id"));
            mp.setMonthlyRepayment(jsObj.getJsonNumber("monthlyRepayment").doubleValue());
            mp.setInterest(jsObj.getJsonNumber("interest").doubleValue());
            mp.setTotalPeriod(jsObj.getInt("totalPeriod"));
            mp.setTotalRepayment(jsObj.getJsonNumber("totalRepayment").doubleValue());
            mp.setLoanAmount(jsObj.getJsonNumber("loanAmount").doubleValue());
        }
        return mp;
    }

    public Document toDocument() {
        Document d = new Document();
        d.append("id", id)
                .append("interest", interest)
                .append("totalPeriod", totalPeriod)
                .append("totalRepayment", totalRepayment)
                .append("monthlyRepayment", monthlyRepayment)
                .append("loanAmount", loanAmount);
        return d;

    }

    public static MortgagePortfolio convertFromDocument(Document d) {
        MortgagePortfolio mp = null;
        if (d != null) {
            mp = new MortgagePortfolio();
            mp.setId(d.getString("id"));
            mp.setInterest(d.getDouble("interest"));
            mp.setMonthlyRepayment(d.getDouble("monthlyRepayment"));
            mp.setTotalPeriod(d.getInteger("totalPeriod"));
            mp.setTotalRepayment(d.getDouble("totalRepayment"));
            mp.setLoanAmount(d.getDouble("loanAmount"));
        }
        return mp;
    }

    public JsonObjectBuilder toJsonObjectBuilder() {
        return Json.createObjectBuilder()
                .add("id", id)
                .add("interest", interest)
                .add("totalPeriod", totalPeriod)
                .add("totalRepayment", totalRepayment)
                .add("monthlyRepayment", monthlyRepayment)
                .add("loanAmount", loanAmount);
    }

}
