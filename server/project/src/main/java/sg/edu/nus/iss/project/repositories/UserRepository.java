package sg.edu.nus.iss.project.repositories;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

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
            // NOTE here will limit user stocks
            if (stocks.size() > limit + 1) {
                List<Stock> limitedStocks = stocks.subList(skip, limit + 1);
                return limitedStocks;
            }
            return stocks;
        }
        return null;
    }

    public boolean upsertUserStockLogo(String symbol, String url) {
        Query query = Query.query(Criteria.where("symbol").is(symbol));
        Update updateOps = new Update()
                .set("symbol", symbol)
                .set("url", url);
        UpdateResult upsertDoc = mongo.upsert(query, updateOps, "stocks_logo");
        System.out.println("Insert stock %s logo".formatted(symbol));
        return upsertDoc.getModifiedCount() > 0;
    }

    public String retrieveUserStockLogo(String symbol) {
        Query query = Query.query(Criteria.where("symbol").is(symbol));
        Document doc = mongo.findOne(query, Document.class, "stocks_logo");
        String logoUrl = "";
        if (doc != null) {
            logoUrl = doc.getString("url");
        }
        return logoUrl;
    }

    public Stock findUserStock(String userId, String purchaseId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "stocks");
        Stock stock = null;
        if (d != null) {
            List<Stock> stocks = d.getList("stocks", Document.class).stream()
                    .map(Stock::convertFromDocument)
                    .toList();
            Optional<Stock> stockOptional = stocks.stream().filter(s -> s.getPurchaseId().equalsIgnoreCase(purchaseId))
                    .findFirst();
            if (stockOptional.isPresent()) {
                stock = stockOptional.get();
            }
        }
        return stock;
    }

    public boolean deleteUserStockMongo(String userId, String purchaseId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Stock stock = findUserStock(userId, purchaseId);
        System.out.println("Deleting stock with purchaseId -> %s in mongo".formatted(purchaseId));
        if (stock != null) {
            Update update = new Update().pull("stocks", stock.toDocument());
            mongo.updateFirst(query, update, "stocks");
            return true;
        }
        return false;
    }

    public boolean updateUserStockMongo(String userId, Stock stock) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Stock originalStk = findUserStock(userId, stock.getPurchaseId());
        if (originalStk != null) {
            double profit = 0.0;
            double remainingQty = originalStk.getQuantity() - stock.getQuantity();
            deleteUserStockMongo(userId, stock.getPurchaseId());
            double remainingFees = originalStk.getFees();
            if (remainingQty != 0.0) {
                remainingFees = (remainingQty / originalStk.getQuantity()) * originalStk.getFees();
                originalStk.setQuantity(remainingQty);
                originalStk.setFees(remainingFees);
                upsertUserStocks(userId, originalStk);
            }
            double orignalFees = originalStk.getFees();
            profit = ((stock.getStrikePrice() - originalStk.getStrikePrice()) * stock.getQuantity())
                    - stock.getFees()
                    - (orignalFees - remainingFees);

            // insert sold stocks into another collection
            Update udpateOps = new Update()
                    .set("user_id", userId)
                    .push("sold_stocks", stock.toDocumentSold(profit));
            System.out.println("Update user mongo stock %s with profit of %.2f".formatted(stock.getSymbol(), profit));
            UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "sold_stocks");
            return upsertDoc.getModifiedCount() > 0;
        }
        return false;
    }

    public void saveUserStockMarketValueRedis(String userId, String symbol, double value) {
        redis.opsForHash().put(userId, symbol, String.valueOf(value));
        System.out.println("Redis saved stock market value for %s".formatted(symbol));
    }

    public Optional<Double> retrieveUserStockMarketValueRedis(String userId, String symbol) {
        String marketprice = (String) redis.opsForHash().get(userId, symbol);
        System.out.println("Checking redis for %s market price".formatted(symbol));
        if (marketprice == null) {
            return Optional.empty();
        }
        return Optional.of(Double.parseDouble(marketprice));
    }

    public boolean upsertUserYesterdayTotalValueMongo(String userId, double value) {
        Query q = Query.query(Criteria.where("userId").is(userId));
        Update updateOps = new Update().set("total_value", value);
        UpdateResult upsertDoc = mongo.upsert(q, updateOps, "user_total_value");
        System.out.println("Mongo saved user total value $s".formatted(value));
        return upsertDoc.getModifiedCount() > 0;
    }

    public Boolean insertStockMonthlyPerformanceMongo(String symbol, List<StockPrice> prices) {
        List<Document> d = prices.stream()
                .map(StockPrice::toDocument).toList();

        Document toInsert = new Document("symbol", symbol)
                .append("prices", d)
                .append("expireAt", LocalDateTime.now());

        Document newDoc = mongo.insert(toInsert, "stocks_monthly_performance");
        System.out.println("Mongo saved stock monthly performance for %s".formatted(symbol));

        return !newDoc.isEmpty();
    }

    // HERE
    public void deleteStockMonthlyPerformanceMongo() {

        LocalDate today = LocalDate.now();
        LocalDateTime endofDay = LocalDateTime.of(today, LocalTime.MAX);

        // LocalDateTime endofDay = LocalDateTime.now().plus(1, ChronoUnit.MINUTES);

        Query q = Query.query(Criteria.where("expireAt").lte(endofDay));
        mongo.remove(q, Document.class, "stocks_monthly_performance");
    }

    public Optional<List<StockPrice>> retrieveStockMonthlyPerformanceMongo(String symbol) {
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

    // ***** UNUSED *****
    // public void saveStockTotalValueRedis(String userId, double value) {
    // redis.opsForHash().put(userId, "total_stock_value", String.valueOf(value));
    // // redis.expire(userId, 1, TimeUnit.DAYS);
    // redis.expireAt(userId, expirationDayInInstance());
    // System.out.println("Redis saved total stock value for %s".formatted(userId));
    // }

    // public Optional<Double> retrieveStockTotalValueRedis(String userId) {
    // String value = (String) redis.opsForHash().get(userId, "total_stock_value");
    // if (value == null) {
    // return Optional.empty();
    // }
    // return Optional.of(Double.parseDouble(value));
    // }

    // public Boolean upsertStockMonthlyPerformance(String symbol, List<StockPrice>
    // prices) {

    // Query query = Query.query(Criteria.where("symbol").is(symbol));
    // List<Document> d = prices.stream()
    // .map(StockPrice::toDocument).toList();

    // Update udpateOps = new Update()
    // .set("prices", d);

    // UpdateResult upsertDoc = mongo.upsert(query, udpateOps,
    // "stocks_monthly_performance");
    // System.out.println("Mongo saved stock monthly performance for
    // %s".formatted(symbol));
    // return upsertDoc.getModifiedCount() > 0;
    // }
}
