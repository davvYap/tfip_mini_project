package sg.edu.nus.iss.project.models;

import java.time.LocalDate;

import org.bson.Document;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

public class StockPrice {
    private String date;
    private double closePrice;
    private long volume;
    private String symbol;
    private LocalDate localDate;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public double getClosePrice() {
        return closePrice;
    }

    public void setClosePrice(double closePrice) {
        this.closePrice = closePrice;
    }

    public long getVolume() {
        return volume;
    }

    public void setVolume(long volume) {
        this.volume = volume;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public LocalDate getLocalDate() {
        return localDate;
    }

    public void setLocalDate(LocalDate localDate) {
        this.localDate = localDate;
    }

    public static StockPrice convertFromJsonObject(JsonObject js) {
        StockPrice sp = new StockPrice();

        // sp.setSymbol(js.getString("symbol"));
        sp.setClosePrice(js.getJsonNumber("close").doubleValue());
        sp.setVolume(js.getJsonNumber("volume").longValue());
        sp.setDate(js.getString("date").substring(0, 10));

        return sp;
    }

    public Document toDocument() {
        Document d = new Document();
        d.append("date", date);
        d.append("close", closePrice);
        d.append("volume", volume);
        d.append("symbol", symbol);
        return d;
    }

    public static StockPrice convertFromDocument(Document d) {
        StockPrice sp = new StockPrice();
        sp.setDate(d.getString("date"));
        sp.setClosePrice(d.getDouble("close"));
        sp.setVolume(d.getLong("volume"));
        sp.setSymbol(d.getString("symbol"));
        return sp;
    }

    public JsonObjectBuilder toJsonObjectBuilder() {
        return Json.createObjectBuilder()
                .add("date", date)
                .add("close", closePrice)
                .add("symbol", symbol)
                .add("volume", volume);
    }

}
