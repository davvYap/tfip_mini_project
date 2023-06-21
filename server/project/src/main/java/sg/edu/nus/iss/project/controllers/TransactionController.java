package sg.edu.nus.iss.project.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import sg.edu.nus.iss.project.models.Category;
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
                    .body(Json.createObjectBuilder().add("message", "Category not added".formatted(category))
                            .build().toString());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("message", "Category %s added succesffuly".formatted(category))
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
}
