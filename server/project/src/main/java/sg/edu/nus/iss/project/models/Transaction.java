package sg.edu.nus.iss.project.models;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.jdbc.support.rowset.SqlRowSet;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;

public class Transaction {
    private String transactionId;
    private String transactionName;
    private LocalDate date;
    private double amount;
    private String remarks;
    private String categoryName;
    private Integer categoryId;
    private String type;
    private boolean regularTransaction;

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getTransactionName() {
        return transactionName;
    }

    public void setTransactionName(String transactionName) {
        this.transactionName = transactionName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRegularTransaction() {
        return regularTransaction;
    }

    public void setRegularTransaction(boolean regularTransaction) {
        this.regularTransaction = regularTransaction;
    }

    public static Transaction convertFromResult(SqlRowSet rs) {
        Transaction t = new Transaction();
        t.setTransactionId(rs.getString("trans_id"));
        t.setTransactionName(rs.getString("trans_name"));
        Date date = rs.getDate("date_of_trans");
        if (date != null) {
            LocalDate localDate = date.toLocalDate();
            t.setDate(localDate);
        }
        t.setAmount(rs.getDouble("amount"));
        t.setType(rs.getString("type"));
        t.setRemarks(rs.getString("remarks"));
        t.setCategoryId(rs.getInt("cat_id"));
        t.setCategoryName(rs.getString("cat_name"));
        return t;
    }

    public static Transaction convertFromResultsNoJoin(SqlRowSet rs) {
        Transaction t = new Transaction();
        t.setTransactionId(rs.getString("trans_id"));
        t.setTransactionName(rs.getString("trans_name"));
        Date date = rs.getDate("date_of_trans");
        if (date != null) {
            LocalDate localDate = date.toLocalDate();
            t.setDate(localDate);
        }
        t.setAmount(rs.getDouble("amount"));
        t.setRemarks(rs.getString("remarks"));
        t.setCategoryId(rs.getInt("cat_id"));
        return t;
    }

    public JsonObjectBuilder toJsonObjectBuilder() {
        return Json.createObjectBuilder()
                .add("categoryName", categoryName)
                .add("categoryId", categoryId)
                .add("transactionId", transactionId)
                .add("transactionName", transactionName)
                .add("type", type)
                .add("amount", amount)
                .add("date", date.toString())
                .add("remarks", remarks);
    }

    public static Transaction convertFromJsonAdd(String jsonStr) throws IOException {
        Transaction t = new Transaction();
        try (InputStream is = new ByteArrayInputStream(jsonStr.getBytes())) {
            JsonReader reader = Json.createReader(is);
            JsonObject jsObj = reader.readObject();
            t.setTransactionId(jsObj.getString("transactionId"));
            t.setTransactionName(jsObj.getString("transactionName"));
            t.setAmount(jsObj.getJsonNumber("amount").doubleValue());
            t.setCategoryName(jsObj.getString("categoryName"));
            t.setRemarks(jsObj.getString("remarks"));
            t.setRegularTransaction(jsObj.getBoolean("regular"));

            String dateStr = jsObj.getString("date");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            t.setDate(LocalDate.parse(dateStr, formatter));
        }
        return t;
    }

    public static Transaction convertFromJsonUpdate(String jsonStr) throws IOException {
        Transaction t = new Transaction();
        try (InputStream is = new ByteArrayInputStream(jsonStr.getBytes())) {
            JsonReader reader = Json.createReader(is);
            JsonObject jsObj = reader.readObject();
            t.setTransactionId(jsObj.getString("transactionId"));
            t.setTransactionName(jsObj.getString("transactionName"));
            t.setAmount(jsObj.getJsonNumber("amount").doubleValue());
            t.setCategoryName(jsObj.getString("categoryName"));
            t.setRemarks(jsObj.getString("remarks"));
            t.setCategoryId(jsObj.getInt("categoryId"));

            String dateStr = jsObj.getString("date");
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            t.setDate(LocalDate.parse(dateStr, formatter));
            is.close();
        }
        return t;
    }

}
