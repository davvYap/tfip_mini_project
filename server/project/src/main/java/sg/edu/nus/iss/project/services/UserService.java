package sg.edu.nus.iss.project.services;

import java.util.LinkedList;
import java.util.List;
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
}
