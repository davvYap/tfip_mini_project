package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

public class Stock {
    private String stockName;
    private double quantity;
    private double strikePrice;
    private String symbol;
    private long purchasedDate;
    private double fees;

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

    public long getPurchasedDate() {
        return purchasedDate;
    }

    public void setPurchasedDate(long purchasedDate) {
        this.purchasedDate = purchasedDate;
    }

    public Document toDocument() {
        Document doc = new Document();

        doc.append("stockName", stockName);
        doc.append("quantity", quantity);
        doc.append("strikePrice", strikePrice);
        doc.append("symbol", symbol);
        doc.append("purchasedDate", purchasedDate);
        doc.append("fees", fees);
        return doc;

    }

    public static Stock convertFromJsonObject(String js) throws IOException {
        Stock s = null;
        if (js != null) {
            s = new Stock();
            try (InputStream is = new ByteArrayInputStream(js.getBytes())) {
                JsonReader jr = Json.createReader(is);
                JsonObject jsObj = jr.readObject();
                s.setStockName(jsObj.getString("name"));
                s.setSymbol(jsObj.getString("symbol"));
                s.setStrikePrice((jsObj.getJsonNumber("price").doubleValue()));
                s.setQuantity((jsObj.getJsonNumber("quantity").doubleValue()));
                s.setPurchasedDate(jsObj.getJsonNumber("date").longValue());
                s.setFees((jsObj.getJsonNumber("fees").doubleValue()));
            }
        }
        return s;
    }

    public static LocalDateTime convertFromString(String date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d-M-yyyy");
        LocalDateTime datetime = LocalDateTime.parse(date, formatter);
        return datetime;
    }

}
