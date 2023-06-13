package sg.edu.nus.iss.project.services;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.project.models.Stock;
import sg.edu.nus.iss.project.models.StockCount;
import sg.edu.nus.iss.project.models.StockPrice;
import sg.edu.nus.iss.project.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

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

    public void saveStockTotalValueRedis(String userId, double value) {
        userRepo.saveStockTotalValueRedis(userId, value);
    }

    public void saveUserStockMarketValueRedis(String userId, String symbol, double value) {
        userRepo.saveUserStockMarketValueRedis(userId, symbol, value);
    }

    public Optional<Double> retrieveStockTotalValueRedis(String userId) {
        return userRepo.retrieveStockTotalValueRedis(userId);
    }

    public Optional<Double> retrieveUserStockMarketValueRedis(String userId, String symbol) {
        return userRepo.retrieveUserStockMarketValueRedis(userId, symbol);
    }

    public Boolean upsertStockMonthlyPerformance(String symbol, List<StockPrice> prices) {
        return userRepo.upsertStockMonthlyPerformance(symbol, prices);
    }

    public Optional<List<StockPrice>> retrieveStockMonthlyPerformance(String symbol) {
        return userRepo.retrieveStockMonthlyPerformance(symbol);
    }

    // HERE
    public Optional<List<Stock>> retrieveUserStockByMonth(String userId, int limit, int skip, String month) {

        String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

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
            System.out.println(smonth);

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
        System.out.println(allStocks);

        Map<String, List<Stock>> allStockMap = new HashMap<>();
        for (int i = 0; i < allStocks.size(); i++) {
            allStockMap.put(months[i], allStocks.get(i));
        }

        if (allStockMap.get(month) == null) {
            return Optional.empty();
        }

        return Optional.of(allStockMap.get(month));
    }

}
