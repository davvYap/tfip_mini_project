package sg.edu.nus.iss.project.services;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.aggregation.StringOperators.Split;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonNumber;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import sg.edu.nus.iss.project.models.Stock;
import sg.edu.nus.iss.project.models.StockCount;
import sg.edu.nus.iss.project.models.StockPrice;
import sg.edu.nus.iss.project.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private StockService stockSvc;

    public Boolean upsertUserTheme(String userId, String themeName) {
        return userRepo.upsertUserTheme(userId, themeName);
    }

    public String retrieveUserTheme(String userId) {
        return userRepo.retrieveUserTheme(userId);
    }

    public Boolean upsertUserGoal(String userId, double goal) {
        return userRepo.upsertUserGoal(userId, goal);
    }

    public double retrieveUserGoal(String userId) {
        return userRepo.retrieveUserGoal(userId);
    }

    public boolean upsertUserStocks(String userId, Stock stock) {
        return userRepo.upsertUserStocks(userId, stock);
    }

    public List<Stock> retrieveUserStocks(String userId, int limit, int skip) {
        return userRepo.retrieveUserStocks(userId, limit, skip);
    }

    public boolean upsertUserStockLogo(String symbol, String url) {
        return userRepo.upsertUserStockLogo(symbol, url);
    }

    public String retrieveUserStockLogo(String symbol) {
        return userRepo.retrieveUserStockLogo(symbol);
    }

    public List<StockCount> retrieveUserStocksCount(String userId, int limit, int skip) {
        List<Stock> stocks = userRepo.retrieveUserStocks(userId, limit, skip);

        List<StockCount> stocksCount = new LinkedList<>();
        for (Stock stock : stocks) {
            int combinedCount = 0;
            for (StockCount sc : stocksCount) {
                if (stocksCount.size() < 1) {
                    stocksCount.add(stock.toStockCount());
                    break;
                }
                if (stock.getSymbol().equalsIgnoreCase(sc.getSymbol())) {
                    combinedCount++;
                    sc.setQuantity((sc.getQuantity() + stock.getQuantity()));
                    double newPrice = stock.getQuantity() * stock.getStrikePrice();
                    sc.setCost(sc.getCost() + newPrice);
                    break;
                }
            }
            if (combinedCount == 0) {
                stocksCount.add(stock.toStockCount());

            }
        }
        return stocksCount;
    }

    public void saveUserStockMarketValueRedis(String userId, String symbol, double value) {
        userRepo.saveUserStockMarketValueRedis(userId, symbol, value);
    }

    public Optional<Double> retrieveUserStockMarketValueRedis(String userId, String symbol) {
        return userRepo.retrieveUserStockMarketValueRedis(userId, symbol);
    }

    public boolean deleteUserStockMongo(String userId, String purchaseId) {
        return userRepo.deleteUserStockMongo(userId, purchaseId);
    }

    public boolean updateUserStockMongo(String userId, Stock stock) {
        return userRepo.updateUserStockMongo(userId, stock);
    }

    public List<Stock> retrieveUserSoldStockMongo(String userId) {
        return userRepo.retrieveUserSoldStockMongo(userId);
    }

    // public boolean upsertUserYesterdayTotalValueMongo(String userId, double
    // value) {
    // return userRepo.upsertUserYesterdayTotalValueMongo(userId, value);
    // }

    public Boolean insertStockMonthlyPerformanceMongo(String symbol, List<StockPrice> prices) {
        return userRepo.insertStockMonthlyPerformanceMongo(symbol, prices);
    }

    // @Scheduled(fixedDelay = 1 * 60 * 1000) // 1mins in milliseconds
    // Scheduled method to delete documents at the end of the day 12.00am
    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteStockMonthlyPerformanceMongo() {
        System.out.println("deleting mongo stock monthly performance in mongo...");
        userRepo.deleteStockMonthlyPerformanceMongo();
    }

    // Scheduled method to upsert user total value at the end of the day 11.55pm
    @Scheduled(cron = "0 55 23 * * ?")
    public boolean upsertUserYesterdayTotalStockValueMongo() throws IOException {
        System.out.println("updating user total stock value in mongo...");
        int updatedUser = 0;
        List<String> userIdList = userRepo.retrieveAllUserId();
        for (String userId : userIdList) {
            List<StockCount> sc = retrieveUserStocksCount(userId, 1000, 0);
            if (sc == null)
                continue;
            double totalStockValue = 0.0;
            for (StockCount stockCount : sc) {
                String stkSymbol = stockCount.getSymbol();
                double marketPrice = 0.0;
                // check redis whether the latest market price is there
                Optional<Double> optPrice = retrieveUserStockMarketValueRedis(userId, stkSymbol);
                if (optPrice.isEmpty()) {
                    ResponseEntity<String> realStonkPrice = stockSvc.getRealStonksPrice(stkSymbol);
                    marketPrice = getStonkStockPrice(realStonkPrice.getBody());
                    saveUserStockMarketValueRedis(userId, stkSymbol, marketPrice);
                } else {
                    marketPrice = optPrice.get();
                    System.out.println("Market price >>> " + marketPrice);
                }
                totalStockValue += stockCount.getQuantity() * marketPrice;
            }
            boolean updated = userRepo.upsertUserYesterdayTotalValueMongo(userId, totalStockValue);
            System.out.println("updated > " + updated);
            if (updated)
                updatedUser++;
            System.out.println(updated ? "UserId (%s) total stock value was updated...".formatted(userId)
                    : "UserId (%s) total stock value failed to update...".formatted(userId));
        }
        return updatedUser > 0;
    }

    public double retrieveUserYesterdayTotalValueMongo(String userId) {
        return userRepo.retrieveUserYesterdayTotalValueMongo(userId);
    }

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

    public Optional<List<StockPrice>> retrieveStockMonthlyPerformanceMongo(String symbol) {
        return userRepo.retrieveStockMonthlyPerformanceMongo(symbol);
    }

    // HERE
    public Optional<List<Stock>> retrieveUserStockByMonth(String userId, int limit, int skip, String month) {

        String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        for (String mon : months) {
            if (mon.equalsIgnoreCase(month)) {
                month = mon;
            }
        }

        // SAVE EACH STOCK INTO LIST BASED ON MONTH
        List<Stock> janStocks = new LinkedList<>();
        List<Stock> febStocks = new LinkedList<>();
        List<Stock> marStocks = new LinkedList<>();
        List<Stock> aprStocks = new LinkedList<>();
        List<Stock> mayStocks = new LinkedList<>();
        List<Stock> juneStocks = new LinkedList<>();
        List<Stock> julyStocks = new LinkedList<>();
        List<Stock> augStocks = new LinkedList<>();
        List<Stock> sepStocks = new LinkedList<>();
        List<Stock> octStocks = new LinkedList<>();
        List<Stock> novStocks = new LinkedList<>();
        List<Stock> decStocks = new LinkedList<>();

        List<Stock> userStocks = userRepo.retrieveUserStocks(userId, limit, skip);
        for (Stock stock : userStocks) {
            long time = stock.getPurchasedDate();
            Instant instant = Instant.ofEpochMilli(time);
            LocalDate date = instant.atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            stock.setDate(date);
        }

        for (Stock stock : userStocks) {
            int smonth = stock.getDate().getMonthValue();
            // System.out.println(smonth);

            switch (smonth) {
                case 1:
                    janStocks.add(stock);
                    break;
                case 2:
                    febStocks.add(stock);
                    break;
                case 3:
                    marStocks.add(stock);
                    break;
                case 4:
                    aprStocks.add(stock);
                    break;
                case 5:
                    mayStocks.add(stock);
                    break;
                case 6:
                    juneStocks.add(stock);
                    break;
                case 7:
                    julyStocks.add(stock);
                    break;
                case 8:
                    augStocks.add(stock);
                    break;
                case 9:
                    sepStocks.add(stock);
                    break;
                case 10:
                    octStocks.add(stock);
                    break;
                case 11:
                    novStocks.add(stock);
                    break;
                case 12:
                    decStocks.add(stock);
                    break;
            }
        }

        // GET STOCK PERFORMANCE
        List<List<Stock>> allStocks = new LinkedList<>();
        allStocks.add(janStocks);
        allStocks.add(febStocks);
        allStocks.add(marStocks);
        allStocks.add(aprStocks);
        allStocks.add(mayStocks);
        allStocks.add(juneStocks);
        allStocks.add(julyStocks);
        allStocks.add(augStocks);
        allStocks.add(sepStocks);
        allStocks.add(octStocks);
        allStocks.add(novStocks);
        allStocks.add(decStocks);
        // System.out.println(allStocks);

        Map<String, List<Stock>> allStockMap = new HashMap<>();
        for (int i = 0; i < allStocks.size(); i++) {
            allStockMap.put(months[i], allStocks.get(i));
        }

        if (allStockMap.get(month) == null) {
            return Optional.empty();
        }

        return Optional.of(allStockMap.get(month));
    }

    public Optional<Double> retrieveUserStockQuantityByMonth(String userId, int limit, int skip, String month,
            String symbol) {
        String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        List<String> monthsList = Arrays.asList(months);
        List<Stock> userStocks = userRepo.retrieveUserStocks(userId, limit, skip);
        int index = monthsList.indexOf(month);
        double totalQuantity = 0.0;
        for (Stock stock : userStocks) {
            long time = stock.getPurchasedDate();
            Instant instant = Instant.ofEpochMilli(time);
            LocalDate date = instant.atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            stock.setDate(date);
            int smonth = stock.getDate().getMonthValue();

            if (stock.getSymbol().equalsIgnoreCase(symbol) && smonth == index + 1) {
                totalQuantity += stock.getQuantity();
            }
        }
        return Optional.of(totalQuantity);

    }

    public List<String> getEndOfMonthForYear(int year) {
        List<String> endOfMonthDates = new LinkedList<>();
        LocalDate currentDate = LocalDate.now();
        // LocalDate yesterdayDate = currentDate.minusDays(1);

        while (currentDate.getDayOfWeek() == DayOfWeek.SUNDAY || currentDate.getDayOfWeek() == DayOfWeek.SATURDAY) {
            currentDate = currentDate.minusDays(1);
        }
        int currMonth = currentDate.getMonthValue();

        // get end of month until curr month
        for (int month = 1; month <= currMonth; month++) {
            YearMonth yearMonth = YearMonth.of(year, month);
            LocalDate endOfMonth = yearMonth.atEndOfMonth();

            if (endOfMonth.isAfter(currentDate)) {
                endOfMonth = currentDate;
            }

            while (endOfMonth.getDayOfWeek() == DayOfWeek.SATURDAY || endOfMonth.getDayOfWeek() == DayOfWeek.SUNDAY) {
                endOfMonth = endOfMonth.minusDays(1);
            }

            String formattedDate = endOfMonth.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            endOfMonthDates.add(formattedDate);
        }
        return endOfMonthDates;
    }

    public String getStartDateOfTheYear(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);

        while (startDate.getDayOfWeek() == DayOfWeek.SATURDAY || startDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
            startDate = startDate.plusDays(1);
        }
        String formattedDate = startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return formattedDate;
    }

    public String getYesterdayDate() {
        LocalDate currentDate = LocalDate.now();
        LocalDate yesterdayDate = currentDate.minusDays(1);

        while (yesterdayDate.getDayOfWeek() == DayOfWeek.SUNDAY || yesterdayDate.getDayOfWeek() == DayOfWeek.SATURDAY) {
            yesterdayDate = currentDate.minusDays(1);
        }

        String formattedDate = yesterdayDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return formattedDate;
    }

    public List<Double> getUserMonthlyPerformanceForYear(int year, String userId, int limit, int skip)
            throws IOException {
        List<String> endOfMonthDates = getEndOfMonthForYear(year); // [2023-01-31, 2023-02-28, 2023-03-31, 2023-04-28,
                                                                   // 2023-05-31, TODAYS DATE]
        endOfMonthDates.add(getYesterdayDate());
        System.out.println("End of months >>> " + endOfMonthDates);
        String startDateOfTheYear = getStartDateOfTheYear(year);
        String currDate = endOfMonthDates.get(endOfMonthDates.size() - 2);
        System.out.println("CurrDate >>> " + currDate);

        String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        Map<String, List<Stock>> allStockMap = new HashMap<>();
        Map<String, List<Stock>> stockWithMarketPriceMap = new HashMap<>();
        List<Double> monthlyPerformance = new LinkedList<>();

        // put stocks into map based on month
        for (int i = 0; i < months.length; i++) {
            String month = months[i];
            Optional<List<Stock>> stocksByMonthOpt = retrieveUserStockByMonth(userId, limit, skip, month);
            if (stocksByMonthOpt.isPresent()) {
                List<Stock> stocksByMonth = stocksByMonthOpt.get();
                allStockMap.put(month, stocksByMonth);
            }
        }

        // set stocks market price based on months
        for (int i = 0; i <= endOfMonthDates.size(); i++) {
            String month = months[i];
            List<Stock> stocksByMonth = allStockMap.get(month);
            for (Stock stock : stocksByMonth) {
                Optional<List<StockPrice>> stockPriceOpt = retrieveStockMonthlyPerformanceMongo(stock.getSymbol());
                if (stockPriceOpt.isPresent()) {
                    List<StockPrice> stockMarketPrices = stockPriceOpt.get();
                    for (StockPrice stockPrice : stockMarketPrices) {
                        if (stockPrice.getDate().equalsIgnoreCase(endOfMonthDates.get(i))) {
                            double stockMarketPrice = stockPrice.getClosePrice();
                            stock.setMarketPrice(stockMarketPrice);
                        }
                    }
                }
            }
            stockWithMarketPriceMap.put(month, stocksByMonth);
        }

        double totalCapital = 0.0;
        // get list of performance per month
        for (int i = 0; i < endOfMonthDates.size(); i++) {
            String month = months[i];
            // System.out.println("Month of >>>" + month);
            List<Stock> stocksByMonth = stockWithMarketPriceMap.get(month);

            // get capital
            for (Stock stock : stocksByMonth) {
                // System.out.println("Stock >>> " + stock.getSymbol());
                totalCapital += (stock.getStrikePrice() * stock.getQuantity()) + stock.getFees();
                // System.out.println("total capital >>> " + totalCapital);
            }

            // stock market price for curr month & multiply by accumulate qty from previous
            // month till curr month
            double totalStockMarketPrice = 0.0;
            // for each stock
            for (int j = 0; j <= i; j++) {
                String startMonth = months[j];
                // System.out.println("Start Month >>> " + startMonth);
                String currEndOfMonthDate = endOfMonthDates.get(i);
                // System.out.println("Curr end of Month >>> " + currEndOfMonthDate);
                List<Stock> stocksForCurrMonth = stockWithMarketPriceMap.get(startMonth);
                for (Stock stock : stocksForCurrMonth) {
                    // System.out.println("Stock symbol >>> " + stock.getSymbol());
                    Optional<List<StockPrice>> stockPriceOpt = retrieveStockMonthlyPerformanceMongo(stock.getSymbol());

                    if (stockPriceOpt.isPresent()) {
                        // if stock monthly performance is present in mongo
                        // System.out.println("Stock Market Price is present");
                        List<StockPrice> stockMarketPrices = stockPriceOpt.get();
                        Optional<StockPrice> sp = stockMarketPrices.stream()
                                .filter(smp -> smp.getDate().equalsIgnoreCase(currEndOfMonthDate)).findFirst();
                        double currMonthMarketPrice = 0.0;
                        if (sp.isPresent()) {
                            currMonthMarketPrice = sp.get().getClosePrice();
                        }
                        // System.out.println("Curr month close price >>> " + currMonthMarketPrice);
                        totalStockMarketPrice += stock.getQuantity() * currMonthMarketPrice;
                        // System.out.println("total market price >>> " + totalStockMarketPrice);
                    } else {
                        // else call api to save stock performance into mongo and return the result
                        System.out.println("Calling YH FINANCE API for %s monthly price from %s to %s"
                                .formatted(stock.getSymbol(), startDateOfTheYear, currDate));
                        ResponseEntity<String> res = stockSvc.getStockMonthlyPrice(stock.getSymbol(),
                                startDateOfTheYear, currDate);
                        if (res.getStatusCode().isError()) {
                            System.err.println("YH FINANCE API ERROR " + res.getBody());
                            break;
                        }
                        String body = res.getBody();
                        List<StockPrice> spList = new LinkedList<>();

                        if (body != null && !body.isEmpty()) {
                            try (InputStream is = new ByteArrayInputStream(body.getBytes())) {
                                JsonReader reader = Json.createReader(is);
                                JsonArray jrArr = reader.readArray();
                                for (JsonValue jsonValue : jrArr) {
                                    JsonObject jsObj = (JsonObject) jsonValue;
                                    spList.add(StockPrice.convertFromJsonObject(jsObj));
                                }
                            }
                        }
                        // SAVE TO MONGO
                        insertStockMonthlyPerformanceMongo(stock.getSymbol(), spList);

                        Optional<StockPrice> sp = spList.stream()
                                .filter(smp -> smp.getDate().equalsIgnoreCase(currEndOfMonthDate)).findFirst();
                        double currMonthMarketPrice = 0.0;
                        if (sp.isPresent()) {
                            currMonthMarketPrice = sp.get().getClosePrice();
                        }
                        // System.out.println("Curr month close price >>> " + currMonthMarketPrice);
                        totalStockMarketPrice += stock.getQuantity() * currMonthMarketPrice;
                        // System.out.println("total market price >>> " + totalStockMarketPrice);
                    }
                }
            }
            // System.out.println("Accumulated total market price >>> " +
            // totalStockMarketPrice);
            double performance = 0.0;
            if (totalStockMarketPrice > 0.0) {
                performance = (totalStockMarketPrice - totalCapital) / totalCapital;
                monthlyPerformance.add(performance * 100);
            }
            // System.out.println("--- End of month ---");
        }

        return monthlyPerformance;
    }

    public List<Double> getUserMonthlyStockValueForYear(int year, String userId, int limit, int skip)
            throws IOException {
        List<String> endOfMonthDates = getEndOfMonthForYear(year); // [2023-01-31, 2023-02-28, 2023-03-31, 2023-04-28,
                                                                   // 2023-05-31, TODAYS DATE]
        endOfMonthDates.add(getYesterdayDate());
        // System.out.println("End of months >>> " + endOfMonthDates);
        String startDateOfTheYear = getStartDateOfTheYear(year);
        String currDate = endOfMonthDates.get(endOfMonthDates.size() - 2);

        String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        Map<String, List<Stock>> allStockMap = new HashMap<>();
        Map<String, List<Stock>> stockWithMarketPriceMap = new HashMap<>();
        List<Double> monthlyStockValue = new LinkedList<>();

        // put stocks into map based on month
        for (int i = 0; i < months.length; i++) {
            String month = months[i];
            Optional<List<Stock>> stocksByMonthOpt = retrieveUserStockByMonth(userId, limit, skip, month);
            if (stocksByMonthOpt.isPresent()) {
                List<Stock> stocksByMonth = stocksByMonthOpt.get();
                allStockMap.put(month, stocksByMonth);
            }
        }

        // set stocks market price based on months
        for (int i = 0; i <= endOfMonthDates.size(); i++) {
            String month = months[i];
            List<Stock> stocksByMonth = allStockMap.get(month);
            for (Stock stock : stocksByMonth) {
                Optional<List<StockPrice>> stockPriceOpt = retrieveStockMonthlyPerformanceMongo(stock.getSymbol());
                if (stockPriceOpt.isPresent()) {
                    List<StockPrice> stockMarketPrices = stockPriceOpt.get();
                    for (StockPrice stockPrice : stockMarketPrices) {
                        if (stockPrice.getDate().equalsIgnoreCase(endOfMonthDates.get(i))) {
                            double stockMarketPrice = stockPrice.getClosePrice();
                            stock.setMarketPrice(stockMarketPrice);
                        }
                    }
                }
            }
            stockWithMarketPriceMap.put(month, stocksByMonth);
        }

        // get list of stock value per month
        for (int i = 0; i < endOfMonthDates.size(); i++) {

            // stock market price for curr month & multiply by accumulate qty from previous
            // month till curr month
            double totalStockMarketPrice = 0.0;
            // for each stock
            for (int j = 0; j <= i; j++) {
                String startMonth = months[j];
                // System.out.println("Start Month >>> " + startMonth);
                String currEndOfMonthDate = endOfMonthDates.get(i);
                // System.out.println("Curr end of Month >>> " + currEndOfMonthDate);
                List<Stock> stocksForCurrMonth = stockWithMarketPriceMap.get(startMonth);
                for (Stock stock : stocksForCurrMonth) {
                    // System.out.println("Stock symbol >>> " + stock.getSymbol());
                    Optional<List<StockPrice>> stockPriceOpt = retrieveStockMonthlyPerformanceMongo(stock.getSymbol());

                    if (stockPriceOpt.isPresent()) {
                        // if stock monthly performance is present in mongo
                        // System.out.println("Stock Market Price is present");
                        List<StockPrice> stockMarketPrices = stockPriceOpt.get();
                        Optional<StockPrice> sp = stockMarketPrices.stream()
                                .filter(smp -> smp.getDate().equalsIgnoreCase(currEndOfMonthDate)).findFirst();
                        double currMonthMarketPrice = 0.0;
                        if (sp.isPresent()) {
                            currMonthMarketPrice = sp.get().getClosePrice();
                        }
                        // System.out.println("Curr month close price >>> " + currMonthMarketPrice);
                        totalStockMarketPrice += stock.getQuantity() * currMonthMarketPrice;
                        // System.out.println("total market price >>> " + totalStockMarketPrice);
                    } else {
                        // else call api to save stock performance into mongo and return the result
                        System.out.println("Calling YH FINANCE API for %s monthly price from %s to %s"
                                .formatted(stock.getSymbol(), startDateOfTheYear, currDate));
                        ResponseEntity<String> res = stockSvc.getStockMonthlyPrice(stock.getSymbol(),
                                startDateOfTheYear, currDate);
                        if (res.getStatusCode().isError()) {
                            System.err.println("YH FINANCE API ERROR " + res.getBody());
                            break;
                        }
                        String body = res.getBody();
                        List<StockPrice> spList = new LinkedList<>();

                        if (body != null && !body.isEmpty()) {
                            try (InputStream is = new ByteArrayInputStream(body.getBytes())) {
                                JsonReader reader = Json.createReader(is);
                                JsonArray jrArr = reader.readArray();
                                for (JsonValue jsonValue : jrArr) {
                                    JsonObject jsObj = (JsonObject) jsonValue;
                                    spList.add(StockPrice.convertFromJsonObject(jsObj));
                                }
                            }
                        }
                        // SAVE TO MONGO
                        insertStockMonthlyPerformanceMongo(stock.getSymbol(), spList);

                        Optional<StockPrice> sp = spList.stream()
                                .filter(smp -> smp.getDate().equalsIgnoreCase(currEndOfMonthDate)).findFirst();
                        double currMonthMarketPrice = 0.0;
                        if (sp.isPresent()) {
                            currMonthMarketPrice = sp.get().getClosePrice();
                        }
                        // System.out.println("Curr month close price >>> " + currMonthMarketPrice);
                        totalStockMarketPrice += stock.getQuantity() * currMonthMarketPrice;
                        // System.out.println("total market price >>> " + totalStockMarketPrice);
                    }
                }
            }
            // System.out.println("Accumulated total market price >>> " +
            // totalStockMarketPrice);
            if (totalStockMarketPrice > 0.0) {
                monthlyStockValue.add(totalStockMarketPrice);
            }
            // System.out.println("--- End of month ---");
        }

        return monthlyStockValue;
    }

    // ***** UNUSED *****
    // public void saveStockTotalValueRedis(String userId, double value) {
    // userRepo.saveStockTotalValueRedis(userId, value);
    // }

    // public Optional<Double> retrieveStockTotalValueRedis(String userId) {
    // return userRepo.retrieveStockTotalValueRedis(userId);
    // }

    // public Boolean upsertStockMonthlyPerformance(String symbol, List<StockPrice>
    // prices) {
    // return userRepo.upsertStockMonthlyPerformance(symbol, prices);
    // }

}
