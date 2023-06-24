package sg.edu.nus.iss.project.controllers;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import javax.print.DocFlavor.STRING;
import javax.print.attribute.standard.Media;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
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
import sg.edu.nus.iss.project.models.Category;
import sg.edu.nus.iss.project.models.Transaction;
import sg.edu.nus.iss.project.services.TransactionService;

@Controller
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class TransactionController {

    @Autowired
    private TransactionService transSvc;

    @PostMapping(path = "/{userId}/add_category", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    @ResponseBody
    public ResponseEntity<String> insertCategoryJdbc(@PathVariable String userId,
            @RequestBody MultiValueMap<String, String> categoryForm) {
        String category = categoryForm.getFirst("category");
        String type = categoryForm.getFirst("type");

        int res = transSvc.insertCategoryJdbc(userId, category, type);
        if (res <= 0) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Category not added".formatted(category))
                            .build().toString());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder()
                        .add("message", "Category %s added succesffuly".formatted(category))
                        .build().toString());
    }

    @GetMapping(path = "/{userId}/categories")
    @ResponseBody
    public ResponseEntity<String> getUserCategoriesJdbc(@PathVariable String userId) {
        List<Category> categories = transSvc.getUserCategoryJdbc(userId);

        JsonArrayBuilder jsArr = Json.createArrayBuilder();
        categories.stream().forEach(cat -> jsArr.add(cat.toJsonObjectBuilder()));

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsArr.build().toString());
    }

    @GetMapping(path = "/{userId}/transactions")
    @ResponseBody
    public ResponseEntity<String> getUserTransactionsJdbc(@PathVariable String userId) {
        List<Transaction> transactions = transSvc.getUserTransactionsJdbc(userId);
        JsonArrayBuilder jsArr = Json.createArrayBuilder();
        transactions.stream().forEach((trans) -> jsArr.add(trans.toJsonObjectBuilder()));
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsArr.build().toString());
    }

    @GetMapping(path = "/{userId}/category_id")
    @ResponseBody
    public ResponseEntity<String> getCategoryIdByCategoryNameJdbc(@PathVariable String userId,
            @RequestParam String catName) {
        int catId = transSvc.getCategoryIdByCategoryNameJdbc(userId, catName);
        if (catId == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Invalid category name").build()
                            .toString());
        }
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("value", catId).build().toString());
    }

    @PostMapping(path = "/{userId}/add_transaction")
    @ResponseBody
    public ResponseEntity<String> insertTransactionJdbc(@PathVariable String userId, @RequestBody String json) {
        Transaction tran = null;
        try {
            tran = Transaction.convertFromJsonAdd(json);
            int insertedRow = transSvc.insertTransactionJdbc(userId, tran);
            if (insertedRow > 0) {
                return ResponseEntity.status(HttpStatus.CREATED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("message",
                                        "Transaction (%s) successfully added"
                                                .formatted(tran.getTransactionName()))
                                .build()
                                .toString());
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Invalid transaction format")
                            .build().toString());

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Invalid transaction format")
                            .build().toString());
        }

    }

    @DeleteMapping(path = "/{userId}/delete_transaction")
    @ResponseBody
    public ResponseEntity<String> deleteTransactionJdbc(@PathVariable String userId, @RequestParam String tranId,
            @RequestParam String catName) {

        int deletedRow = transSvc.deleteTransactionJdbc(userId, tranId, catName);
        if (deletedRow > 0) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message",
                                    "Transaction (%s) successfully removed"
                                            .formatted(tranId))
                            .build()
                            .toString());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("message", "Failed to remove transaction").build()
                        .toString());

    }

    @PutMapping(path = "/{userId}/update_transaction")
    @ResponseBody
    public ResponseEntity<String> updateTransactionJdbc(@PathVariable String userId, @RequestBody String json) {
        try {
            Transaction updateTransaction = Transaction.convertFromJsonUpdate(json);
            int updatedCount = transSvc.updateTransactionJdbc(userId, updateTransaction);
            if (updatedCount > 0) {
                return ResponseEntity.status(HttpStatus.CREATED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("message",
                                        "Transaction (%s) was successfully updated."
                                                .formatted(updateTransaction.getTransactionId()))
                                .build().toString());
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Invalid transaction format")
                            .build().toString());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Invalid transaction format")
                            .build().toString());
        }

    }
}
