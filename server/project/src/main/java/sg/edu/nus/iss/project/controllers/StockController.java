package sg.edu.nus.iss.project.controllers;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import sg.edu.nus.iss.project.models.StockPrice;
import sg.edu.nus.iss.project.services.StockService;
import sg.edu.nus.iss.project.services.UserService;
import java.util.LinkedList;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "/api")
public class StockController {

    @Autowired
    private StockService stockSvc;

    @Autowired
    private UserService userSvc;

    @GetMapping(path = "/stocks")
    public ResponseEntity<String> getStocksData(@RequestParam String symbol,
            @RequestParam(defaultValue = "10") int outputsize) {
        return stockSvc.getStockData(symbol, outputsize);
    }

    @GetMapping(path = "/{symbol}/price")
    public ResponseEntity<String> getStockPrice(@PathVariable String symbol,
            @RequestParam(defaultValue = "10") int outputsize) {
        return stockSvc.getStockPrice(symbol, outputsize);

    }

    @GetMapping(path = "/{symbol}/stonkprice")
    public ResponseEntity<String> getStonkStockPrice(@PathVariable String symbol, @RequestParam String userId) {

        Optional<Double> optPrice = userSvc.retrieveUserStockMarketValueRedis(userId, symbol);
        if (optPrice.isPresent()) {
            double marketPrice = optPrice.get();
            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("price", marketPrice)
                            .build().toString());
        }

        System.out.println("Calling stonk price >>> " + symbol);
        return stockSvc.getRealStonksPrice(symbol);
    }

    @GetMapping(path = "/{symbol}/monthly_price")
    public ResponseEntity<String> getMonthlyPrice(@PathVariable String symbol, @RequestParam String sdate,
            @RequestParam String edate) throws IOException {

        // CHECK FROM MONGO
        Optional<List<StockPrice>> pricesOpt = userSvc.retrieveStockMonthlyPerformance(symbol);
        if (pricesOpt.isPresent()) {
            List<StockPrice> prices = pricesOpt.get();
            JsonArrayBuilder jsArr = Json.createArrayBuilder();

            for (StockPrice stockPrice : prices) {
                jsArr.add(stockPrice.toJsonObjectBuilder());
            }

            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsArr.build().toString());
        }

        String res = stockSvc.getStockMonthlyPrice(symbol, sdate, edate).getBody();

        List<StockPrice> spList = new LinkedList<>();

        if (res != null && !res.isEmpty()) {
            try (InputStream is = new ByteArrayInputStream(res.getBytes())) {
                JsonReader reader = Json.createReader(is);
                JsonArray jrArr = reader.readArray();
                for (JsonValue jsonValue : jrArr) {
                    JsonObject jsObj = (JsonObject) jsonValue;
                    spList.add(StockPrice.convertFromJsonObject(jsObj));
                }
            }
        }
        // SAVE TO MONGO
        userSvc.upsertStockMonthlyPerformance(symbol, spList);

        return stockSvc.getStockMonthlyPrice(symbol, sdate, edate);
    }

}
