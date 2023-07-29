package sg.edu.nus.iss.project.controllers;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

import javax.print.attribute.standard.Media;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonNumber;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.json.JsonString;
import jakarta.json.JsonValue;
import reactor.core.publisher.Flux;
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

    private final ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(1);

    @GetMapping(path = "/stocks")
    public ResponseEntity<String> getStockDataTwelveData(@RequestParam String symbol,
            @RequestParam(defaultValue = "10") int outputsize) {
        return stockSvc.getStockDataTwelveData(symbol, outputsize);
    }

    @GetMapping(path = "/{symbol}/price")
    public ResponseEntity<String> getStockPrice(@PathVariable String symbol,
            @RequestParam(defaultValue = "10") int outputsize) throws IOException {
        String stkSymbol = symbol.toUpperCase();
        double marketPrice = 0;
        // CHECK REDIS
        Optional<Double> redisOpt = userSvc.retrieveStockMarketValueRedis(stkSymbol);
        if (redisOpt.isEmpty()) {
            // CHECK MONGO
            Optional<List<StockPrice>> mongoOpt = userSvc.retrieveStockMonthlyPerformanceMongo(stkSymbol);
            if (mongoOpt.isEmpty()) {
                // Check YH FINANCE
                ResponseEntity<String> res = stockSvc.getStockPriceYHFinance(stkSymbol);
                if (res.getStatusCode().isError()) {
                    return res;
                }
                String body = res.getBody();
                double newStockPrice = 0.0;
                try (InputStream is = new ByteArrayInputStream(body.getBytes())) {
                    JsonReader reader = Json.createReader(is);
                    JsonObject jsObj = reader.readObject();
                    JsonNumber newStockPriceJsonNumber = jsObj.getJsonNumber("price");
                    if (newStockPriceJsonNumber != null) {
                        newStockPrice = newStockPriceJsonNumber.doubleValue();
                    }
                }
                userSvc.saveStockMarketValueRedis(stkSymbol, newStockPrice);
                return ResponseEntity.status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder().add("price", String.valueOf(newStockPrice)).build()
                                .toString());

                // Check Twelve API
                // System.out.println("Called Twelve API for stock price at Stock Controller");
                // ResponseEntity<String> res = stockSvc.getStockPrice(stkSymbol, outputsize);
                // if (res.getStatusCode().isError()) {
                // return res;
                // }
                // String body = res.getBody();
                // double newStockPrice = 0.0;
                // try (InputStream is = new ByteArrayInputStream(body.getBytes())) {
                // JsonReader reader = Json.createReader(is);
                // JsonObject jsObj = reader.readObject();
                // String newStockPriceString = jsObj.getString("price");
                // newStockPrice = Double.parseDouble(newStockPriceString);
                // }
                // userSvc.saveStockMarketValueRedis(stkSymbol, newStockPrice);
                // return res;
            }
            List<StockPrice> spList = mongoOpt.get();
            marketPrice = spList.get(spList.size() - 1).getClosePrice();
            userSvc.saveStockMarketValueRedis(stkSymbol, marketPrice);

            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("symbol", stkSymbol).add("price", String.valueOf(marketPrice))
                            .build()
                            .toString());
        }
        marketPrice = redisOpt.get();
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("symbol", stkSymbol).add("price", String.valueOf(marketPrice))
                        .build()
                        .toString());
    }

    @GetMapping(path = "/{symbol}/day_performance")
    public ResponseEntity<String> getStockDayPerformance(@PathVariable String symbol) {
        // retrieve from mongo
        Optional<List<StockPrice>> mongoOpt = userSvc.retrieveStockMonthlyPerformanceMongo(symbol.toUpperCase());
        if (mongoOpt.isPresent()) {
            List<StockPrice> spList = mongoOpt.get();
            double currPrice = spList.get(spList.size() - 1).getClosePrice();
            double yesterdayPrice = spList.get(spList.size() - 2).getClosePrice();
            double dayPerformance = (currPrice - yesterdayPrice) / yesterdayPrice;
            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("dayPerformance", dayPerformance).build().toString());
        }
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("dayPerformance", 0).build().toString());
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
                        JsonString urlStr = jsObj.getJsonString("url");
                        if (urlStr != null) {
                            String url = jsObj.getString("url");
                            if (url.isEmpty() || url.isBlank()) {
                                logoUrl = "/assets/images/na.png";
                            } else {
                                logoUrl = url;
                            }
                        } else {
                            logoUrl = "/assets/images/na.png";
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
    public ResponseEntity<String> getStonkStockPrice(@PathVariable String symbol) {

        Optional<Double> optPrice = userSvc.retrieveStockMarketValueRedis(symbol);
        if (optPrice.isPresent()) {
            double marketPrice = optPrice.get();
            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("price", marketPrice)
                            .build().toString());
        }

        System.out.println("Calling stonk price from Stock Controller >>> " + symbol);
        return stockSvc.getRealStonksPrice(symbol);
    }

    @GetMapping(path = "/{symbol}/monthly_price")
    public ResponseEntity<String> getMonthlyPrice(@PathVariable String symbol, @RequestParam String sdate,
            @RequestParam String edate) throws IOException {

        String formattedSymbol = symbol.toUpperCase();
        // CHECK FROM MONGO
        Optional<List<StockPrice>> pricesOpt = userSvc.retrieveStockMonthlyPerformanceMongo(formattedSymbol);
        if (pricesOpt.isPresent()) {
            List<StockPrice> prices = pricesOpt.get();

            // HERE
            List<Double> stockMonthlyClosePrice = stockSvc.getStockMonthlyClosePrice(prices);
            JsonArrayBuilder jsArr = Json.createArrayBuilder();
            for (Double price : stockMonthlyClosePrice) {
                jsArr.add(price);
            }
            Double stockYearStartingClosePrice = stockSvc.getStockYearFirstClosePrice(prices);
            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("firstClosePrice", stockYearStartingClosePrice)
                            .add("monthlyPrices", jsArr).build().toString());
        }

        ResponseEntity<String> response = stockSvc.getStockMonthlyPrice(formattedSymbol, sdate, edate);
        List<StockPrice> spList = new LinkedList<>();
        if (!response.getStatusCode().isError()) {
            System.out.println("Calling YH FINANCE MONTHLY PRICE from CLIENT SIDE for %s".formatted(formattedSymbol));
            String res = response.getBody();

            if (res != null && !res.isEmpty()) {
                try (InputStream is = new ByteArrayInputStream(res.getBytes())) {
                    JsonReader reader = Json.createReader(is);
                    JsonArray jrArr = reader.readArray();
                    for (JsonValue jsonValue : jrArr) {
                        JsonObject jsObj = (JsonObject) jsonValue;
                        StockPrice sp = StockPrice.convertFromJsonObject(jsObj);
                        sp.setSymbol(symbol);
                        spList.add(sp);
                    }
                }
            }
            // SAVE TO MONGO
            userSvc.insertStockMonthlyPerformanceMongo(formattedSymbol, spList);
        }
        List<Double> stockMonthlyClosePrice = stockSvc.getStockMonthlyClosePrice(spList);
        JsonArrayBuilder jsArr = Json.createArrayBuilder();
        for (Double price : stockMonthlyClosePrice) {
            jsArr.add(price);
        }
        Double stockYearStartingClosePrice = stockSvc.getStockYearFirstClosePrice(spList);
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("firstClosePrice", stockYearStartingClosePrice)
                        .add("monthlyPrices", jsArr).build().toString());
    }

    @GetMapping(path = "/{symbol}/company_profile")
    @ResponseBody
    public ResponseEntity<String> getCompanyProfile(@PathVariable String symbol, @RequestParam String stockName)
            throws IOException {
        // check if mongo have company profile
        StockProfile sp = userSvc.retrieveStockProfileMongo(symbol);
        if (sp == null) {
            ResponseEntity<String> res = stockSvc.getStockProfile(symbol);
            // System.out.println(res);
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
        // System.out.println("response >>> " + sp.toJsonObject().toString());
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(sp.toJsonObject().toString());

    }

    @GetMapping(value = "/{symbol}/stock_summary_data")
    public ResponseEntity<String> getStockSimpleSummaryYHFinance(@PathVariable String symbol) throws IOException {
        // CHECK REDIS
        Optional<String> redisOpt = userSvc.retrieveStockSummaryDataRedis(symbol);
        if (redisOpt.isEmpty()) {
            System.out.println("Call YH FINANCE API to get stock summary data");
            ResponseEntity<String> res = stockSvc.getStockSimpleSummaryYHFinance(symbol);
            if (res.getStatusCode().isError()) {
                return res;
            }
            String body = res.getBody();

            try (InputStream is = new ByteArrayInputStream(body.getBytes())) {
                JsonReader reader = Json.createReader(is);
                JsonObject jsObj = reader.readObject();
                JsonObject json = jsObj.getJsonObject("summaryDetail");
                userSvc.saveStockSummaryDataRedis(symbol, json.toString());
            }
            return res;
        }

        String json = redisOpt.get();
        JsonObject jsObj = null;
        try (InputStream is = new ByteArrayInputStream(json.getBytes())) {
            JsonReader reader = Json.createReader(is);
            jsObj = reader.readObject();
        }

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("summaryDetail", jsObj).build().toString());
    }

    // SERVER SENT EVENT
    @GetMapping(path = "/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> getSSE() throws IOException {
        Stream<String> lines = Files.lines(Path.of("C:/Users/davvy/tfip2023/project/server/project/pom.xml"));

        AtomicInteger counter = new AtomicInteger(1);

        return Flux.fromStream(lines)
                .filter(line -> !line.isBlank())
                .map(line -> ServerSentEvent.<String>builder()
                        .id(String.valueOf(counter.getAndIncrement()))
                        .data(line)
                        .event("lineEvent")
                        .retry(Duration.ofMillis(1000))
                        .build())
                .delayElements(Duration.ofMillis(300));
    }

    @GetMapping(path = "/sse/alternative", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getSSEAlternative() throws IOException {
        Stream<String> lines = Files.lines(Path.of("C:/Users/davvy/tfip2023/project/server/project/pom.xml"));

        return Flux.fromStream(lines)
                .filter(line -> !line.isBlank())
                .delayElements(Duration.ofMillis(300));
    }

    @GetMapping(path = "/real-time-price", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> getStockRealTimePriceTwelveData(@RequestParam String symbol) throws IOException {
        System.out.println("symbol accepted >>> " + symbol);
        return Flux.interval(Duration.ofSeconds(10))
                .map(ignore -> {
                    String price = "0.0";
                    try {
                        price = fetchRealTimePrice(symbol);
                        System.out.println("price >>> " + price);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    return price;
                })
                .delayElements(Duration.ofMillis(100));
    }

    // NOTE Angular cant read the response
    @GetMapping(path = "/real-time-price-ndjson", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<StockPrice> getStockRealTimePriceTwelveDataNdJson(@RequestParam String symbol) throws IOException {
        System.out.println("symbol accepted >>> " + symbol);
        return Flux.interval(Duration.ofSeconds(2))
                .map(sequence -> {
                    StockPrice s = new StockPrice();
                    s.setSymbol(symbol);
                    s.setClosePrice(199.95);
                    System.out.println("sp >>> " + s);
                    return s;
                });
    }

    // NOTE Angular cant read the response
    @GetMapping(path = "/real-time-price-json", produces = MediaType.APPLICATION_JSON_VALUE)
    public Flux<String> getStockRealTimePriceTwelveDataJson(@RequestParam String symbol) throws IOException {
        System.out.println("symbol accepted >>> " + symbol);
        return Flux.interval(Duration.ofSeconds(2))
                .map(sequence -> {
                    StockPrice s = new StockPrice();
                    s.setSymbol(symbol);
                    s.setClosePrice(199.95);
                    String json = Json.createObjectBuilder()
                            .add("symbol", symbol)
                            .add("price", s.getClosePrice())
                            .build().toString();
                    System.out.println("sp >>> " + json);
                    return json;
                });
    }

    @GetMapping(path = "/real-time-price-sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getStockRealTimePriceTwelveDataSseEmitter(@RequestParam String symbol) throws IOException {
        System.out.println("symbol accepted >>> " + symbol);
        SseEmitter emitter = new SseEmitter();

        scheduledThreadPool.scheduleAtFixedRate(() -> {
            String price;
            try {
                price = fetchRealTimePrice(symbol);
                emitter.send(price);
            } catch (Exception e) {
                emitter.completeWithError(e); // In case of an error, complete the SSE with an error
            }
        }, 0, 10, TimeUnit.SECONDS);

        return emitter;
    }

    public String fetchRealTimePrice(String symbol) throws IOException {
        ResponseEntity<String> res = stockSvc.getStockPrice(symbol, 30);
        String realTimePrice = "0.0";
        if (!res.getStatusCode().isError()) {
            String body = res.getBody();
            try (InputStream is = new ByteArrayInputStream(body.getBytes())) {
                JsonReader reader = Json.createReader(is);
                JsonObject jsObj = reader.readObject();
                JsonString jsStr = jsObj.getJsonString("price");
                if (jsStr != null) {
                    realTimePrice = jsObj.getString("price");
                }
            }
        }
        return realTimePrice;
    }

}
