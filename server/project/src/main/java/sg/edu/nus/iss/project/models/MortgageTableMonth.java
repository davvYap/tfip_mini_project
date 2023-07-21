package sg.edu.nus.iss.project.models;

import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;

public class MortgageTableMonth {
    private int month;
    private double principal;
    private double interest;
    private double repayment;
    private double totalInterestPaid;
    private double balanceRemaining;

    public MortgageTableMonth() {
    }

    public MortgageTableMonth(int month, double principal, double interest, double repayment, double totalInterestPaid,
            double balanceRemaining) {
        this.month = month;
        this.principal = principal;
        this.interest = interest;
        this.repayment = repayment;
        this.totalInterestPaid = totalInterestPaid;
        this.balanceRemaining = balanceRemaining;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public double getPrincipal() {
        return principal;
    }

    public void setPrincipal(double principal) {
        this.principal = principal;
    }

    public double getInterest() {
        return interest;
    }

    public void setInterest(double interest) {
        this.interest = interest;
    }

    public double getRepayment() {
        return repayment;
    }

    public void setRepayment(double repayment) {
        this.repayment = repayment;
    }

    public double getTotalInterestPaid() {
        return totalInterestPaid;
    }

    public void setTotalInterestPaid(double totalInterestPaid) {
        this.totalInterestPaid = totalInterestPaid;
    }

    public double getBalanceRemaining() {
        return balanceRemaining;
    }

    public void setBalanceRemaining(double balanceRemaining) {
        this.balanceRemaining = balanceRemaining;
    }

    @Override
    public String toString() {
        return "MortgageTableMonth [month=" + month + ", principal=" + principal + ", interest=" + interest
                + ", repayment=" + repayment + ", totalInterestPaid=" + totalInterestPaid + ", balanceRemaining="
                + balanceRemaining + "]";
    }

    public JsonObjectBuilder toJsonObjectBuilder() {
        return Json.createObjectBuilder()
                .add("year", month)
                .add("principal", principal)
                .add("interest", interest)
                .add("repayment", repayment)
                .add("totalInterestPaid", totalInterestPaid)
                .add("balanceRemaining", balanceRemaining);
    }

}
