package sg.edu.nus.iss.project.models;

import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;

public class Mortgage {

    private double principal;
    private double totalInterest;
    private double monthlyRepayment;

    public Mortgage() {
    }

    public Mortgage(double principal, double totalInterest, double monthlyRepayment) {
        this.principal = principal;
        this.totalInterest = totalInterest;
        this.monthlyRepayment = monthlyRepayment;
    }

    public double getPrincipal() {
        return principal;
    }

    public void setPrincipal(double principal) {
        this.principal = principal;
    }

    public double getTotalInterest() {
        return totalInterest;
    }

    public void setTotalInterest(double totalInterest) {
        this.totalInterest = totalInterest;
    }

    public double getMonthlyRepayment() {
        return monthlyRepayment;
    }

    public void setMonthlyRepayment(double monthlyRepayment) {
        this.monthlyRepayment = monthlyRepayment;
    }

    public JsonObjectBuilder toJsonObjectBuilder() {
        return Json.createObjectBuilder().add("principal", principal)
                .add("totalInterest", totalInterest)
                .add("monthlyRepayment", monthlyRepayment);
    }

}
