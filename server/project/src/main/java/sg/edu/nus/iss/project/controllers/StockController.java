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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import sg.edu.nus.iss.project.models.StockPrice;
import sg.edu.nus.iss.project.models.StockProfile;
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
    public ResponseEntity<String> getStockDataTwelveData(@RequestParam String symbol,
            @RequestParam(defaultValue = "10") int outputsize) {
        return stockSvc.getStockDataTwelveData(symbol, outputsize);
    }

    @GetMapping(path = "/{symbol}/price")
    public ResponseEntity<String> getStockPrice(@PathVariable String symbol,
            @RequestParam(defaultValue = "10") int outputsize) {
        return stockSvc.getStockPrice(symbol, outputsize);

    }

    @GetMapping(path = "/{symbol}/logo")
    public ResponseEntity<String> getStockLogo(@PathVariable String symbol) throws IOException {

        String logoUrl = userSvc.retrieveUserStockLogo(symbol);
        if (logoUrl.isEmpty()) {
            ResponseEntity<String> res = stockSvc.getStockLogo(symbol);
            if (!res.getStatusCode().isError()) {
                String body = res.getBody();
                if (body != null && !body.isEmpty()) {
                    try (InputStream is = new ByteArrayInputStream(body.getBytes())) {
                        JsonReader reader = Json.createReader(is);
                        JsonObject jsObj = reader.readObject();
                        String url = jsObj.getString("url");
                        if (url.isEmpty() || url.isBlank()) {
                            logoUrl = "/assets/images/na.png";
                        } else {
                            logoUrl = url;
                        }
                    }
                }
            }
            userSvc.upsertUserStockLogo(symbol, logoUrl);
        }

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("url", logoUrl).build().toString());
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
        Optional<List<StockPrice>> pricesOpt = userSvc.retrieveStockMonthlyPerformanceMongo(symbol);
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

        ResponseEntity<String> response = stockSvc.getStockMonthlyPrice(symbol, sdate, edate);
        if (!response.getStatusCode().isError()) {
            System.out.println("Calling YH FINANCE from CLIENT SIDE for %s".formatted(symbol));
            String res = response.getBody();

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
            userSvc.insertStockMonthlyPerformanceMongo(symbol, spList);
        }

        return response;
    }

    @GetMapping(path = "/{symbol}/company_profile")
    @ResponseBody
    public ResponseEntity<String> getCompanyProfile(@PathVariable String symbol, @RequestParam String stockName)
            throws IOException {
        // check if mongo have company profile
        StockProfile sp = userSvc.retrieveStockProfileMongo(symbol);
        if (sp == null) {
            ResponseEntity<String> res = stockSvc.getStockProfile(symbol);
            System.out.println(res);
            if (res.getStatusCode().isError()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(res.toString());
            }

            String body = res.getBody();
            try (InputStream is = new ByteArrayInputStream(body.getBytes())) {
                JsonReader reader = Json.createReader(is);
                JsonObject jsObj = reader.readObject();
                JsonObject profile = jsObj.getJsonObject("assetProfile");
                StockProfile newSp = StockProfile.convertFromJsonObject(profile);
                newSp.setSymbol(symbol);
                newSp.setName(stockName);
                userSvc.insertStockProfileMongo(symbol, newSp);
                return ResponseEntity.status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(newSp.toJsonObject().toString());
            }
        }
        System.out.println("response >>> " + sp.toJsonObject().toString());
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(sp.toJsonObject().toString());

    }
}
