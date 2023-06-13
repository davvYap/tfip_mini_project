package sg.edu.nus.iss.project.repositories;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import com.mongodb.client.result.UpdateResult;

import sg.edu.nus.iss.project.models.Stock;
import sg.edu.nus.iss.project.models.StockPrice;

@Repository
public class UserRepository {

    @Autowired
    private MongoTemplate mongo;

    @Autowired
    @Qualifier("user_portfolio")
    private RedisTemplate<String, String> redis;

    public Boolean upsertUserTheme(String userId, String themeName) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Update udpateOps = new Update()
                .set("user_id", userId)
                .set("theme_name", themeName);
        UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "user_theme");
        return upsertDoc.getModifiedCount() > 0;
    }

    public String retrieveUserTheme(String userId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "user_theme");
        if (d == null) {
            return "viva-dark";
        }
        return d.getString("theme_name");
    }

    public Boolean upsertUserGoal(String userId, double goal) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Update updateOps = new Update()
                .set("user_id", userId)
                .set("goal", goal);
        UpdateResult upsertDoc = mongo.upsert(query, updateOps, "user_goal");
        return upsertDoc.getModifiedCount() > 0;
    }

    public double retrieveUserGoal(String userId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "user_goal");
        if (d == null) {
            return 10000;
        }
        return d.getDouble("goal");
    }

    public Boolean upsertUserStocks(String userId, Stock stock) {

        Query query = Query.query(Criteria.where("user_id").is(userId));
        Update udpateOps = new Update()
                .set("user_id", userId)
                .push("stocks", stock.toDocument());

        UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "stocks");
        return upsertDoc.getModifiedCount() > 0;
    }

    public List<Stock> retrieveUserStocks(String userId, int limit, int skip) {
        Query query = Query.query(Criteria.where("user_id").is(userId)).limit(limit).skip(skip);

        Document d = mongo.findOne(query, Document.class, "stocks");

        if (d != null) {
            List<Stock> stocks = d.getList("stocks", Document.class).stream()
                    .map(Stock::convertFromDocument)
                    .toList();
            if (stocks.size() > limit + 1) {
                List<Stock> limitedStocks = stocks.subList(skip, limit + 1);
                return limitedStocks;
            }

            return stocks;
        }
        return null;
    }

    public void saveStockTotalValueRedis(String userId, double value) {
        redis.opsForHash().put(userId, "total_stock_value", String.valueOf(value));
        // redis.expire(userId, 1, TimeUnit.DAYS);
        redis.expireAt(userId, expirationDayInInstance());
        System.out.println("Redis saved total stock value for %s".formatted(userId));
    }

    public void saveUserStockMarketValueRedis(String userId, String symbol, double value) {
        redis.opsForHash().put(userId, symbol, String.valueOf(value));
        System.out.println("Redis saved stock market value for %s".formatted(symbol));
    }

    public Optional<Double> retrieveStockTotalValueRedis(String userId) {
        String value = (String) redis.opsForHash().get(userId, "total_stock_value");
        if (value == null) {
            return Optional.empty();
        }
        return Optional.of(Double.parseDouble(value));
    }

    public Optional<Double> retrieveUserStockMarketValueRedis(String userId, String symbol) {
        String marketprice = (String) redis.opsForHash().get(userId, symbol);
        System.out.println("Checking redis for %s market price".formatted(symbol));
        if (marketprice == null) {
            return Optional.empty();
        }
        return Optional.of(Double.parseDouble(marketprice));
    }

    public Boolean upsertStockMonthlyPerformance(String symbol, List<StockPrice> prices) {

        Query query = Query.query(Criteria.where("symbol").is(symbol));
        List<Document> d = prices.stream()
                .map(StockPrice::toDocument).toList();

        Update udpateOps = new Update()
                .set("prices", d);

        UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "stocks_monthly_performance");
        System.out.println("Mongo saved stock monthly performance for %s".formatted(symbol));
        return upsertDoc.getModifiedCount() > 0;
    }

    public Optional<List<StockPrice>> retrieveStockMonthlyPerformance(String symbol) {
        Query query = Query.query(Criteria.where("symbol").is(symbol));
        Document d = mongo.findOne(query, Document.class, "stocks_monthly_performance");

        if (d == null) {
            return Optional.empty();
        }
        System.out.println("Checking mongo for %s monthly performance".formatted(symbol));
        List<StockPrice> prices = d.getList("prices", Document.class).stream()
                .map(doc -> StockPrice.convertFromDocument(doc)).toList();

        return Optional.of(prices);

    }

    // EXTRA
    public Instant expirationDayInInstance() {
        LocalDate currDate = LocalDate.now();
        System.out.println("currDate >>> " + currDate);

        LocalDateTime endOfDay = LocalDateTime.of(currDate, LocalTime.MAX);
        System.out.println("endofDay >>> " + endOfDay);

        Instant endOfDayInstant = endOfDay.atZone(ZoneId.systemDefault()).toInstant();

        return endOfDayInstant;
    }
}
