package sg.edu.nus.iss.project.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.project.models.Mortgage;
import sg.edu.nus.iss.project.models.MortgagePortfolio;
import sg.edu.nus.iss.project.models.MortgageTableMonth;
import sg.edu.nus.iss.project.repositories.MortgageRepository;

@Service
public class MortgageService {

    @Autowired
    private MortgageRepository mortgageRepo;

    public Mortgage calculateMortgageRepayment(double loanAmount, int term, double interest, String typeOfTerm) {

        int totalRepaymentMonths = term;
        if (typeOfTerm.equalsIgnoreCase("year")) {
            totalRepaymentMonths = term * 12;
        }
        double interestRatePerMonth = interest / 12;
        double topOfFormula = interestRatePerMonth * Math.pow((1 + interestRatePerMonth), totalRepaymentMonths);
        // System.out.println("top of formular > " + topOfFormula);
        double btmOfFormula = Math.pow((1 + interestRatePerMonth), totalRepaymentMonths) - 1;
        // System.out.println("btm of formular > " + btmOfFormula);
        double monthlyRepayment = loanAmount * (topOfFormula / btmOfFormula);
        double totalRepayment = monthlyRepayment * totalRepaymentMonths;
        double totalInterest = totalRepayment - loanAmount;

        Mortgage m = new Mortgage(loanAmount, totalInterest, monthlyRepayment);

        return m;
    }

    public List<MortgageTableMonth> getAmorTizationTable(double loanAmount, int term, double interest,
            String typeOfTerm) {
        List<MortgageTableMonth> mortgageList = new ArrayList<>();
        Mortgage m = calculateMortgageRepayment(loanAmount, term, interest, typeOfTerm);
        double interestRatePerMonth = interest / 12;
        int currYear = LocalDate.now().getYear();

        int totalRepaymentMonths = term;
        if (typeOfTerm.equalsIgnoreCase("year")) {
            totalRepaymentMonths = term * 12;
        }
        double remainingPrincipalBalance = loanAmount;
        double totalInterestPaid = 0.0;
        for (int i = 0; i < totalRepaymentMonths; i++) {
            double monthlyRepayment = m.getMonthlyRepayment();
            double principalPaidMonthly = monthlyRepayment - (remainingPrincipalBalance * interestRatePerMonth);
            double interestPaidMonthly = monthlyRepayment - principalPaidMonthly;
            remainingPrincipalBalance -= principalPaidMonthly;
            totalInterestPaid += interestPaidMonthly;
            MortgageTableMonth mtm = new MortgageTableMonth(currYear, principalPaidMonthly, interestPaidMonthly,
                    monthlyRepayment, totalInterestPaid, remainingPrincipalBalance);
            mortgageList.add(mtm);
            if ((i + 1) % 12 == 0) {
                currYear += 1;
            }
        }

        return mortgageList;
    }

    public Boolean upsertUserMortgagePortfolioMongo(String userId, MortgagePortfolio mp) {
        return mortgageRepo.upsertUserMortgagePortfolioMongo(userId, mp);
    }

    public List<MortgagePortfolio> retrieveUserMortgagePortfolioMongo(String userId) {
        return mortgageRepo.retrieveUserMortgagePortfolioMongo(userId);
    }

    public boolean deleteUserMortgagePortfolioMongo(String userId, String mortgageId) {
        return mortgageRepo.deleteUserMortgagePortfolioMongo(userId, mortgageId);
    }
}
