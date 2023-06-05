package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

public class UserStock {
    private int userId;
    private String username;
    private String stockName;
    private double quantity;
    private double strikePrice;
    private String symbol;
    private LocalDateTime purchasedDate;
    private double fees;

    public UserStock() {
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getStockName() {
        return stockName;
    }

    public void setStockName(String stockName) {
        this.stockName = stockName;
    }

    public double getQuantity() {
        return quantity;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public double getStrikePrice() {
        return strikePrice;
    }

    public void setStrikePrice(double strikePrice) {
        this.strikePrice = strikePrice;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public double getFees() {
        return fees;
    }

    public void setFees(double fees) {
        this.fees = fees;
    }

    public LocalDateTime getPurchasedDate() {
        return purchasedDate;
    }

    public void setPurchasedDate(LocalDateTime purchasedDate) {
        this.purchasedDate = purchasedDate;
    }

    public Document toDocument() {
        Document doc = new Document();
        doc.append("userId", userId);
        doc.append("username", username);
        doc.append("stockName", stockName);
        doc.append("quantity", quantity);
        doc.append("strikePrice", strikePrice);
        doc.append("symbol", symbol);
        doc.append("purchasedDate", purchasedDate);
        doc.append("fees", fees);
        return doc;

    }

    public static UserStock convertFromJsonString(String js) throws IOException {
        UserStock us = null;
        if (js != null) {
            us = new UserStock();
            try (InputStream is = new ByteArrayInputStream(js.getBytes())) {
                JsonReader jr = Json.createReader(is);
                JsonObject jsObj = jr.readObject();
                us.setUserId(jsObj.getInt("userId"));
                us.setUsername(jsObj.getString("username"));
                us.setStockName(jsObj.getString("stockName"));
                us.setStrikePrice(Double.parseDouble(jsObj.getString("strikePrice")));
                us.setSymbol(jsObj.getString("symbol"));
                us.setQuantity(Double.parseDouble(jsObj.getString("quantity")));
                us.setPurchasedDate(LocalDateTime.parse(jsObj.getString("purchasedDate")));
                us.setFees(Double.parseDouble(jsObj.getString("fees")));
            }
        }
        return us;
    }

}
