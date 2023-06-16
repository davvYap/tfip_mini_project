package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

public class Stock {
    private String purchaseId;
    private String stockName;
    private double quantity;
    private double strikePrice;
    private String symbol;
    private long purchasedDate;
    private double fees;
    private LocalDate date;

    public String getPurchaseId() {
        return purchaseId;
    }

    public void setPurchaseId(String purchaseId) {
        this.purchaseId = purchaseId;
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

    public long getPurchasedDate() {
        return purchasedDate;
    }

    public void setPurchasedDate(long purchasedDate) {
        this.purchasedDate = purchasedDate;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Document toDocument() {
        Document doc = new Document();
        doc.append("purchase_id", purchaseId);
        doc.append("name", stockName);
        doc.append("quantity", quantity);
        doc.append("price", strikePrice);
        doc.append("symbol", symbol);
        doc.append("date", purchasedDate);
        doc.append("fees", fees);
        return doc;
    }

    public Document toDocumentSold(double profit) {
        Document doc = new Document();
        doc.append("sold_id", purchaseId);
        doc.append("name", stockName);
        doc.append("quantity", quantity);
        doc.append("price", strikePrice);
        doc.append("symbol", symbol);
        doc.append("date", purchasedDate);
        doc.append("fees", fees);
        doc.append("net_profit", profit);
        return doc;
    }

    public JsonObject toJsonObject() {
        return Json.createObjectBuilder()
                .add("purchaseId", purchaseId)
                .add("name", stockName)
                .add("quantity", quantity)
                .add("price", strikePrice)
                .add("fees", fees)
                .add("symbol", symbol)
                .add("date", purchasedDate)
                .build();
    }

    public static Stock convertFromJsonObject(String js) throws IOException {
        Stock s = null;
        if (js != null) {
            s = new Stock();
            try (InputStream is = new ByteArrayInputStream(js.getBytes())) {
                JsonReader jr = Json.createReader(is);
                JsonObject jsObj = jr.readObject();
                s.setPurchaseId(jsObj.getString("purchaseId"));
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

    public static Stock convertFromDocument(Document d) {
        Stock s = null;
        if (d != null) {
            s = new Stock();
            s.setPurchaseId(d.getString("purchase_id"));
            s.setSymbol(d.getString("symbol"));
            s.setStockName(d.getString("name"));
            s.setPurchasedDate(d.getLong("date"));
            s.setQuantity(d.getDouble("quantity"));
            s.setStrikePrice(d.getDouble("price"));
            s.setFees(d.getDouble("fees"));
        }
        return s;
    }

    public StockCount toStockCount() {
        StockCount sc = new StockCount();
        sc.setSymbol(symbol);
        sc.setQuantity(quantity);
        sc.setCost(strikePrice * quantity);
        sc.setName(stockName);
        return sc;
    }

}
