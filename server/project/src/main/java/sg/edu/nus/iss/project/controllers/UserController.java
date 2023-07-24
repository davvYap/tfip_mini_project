package sg.edu.nus.iss.project.controllers;

import java.io.IOException;

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
import sg.edu.nus.iss.project.models.Stock;
import sg.edu.nus.iss.project.models.StockCount;
import sg.edu.nus.iss.project.models.StockIdea;
import sg.edu.nus.iss.project.models.StockPrice;
import sg.edu.nus.iss.project.services.StockService;
import sg.edu.nus.iss.project.services.UserService;

import java.util.Date;
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
                System.out.println("User theme >>> " + theme);
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
                                        .body(Json.createObjectBuilder().add("message", "Update theme failed").build()
                                                        .toString());
                }

                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder().add("message", "Update theme successfully").build()
                                                .toString());
        }

        @GetMapping(path = "/goal")
        @ResponseBody
        public ResponseEntity<String> getUserGoal(@RequestParam String userId) {
                double goal = userSvc.retrieveUserGoal(userId);
                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder().add("goal", goal).build().toString());
        }

        @PostMapping(path = "/goal")
        @ResponseBody
        public ResponseEntity<String> updateGoal(@RequestBody MultiValueMap<String, String> input) {
                String userId = input.getFirst("userId");
                double userGoal = Double.parseDouble(input.getFirst("userGoal"));

                Boolean updatedGoal = userSvc.upsertUserGoal(userId, userGoal);

                if (!updatedGoal) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "Update goal failed").build()
                                                        .toString());
                }

                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder().add("message", "Update goal successfully").build()
                                                .toString());
        }

        @PostMapping(path = "/{userId}/addStock")
        @ResponseBody
        public ResponseEntity<String> addStock(@PathVariable String userId, @RequestBody String stockJson)
                        throws IOException {
                Stock stock = Stock.convertFromJsonObject(stockJson);

                if (stock == null) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "Invalid JSON").build()
                                                        .toString());
                }

                // SAVE TO MONGO
                userSvc.upsertUserStocks(userId, stock);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder()
                                                .add("message", "%s is added into portfolio with order ID %s".formatted(
                                                                stock.getSymbol(),
                                                                stock.getPurchaseId()))
                                                .build().toString());
        }

        @GetMapping(path = "/{userId}/stocks")
        @ResponseBody
        public ResponseEntity<String> getUserStocks(@PathVariable String userId,
                        @RequestParam(defaultValue = "1000") int limit, @RequestParam(defaultValue = "0") int skip) {
                List<Stock> stocks = userSvc.retrieveUserStocks(userId, limit, skip);
                if (stocks == null) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "No stocks found").build()
                                                        .toString());
                }
                JsonArrayBuilder jsArr = Json.createArrayBuilder();
                for (Stock stock : stocks) {
                        jsArr.add(stock.toJsonObject());
                }
                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(jsArr.build().toString());
        }

        @DeleteMapping(path = "/{userId}/delete_stock_purchaseId")
        @ResponseBody
        public ResponseEntity<String> deleteUserStockWithPurchaseId(@PathVariable String userId,
                        @RequestParam String purchaseId) {
                boolean deleted = userSvc.deleteUserStockMongo(userId, purchaseId);

                if (!deleted) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder()
                                                        .add("message", "Delete stock with purchaseId %s failed"
                                                                        .formatted(purchaseId))
                                                        .build().toString());
                }
                // retrieve deleted stock

                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder()
                                                .add("message", "Deleted stock with purchaseId %s successfully"
                                                                .formatted(purchaseId))
                                                .build().toString());
        }

        @DeleteMapping(path = "/{userId}/delete_stock_symbol")
        @ResponseBody
        public ResponseEntity<String> deleteUserStockWithSymbol(@PathVariable String userId,
                        @RequestParam String symbol) {
                boolean deletedStocks = userSvc.deteleUserStockMongoWithSymbol(userId, symbol);
                if (!deletedStocks) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder()
                                                        .add("message", "Delete stocks with symbol %s failed"
                                                                        .formatted(symbol))
                                                        .build().toString());
                }

                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder()
                                                .add("message", "Deleted stocks with symbol %s successfully"
                                                                .formatted(symbol))
                                                .build().toString());
        }

        @PutMapping(path = "/{userId}/update_stock")
        @ResponseBody
        public ResponseEntity<String> updateUserStock(@PathVariable String userId, @RequestBody String stockJsonStr)
                        throws IOException {
                Stock soldStock = Stock.convertFromJsonObject(stockJsonStr);

                if (soldStock == null) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "Invalid JSON").build()
                                                        .toString());
                }
                boolean updated = userSvc.updateUserStockMongo(userId, soldStock);
                if (!updated) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "Error update sell order.")
                                                        .build().toString());
                }
                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder()
                                                .add("message", "Updated sell order %s"
                                                                .formatted(soldStock.getPurchaseId()))
                                                .build()
                                                .toString());

        }

        @GetMapping(path = "/{userId}/sold_stocks")
        @ResponseBody
        public ResponseEntity<String> getUserSoldStocks(@PathVariable String userId) {
                JsonArrayBuilder jsArr = Json.createArrayBuilder();
                List<Stock> soldStocks = userSvc.retrieveUserSoldStockMongo(userId);

                if (soldStocks == null) {
                        return ResponseEntity.status(HttpStatus.OK)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(jsArr.build().toString());
                }
                for (Stock stock : soldStocks) {
                        jsArr.add(stock.toJsonObjectSoldStock());
                }
                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(jsArr.build().toString());
        }

        @GetMapping(path = "/{userId}/stocksCount")
        public ResponseEntity<String> getUserStocksCount(@PathVariable String userId,
                        @RequestParam(defaultValue = "1000") int limit, @RequestParam(defaultValue = "0") int skip) {
                List<StockCount> sc = userSvc.retrieveUserStocksCount(userId, limit, skip);

                if (sc == null) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "No stocks found").build()
                                                        .toString());
                }
                JsonArrayBuilder jsArr = Json.createArrayBuilder();
                if (sc.size() > 0) {
                        for (StockCount stockCount : sc) {
                                jsArr.add(stockCount.toJsonObject());
                        }

                }
                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(jsArr.build().toString());
        }

        @GetMapping(path = "/{userId}/stocksValue")
        public ResponseEntity<String> getUserStocksValue(@PathVariable String userId,
                        @RequestParam(defaultValue = "1000") int limit, @RequestParam(defaultValue = "0") int skip)
                        throws IOException {

                List<StockCount> sc = userSvc.retrieveUserStocksCount(userId, limit, skip);

                if (sc == null) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "No stocks found").build()
                                                        .toString());
                }
                double totalStockValue = 0.0;
                for (StockCount stockCount : sc) {
                        String stkSymbol = stockCount.getSymbol();
                        double marketPrice = 0;
                        // check redis whether the latest market price is there
                        Optional<Double> optPrice = userSvc.retrieveStockMarketValueRedis(stkSymbol);
                        if (optPrice.isEmpty()) {
                                // SEARCH IN MONGO
                                Optional<List<StockPrice>> spListOpt = userSvc
                                                .retrieveStockMonthlyPerformanceMongo(stkSymbol);
                                if (spListOpt.isPresent()) {
                                        List<StockPrice> spList = spListOpt.get();
                                        marketPrice = spList.get(spList.size() - 1).getClosePrice();
                                        userSvc.saveStockMarketValueRedis(stkSymbol, marketPrice);
                                }
                        } else {
                                marketPrice = optPrice.get();
                        }
                        double totalStockMarketValue = stockCount.getQuantity() * marketPrice;
                        totalStockValue += totalStockMarketValue;
                        System.out.println(
                                        "Calculating User total stock value from User controller -> Stocks symbol %s - qty %.2f - market price %.2f "
                                                        .formatted(stkSymbol,
                                                                        stockCount.getQuantity(),
                                                                        totalStockMarketValue));
                }
                System.out.println("Total stock value >>> " + totalStockValue);

                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder().add("value", totalStockValue).build()
                                                .toString());
        }

        @GetMapping(path = "/update_all_yesterday_stock_value")
        public ResponseEntity<String> updateAllUserStockValue() throws IOException {
                boolean updated = userSvc.upsertUserYesterdayTotalStockValueMongo();
                if (!updated) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message",
                                                        "Users total stock value failed to update in mongo")
                                                        .build()
                                                        .toString());
                }
                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder()
                                                .add("message", "Users total stock value updated successfully in mongo")
                                                .build()
                                                .toString());
        }

        @GetMapping(path = "/{userId}/yesterday_stock_value")
        public ResponseEntity<String> getUserYesterdayTotalValueMongo(@PathVariable String userId) {
                double totalStockValue = userSvc.retrieveUserYesterdayTotalValueMongo(userId);
                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder().add("value", totalStockValue).build().toString());
        }

        @GetMapping(path = "/{userId}/monthly_performance")
        @ResponseBody
        public ResponseEntity<String> getUserMonthlyPerformance(@PathVariable String userId,
                        @RequestParam(defaultValue = "1000") int limit,
                        @RequestParam(defaultValue = "0") int skip, @RequestParam int year) throws IOException {
                System.out.println("Calling UserController API for user stock monnthly performance %...");
                List<Double> userPerformance = userSvc.getUserMonthlyPerformanceForYear(year, userId, limit, skip);

                JsonArrayBuilder jsArr = Json.createArrayBuilder();
                userPerformance.forEach(value -> jsArr.add(value));

                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(jsArr.build().toString());
        }

        @GetMapping(path = "/{userId}/stock_monthly_value")
        @ResponseBody
        public ResponseEntity<String> getUserStockMonthlyValue(@PathVariable String userId,
                        @RequestParam(defaultValue = "1000") int limit,
                        @RequestParam(defaultValue = "0") int skip, @RequestParam int year) throws IOException {
                System.out.println("Calling Controller API for user stock monnthly value...");
                List<Double> userStockValue = userSvc.getUserMonthlyStockValueForYear(year, userId, limit, skip);
                System.out.println("user monthly stock value >>> " + userStockValue);
                JsonArrayBuilder jsArr = Json.createArrayBuilder();
                userStockValue.forEach(value -> jsArr.add(value));

                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(jsArr.build().toString());
        }

        @GetMapping(path = "/{userId}/stocks_by_month")
        @ResponseBody
        public ResponseEntity<String> getUserStocksByMonth(@PathVariable String userId,
                        @RequestParam(defaultValue = "1000") int limit,
                        @RequestParam(defaultValue = "0") int skip, @RequestParam String month,
                        @RequestParam int year) {

                Optional<List<Stock>> stocksOpt = userSvc.retrieveUserStockByMonth(userId, limit, skip, month, year);
                if (stocksOpt.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "No stocks found").build()
                                                        .toString());
                }
                List<Stock> stocks = stocksOpt.get();

                JsonArrayBuilder jsArr = Json.createArrayBuilder();
                for (Stock stock : stocks) {
                        jsArr.add(stock.toJsonObject());
                }

                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(jsArr.build().toString());
        }

        @GetMapping(path = "/{userId}/stock_qty_month")
        @ResponseBody
        public ResponseEntity<String> getUserStocksQtyByMonth(@PathVariable String userId,
                        @RequestParam(defaultValue = "1000") int limit,
                        @RequestParam(defaultValue = "0") int skip, @RequestParam String month,
                        @RequestParam String symbol) {
                Optional<Double> opt = userSvc.retrieveUserStockQuantityByMonth(userId, limit, skip, month, symbol);

                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder().add("quantity", opt.get()).build().toString());
        }

        @PostMapping(path = "/{symbol}/new_idea")
        @ResponseBody
        public ResponseEntity<String> newStockIdeaFromUserMongo(@PathVariable String symbol,
                        @RequestBody String ideaJson)
                        throws IOException {
                StockIdea idea = StockIdea.convertFromJsonString(ideaJson);
                Date insertedDate = new Date();
                long epochTime = insertedDate.getTime();
                idea.setDate(epochTime);
                boolean upserted = userSvc.upsertUserStockIdeaMongo(symbol, idea);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder().add("message", "Posted stock idea successfully")
                                                .build().toString());
        }

        @GetMapping(path = "/{symbol}/ideas")
        @ResponseBody
        public ResponseEntity<String> getStockIdeasMongo(@PathVariable String symbol,
                        @RequestParam(defaultValue = "20") int limit,
                        @RequestParam(defaultValue = "0") int skip) {
                List<StockIdea> ideas = userSvc.retrieveStockIdeasMongo(symbol, limit, skip);
                JsonArrayBuilder jsArr = Json.createArrayBuilder();
                if (ideas != null) {
                        ideas.forEach(i -> jsArr.add(i.toJsonObject()));
                }
                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(jsArr.build().toString());
        }

        @DeleteMapping(path = "/{symbol}/delete_idea")
        @ResponseBody
        public ResponseEntity<String> deleteStockIdeaMongo(@PathVariable String symbol, @RequestParam String ideaId) {
                boolean deleted = userSvc.deleteStockIdeaMongo(symbol, ideaId);

                if (!deleted) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder().add("message", "Failed to delete idea.")
                                                        .build().toString());
                }

                return ResponseEntity.status(HttpStatus.CREATED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder().add("message", "Deleted").build().toString());
        }

        @PostMapping(path = "/{userId}/recent_stock_search")
        @ResponseBody
        public ResponseEntity<String> upsertUserRecentStockScreenerMongo(@PathVariable String userId,
                        @RequestBody MultiValueMap<String, String> input) {
                String symbol = input.getFirst("symbol");
                String stockName = input.getFirst("name");
                System.out.println("symbol >>>" + symbol);
                System.out.println("name >>>" + stockName);

                boolean upserted = userSvc.upsertUserRecentStockScreenerMongo(symbol, userId, stockName);

                if (upserted) {
                        return ResponseEntity.status(HttpStatus.CREATED)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(Json.createObjectBuilder()
                                                        .add("message", "Upserted user stock screen record").build()
                                                        .toString());
                }

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(Json.createObjectBuilder()
                                                .add("message", "Failed to upsert user stock screen record.").build()
                                                .toString());
        }

        @GetMapping(path = "/{userId}/recent_stock_search")
        @ResponseBody
        public ResponseEntity<String> retrieveUserRecentStockScreenerMongo(@PathVariable String userId) {
                List<Stock> stocks = userSvc.retrieveUserRecentStockScreenerMongo(userId);
                JsonArrayBuilder jsArr = Json.createArrayBuilder();
                if (stocks != null) {
                        stocks.forEach(s -> jsArr.add(s.toJsonObjectBuilderStockScreener()));
                }

                return ResponseEntity.status(HttpStatus.OK)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(jsArr.build().toString());
        }
}
