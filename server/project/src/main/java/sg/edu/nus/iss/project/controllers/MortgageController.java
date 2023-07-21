package sg.edu.nus.iss.project.controllers;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import sg.edu.nus.iss.project.models.Mortgage;
import sg.edu.nus.iss.project.models.MortgagePortfolio;
import sg.edu.nus.iss.project.models.MortgageTableMonth;
import sg.edu.nus.iss.project.services.MortgageService;

@Controller
@CrossOrigin(origins = {
        "https://afmapp-tfip-production.up.railway.app",
        "http://localhost:4200" }, allowCredentials = "true", allowedHeaders = "*")
@RequestMapping(path = "/api")
public class MortgageController {
    @Autowired
    private MortgageService mortgageSvc;

    @GetMapping(path = "/calculate_mortgage")
    @ResponseBody
    public ResponseEntity<String> calculateMortgageLoan(@RequestParam double amount, @RequestParam double interest,
            @RequestParam int term, @RequestParam String typeOfTerm) {
        Mortgage mortgage = mortgageSvc.calculateMortgageRepayment(amount, term, interest, typeOfTerm);

        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON)
                .body(mortgage.toJsonObjectBuilder().build().toString());
    }

    @GetMapping(path = "/amortization_mortgage")
    @ResponseBody
    public ResponseEntity<String> amortizationMortgageTable(@RequestParam double amount,
            @RequestParam double interest,
            @RequestParam int term, @RequestParam String typeOfTerm) {
        System.out.println("Recevied mortgage amortization >>> " + amount + interest + term + typeOfTerm);
        List<MortgageTableMonth> mtmList = mortgageSvc.getAmorTizationTable(amount, term, interest, typeOfTerm);

        JsonArrayBuilder jsArr = Json.createArrayBuilder();

        mtmList.forEach(m -> jsArr.add(m.toJsonObjectBuilder()));

        System.out.println("Length of Mortgage amortization table >>> " + mtmList.size());

        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON)
                .body(jsArr.build().toString());
    }

    @PostMapping(path = "/{userId}/add_mortgage_profile")
    @ResponseBody
    public ResponseEntity<String> addMortgageProfile(@PathVariable String userId, @RequestBody String mortgageJson)
            throws IOException {
        MortgagePortfolio mp = MortgagePortfolio.convertFromJsonString(mortgageJson);
        boolean upsertMongo = mortgageSvc.upsertUserMortgagePortfolioMongo(userId, mp);

        if (!upsertMongo) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Duplicate mortgage ID.".formatted(mp.getId()))
                            .build()
                            .toString());
        }

        return ResponseEntity.status(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder()
                        .add("message", "Added mortgage %s successfully.".formatted(mp.getId()))
                        .build()
                        .toString());
    }

    @PutMapping(path = "/{userId}/update_mortgage_profile")
    @ResponseBody
    public ResponseEntity<String> updateMortgageProfile(@PathVariable String userId,
            @RequestBody String mortgageJson)
            throws IOException {
        MortgagePortfolio mp = MortgagePortfolio.convertFromJsonString(mortgageJson);
        boolean upsertMongo = mortgageSvc.updateUserMortgagePortfolioMongo(userId, mp);

        if (!upsertMongo) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Failed to update mortgage profile %s."
                                    .formatted(mp.getId()))
                            .build()
                            .toString());
        }

        return ResponseEntity.status(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder()
                        .add("message", "Updated mortgage %s successfully."
                                .formatted(mp.getId()))
                        .build()
                        .toString());
    }

    @GetMapping(path = "/{userId}/mortgage_portfolio")
    @ResponseBody
    public ResponseEntity<String> getMortgageProfile(@PathVariable String userId) {
        List<MortgagePortfolio> mpList = mortgageSvc.retrieveUserMortgagePortfolioMongo(userId);

        JsonArrayBuilder jsArr = Json.createArrayBuilder();
        if (mpList != null) {
            mpList.forEach(m -> jsArr.add(m.toJsonObjectBuilder()));
        }

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsArr.build().toString());
    }

    @DeleteMapping(path = "/{userId}/delete_mortgage_portfolio")
    @ResponseBody
    public ResponseEntity<String> deleteMortgagePortfolio(@PathVariable String userId,
            @RequestParam String mortgageId)
            throws IOException {

        boolean deleted = false;
        // delete mortgage related regular transactions in JDBC
        int deletedMortgageRegularTrans = mortgageSvc.deleteUserMongoRegularTransactionsJdbc(userId,
                mortgageId);

        // delete mortgage related tansactions in JDBC
        int deletedMortgageTransactions = mortgageSvc.deleteUserMortgageTransactionsJdbc(userId, mortgageId);

        deleted = mortgageSvc.deleteUserMortgagePortfolioMongo(userId, mortgageId);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Failed to delete mortgage with ID."
                                    .formatted(mortgageId))
                            .build()
                            .toString());
        }

        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder()
                        .add("message", "Delete mortgage and relavant transactions with ID %s."
                                .formatted(mortgageId))
                        .build()
                        .toString());
    }

}
