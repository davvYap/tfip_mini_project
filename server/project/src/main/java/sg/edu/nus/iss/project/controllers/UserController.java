package sg.edu.nus.iss.project.controllers;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonNumber;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import sg.edu.nus.iss.project.models.Stock;
import sg.edu.nus.iss.project.models.StockCount;
import sg.edu.nus.iss.project.services.StockService;
import sg.edu.nus.iss.project.services.UserService;
import java.util.List;
import java.util.Optional;

@Controller
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userSvc;

    @Autowired
    private StockService stockSvc;

    @GetMapping(path = "/theme")
    @ResponseBody
    public ResponseEntity<String> getUserTheme(@RequestParam String userId) {
        String theme = userSvc.retrieveUserTheme(userId);

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("theme", theme).build().toString());
    }

    @PostMapping(path = "/theme")
    @ResponseBody
    public ResponseEntity<String> updateTheme(@RequestBody MultiValueMap<String, String> input) {
        String userId = input.getFirst("userId");
        String userTheme = input.getFirst("userTheme");

        Boolean updatedTheme = userSvc.upsertUserTheme(userId, userTheme);

        if (!updatedTheme) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Update theme failed").build().toString());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("message", "Update theme successfully").build().toString());
    }

    @PostMapping(path = "/{userId}/addStock")
    @ResponseBody
    public ResponseEntity<String> addStock(@PathVariable String userId, @RequestBody String stockJson)
            throws IOException {
        Stock stock = Stock.convertFromJsonObject(stockJson);

        if (stock == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Invalid JSON").build().toString());
        }

        userSvc.upsertUserStocks(userId, stock);

        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("message", "Stock added").build().toString());
    }

    @GetMapping(path = "/{userId}/stocks")
    public ResponseEntity<String> getUserStocks(@PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit, @RequestParam(defaultValue = "0") int skip) {
        List<Stock> stocks = userSvc.retrieveUserStocks(userId, limit, skip);
        if (stocks == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "No stocks found").build().toString());
        }
        JsonArrayBuilder jsArr = Json.createArrayBuilder();
        for (Stock stock : stocks) {
            jsArr.add(stock.toJsonObject());
        }
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsArr.build().toString());
    }

    @GetMapping(path = "/{userId}/stocksCount")
    public ResponseEntity<String> getUserStocksCount(@PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit, @RequestParam(defaultValue = "0") int skip) {
        List<StockCount> sc = userSvc.retrieveUserStocksCount(userId, limit, skip);

        if (sc == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "No stocks found").build().toString());
        }
        JsonArrayBuilder jsArr = Json.createArrayBuilder();
        for (StockCount stockCount : sc) {
            jsArr.add(stockCount.toJsonObject());
        }

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsArr.build().toString());
    }

    @GetMapping(path = "/{userId}/stocksValue")
    public ResponseEntity<String> getUserStocksValue(@PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit, @RequestParam(defaultValue = "0") int skip)
            throws IOException {

        Optional<Double> optTotalValue = userSvc.retrieveStockTotalValueRedis(userId);
        if (optTotalValue.isPresent()) {
            double totalStockValueRedis = optTotalValue.get();
            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("value", totalStockValueRedis).build()
                            .toString());
        }

        List<StockCount> sc = userSvc.retrieveUserStocksCount(userId, limit, skip);

        if (sc == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "No stocks found").build().toString());
        }
        double totalStockValue = 0.0;
        for (StockCount stockCount : sc) {
            String stkSymbol = stockCount.getSymbol();
            ResponseEntity<String> realStonkPrice = stockSvc.getRealStonksPrice(stkSymbol);
            double marketPrice = getStonkStockPrice(realStonkPrice.getBody());
            userSvc.saveUserStockMarketValueRedis(userId, stkSymbol, marketPrice);
            totalStockValue += stockCount.getQuantity() * marketPrice;
        }
        if (totalStockValue != 0.0) {
            userSvc.saveStockTotalValueRedis(userId, totalStockValue);
        }
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("value", totalStockValue).build()
                        .toString());
    }

    // EXTRA
    public double getStonkStockPrice(String json) throws IOException {
        double stockPrice = 0.0;
        if (json != null) {
            try (InputStream is = new ByteArrayInputStream(json.getBytes())) {
                JsonReader jr = Json.createReader(is);
                JsonObject jsObj = jr.readObject();
                JsonNumber value = jsObj.getJsonNumber("price");
                stockPrice = value.doubleValue();
            }
        }
        return stockPrice;
    }

}
