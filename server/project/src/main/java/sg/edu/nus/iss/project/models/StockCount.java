package sg.edu.nus.iss.project.models;

import jakarta.json.Json;
import jakarta.json.JsonObject;

public class StockCount {
    private String symbol;
    private String name;
    private double cost;
    private double quantity;

    public StockCount() {
    }

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

    public double getCost() {
        return cost;
    }

    public void setCost(double cost) {
        this.cost = cost;
    }

    public double getQuantity() {
        return quantity;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public JsonObject toJsonObject() {
        return Json.createObjectBuilder()
                .add("name", name)
                .add("symbol", symbol)
                .add("cost", cost)
                .add("quantity", quantity)
                .build();

    }

}
