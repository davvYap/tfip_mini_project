package sg.edu.nus.iss.project.repositories;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;
import org.springframework.util.comparator.Comparators;

import com.mongodb.client.result.UpdateResult;

import sg.edu.nus.iss.project.models.Stock;
import sg.edu.nus.iss.project.models.StockIdea;
import sg.edu.nus.iss.project.models.StockPrice;
import sg.edu.nus.iss.project.models.StockProfile;

import static sg.edu.nus.iss.project.repositories.DBQueries.*;

@Repository
public class UserRepository {

    @Autowired
    private MongoTemplate mongo;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    @Qualifier("user_portfolio")
    private RedisTemplate<String, String> redis;

    public List<String> retrieveAllUserId() {
        SqlRowSet rs = jdbc.queryForRowSet(SQL_GET_ALL_USERS);
        List<String> userId = new ArrayList<>();
        while (rs.next()) {
            userId.add(rs.getString("user_id"));
        }
        return userId;
    }

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
            return "mira";
        }
        return d.getString("theme_name");
    }

    public Boolean upsertUserGoal(String userId, double goal) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Update updateOps = new Update()
                .set("user_id", userId)
                .set("goal", goal);
        UpdateResult upsertDoc = mongo.upsert(query, updateOps, "user_goal");
        return true;
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

    // for deleting and updating user stock
    public Stock findUserStockWithPurchaseId(String userId, String purchaseId) {
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

    // for deleting and updating user stock
    public List<Stock> findUserStockWithSymbol(String userId, String symbol) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "stocks");
        List<Stock> stocksWithSelectedSymbol = new ArrayList<>();
        if (d != null) {
            List<Stock> stocks = d.getList("stocks", Document.class).stream()
                    .map(Stock::convertFromDocument)
                    .toList();
            stocks.stream().forEach(s -> {
                if (s.getSymbol().equalsIgnoreCase(symbol))
                    stocksWithSelectedSymbol.add(s);
            });
        }
        return stocksWithSelectedSymbol;
    }

    public boolean deleteUserStockMongo(String userId, String purchaseId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Stock stock = findUserStockWithPurchaseId(userId, purchaseId);
        System.out.println("Deleting stock with purchaseId -> %s in mongo".formatted(purchaseId));
        if (stock != null) {
            Update update = new Update().pull("stocks", stock.toDocument());
            mongo.updateFirst(query, update, "stocks");
            return true;
        }
        return false;
    }

    public boolean deteleUserStockMongoWithSymbol(String userId, String symbol) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        List<Stock> stocksWithSelectedSymbol = findUserStockWithSymbol(userId, symbol);
        System.out.println("Deleting stock with symbol -> %s in mongo".formatted(symbol));
        int totalDeletedStocks = 0;
        if (stocksWithSelectedSymbol.size() > 0) {
            for (Stock stock : stocksWithSelectedSymbol) {
                if (stock != null) {
                    Update update = new Update().pull("stocks", stock.toDocument());
                    mongo.updateFirst(query, update, "stocks");
                    totalDeletedStocks++;
                }
            }
        }
        return totalDeletedStocks > 0;
    }

    // sell user stock
    public boolean updateUserStockMongo(String userId, Stock stock) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        System.out.println("Selling stock >>> " + stock.toString());
        // if (!stock.getPurchaseId().isEmpty() && !stock.getPurchaseId().isBlank()) {
        // System.out.println(
        // "Creating sell order for single stock with purchaseId
        // %s".formatted(stock.getPurchaseId()));
        // Stock originalStk = findUserStockWithPurchaseId(userId,
        // stock.getPurchaseId());
        // if (originalStk != null) {
        // double profit = 0.0;
        // // delete original stock then insert again with updated quantity and
        // remaining
        // // fees
        // deleteUserStockMongo(userId, stock.getPurchaseId());
        // double remainingQty = originalStk.getQuantity() - stock.getQuantity();
        // double remainingFees = originalStk.getFees();
        // if (remainingQty != 0.0) {
        // remainingFees = (remainingQty / originalStk.getQuantity()) *
        // originalStk.getFees();
        // originalStk.setQuantity(remainingQty);
        // originalStk.setFees(remainingFees);
        // upsertUserStocks(userId, originalStk);
        // }
        // double orignalFees = originalStk.getFees();
        // profit = ((stock.getStrikePrice() - originalStk.getStrikePrice()) *
        // stock.getQuantity())
        // - stock.getFees()
        // - (orignalFees - remainingFees);

        // // insert sold stocks into another collection
        // Update udpateOps = new Update()
        // .set("user_id", userId)
        // .push("sold_stocks", stock.toDocumentSold(profit));
        // System.out
        // .println("Update user mongo stock %s with profit of
        // %.2f".formatted(stock.getSymbol(), profit));
        // UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "sold_stocks");
        // return upsertDoc.getModifiedCount() > 0;
        // }
        // return false;
        // } else {
        // }
        System.out.println("Creating sell order for whole stock with symbol %s".formatted(stock.getSymbol()));
        List<Stock> originalStks = findUserStockWithSymbol(userId, stock.getSymbol());
        if (originalStks.size() > 0) {
            String sellOrderId = UUID.randomUUID().toString().substring(0, 8);
            stock.setPurchaseId(sellOrderId);

            // insert sold stocks into another collection
            double totalQuantity = 0.0;
            double totalBoughtPrice = 0.0;
            for (Stock s : originalStks) {
                totalQuantity += s.getQuantity();
                totalBoughtPrice += (s.getStrikePrice() * s.getQuantity()) + s.getFees();
            }
            double averagePrice = totalBoughtPrice / totalQuantity;
            System.out.println("average price >>> " + averagePrice);
            System.out.println("market price >>> " + stock.getStrikePrice());
            double profit = ((stock.getStrikePrice() - averagePrice) * stock.getQuantity()) - stock.getFees();
            Update updateOps = new Update()
                    .set("user_id", userId)
                    .push("sold_stocks", stock.toDocumentSold(profit));
            System.out
                    .println("Update user mongo stock %s with profit of %.2f".formatted(stock.getSymbol(), profit));
            UpdateResult upsertDoc = mongo.upsert(query, updateOps, "sold_stocks");

            // insert into user stock collection
            double sellQuantity = stock.getQuantity() * -1;
            stock.setQuantity(sellQuantity);
            upsertUserStocks(userId, stock);
            return true;
        }
        return false;
    }

    public List<Stock> retrieveUserSoldStockMongo(String userId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "sold_stocks");
        if (d != null) {
            List<Stock> stocks = d.getList("sold_stocks", Document.class).stream()
                    .map(Stock::convertSoldStockFromDocument)
                    .toList();
            return stocks;
        }
        return null;
    }

    // public void saveUserStockMarketValueRedis(String userId, String symbol,
    // double value) {
    // redis.opsForHash().put(userId, symbol, String.valueOf(value));
    // redis.expireAt(userId, expirationDayInInstance());
    // System.out.println("Redis saved user stock market value for
    // %s".formatted(symbol));
    // }

    // public Optional<Double> retrieveUserStockMarketValueRedis(String userId,
    // String symbol) {
    // String marketprice = (String) redis.opsForHash().get(userId, symbol);
    // // System.out.println("Checking redis for %s market
    // price".formatted(symbol));
    // if (marketprice == null) {
    // return Optional.empty();
    // }
    // return Optional.of(Double.parseDouble(marketprice));
    // }

    public void saveStockMarketValueRedis(String symbol, double value) {
        redis.opsForValue().set(symbol, String.valueOf(value));
        redis.expireAt(symbol, expirationDayInInstance());
        System.out.println("Redis saved stock market value for %s".formatted(symbol));
    }

    public Optional<Double> retrieveStockMarketValueRedis(String symbol) {
        String marketPrice = (String) redis.opsForValue().get(symbol);
        if (marketPrice == null) {
            return Optional.empty();
        }
        return Optional.of(Double.parseDouble(marketPrice));
    }

    public void saveStockSummaryDataRedis(String symbol, String json) {
        String redisKey = symbol + "_summary_data";
        redis.opsForValue().set(redisKey, json);
        redis.expireAt(redisKey, expirationDayInInstance());
        System.out.println("Redis saved stock summary data for %s".formatted(symbol));
    }

    public Optional<String> retrieveStockSummaryDataRedis(String symbol) {
        String redisKey = symbol.toUpperCase() + "_summary_data";
        String json = (String) redis.opsForValue().get(redisKey);
        if (json == null) {
            return Optional.empty();
        }
        return Optional.of(json);
    }

    public boolean upsertUserYesterdayTotalValueMongo(String userId, double value) {
        Query q = Query.query(Criteria.where("userId").is(userId));
        Update updateOps = new Update().set("total_value", value);
        UpdateResult upsertDoc = mongo.upsert(q, updateOps, "user_total_value");
        System.out.println("Mongo saved users total value : " + value);
        return upsertDoc.getModifiedCount() > 0;
    }

    public double retrieveUserYesterdayTotalValueMongo(String userId) {
        Query query = Query.query(Criteria.where("userId").is(userId));
        Document d = mongo.findOne(query, Document.class, "user_total_value");
        if (d == null)
            return 0.0;
        return d.getDouble("total_value");
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
        // System.out.println("Checking mongo for %s monthly
        // performance".formatted(symbol));
        List<StockPrice> prices = d.getList("prices", Document.class).stream()
                .map(doc -> StockPrice.convertFromDocument(doc)).toList();

        return Optional.of(prices);
    }

    public void insertStockProfileMongo(String symbol, StockProfile sp) {
        Document doc = new Document();
        doc.append("symbol", symbol).append("profile", sp.toDocument());
        Document insertedDoc = mongo.insert(doc, "stock_company_profile");
        System.out.println("Insert stock %s company profile".formatted(symbol));
    }

    public StockProfile retrieveStockProfileMongo(String symbol) {
        Query query = Query.query(Criteria.where("symbol").is(symbol));
        Document doc = mongo.findOne(query, Document.class, "stock_company_profile");
        // System.out.println("full doc >> " + doc);
        StockProfile sp = null;
        if (doc != null) {
            Document d = (Document) doc.get("profile");
            // System.out.println("doc >> " + d);
            sp = StockProfile.convertFromDocument(d);
        }
        return sp;
    }

    public boolean upsertUserStockIdeaMongo(String symbol, StockIdea idea) {
        idea.setId(UUID.randomUUID().toString().substring(0, 8));
        Query query = Query.query(Criteria.where("symbol").is(symbol));
        Update udpateOps = new Update()
                .set("symbol", symbol)
                .push("stock_idea", idea.toDocument());

        UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "stocks_ideas");
        return upsertDoc.getModifiedCount() > 0;
    }

    public List<StockIdea> retrieveStockIdeasMongo(String symbol, int limit, int skip) {
        Query query = Query.query(Criteria.where("symbol").is(symbol)).limit(limit).skip(skip);
        Document d = mongo.findOne(query, Document.class, "stocks_ideas");
        if (d != null) {
            List<StockIdea> stockIdeas = d.getList("stock_idea", Document.class).stream()
                    .map(StockIdea::convertFromDocument)
                    .toList();

            List<StockIdea> mutableStockIdeas = new ArrayList<>(stockIdeas);

            Collections.sort(mutableStockIdeas, Comparator.comparingLong(StockIdea::getDate).reversed());

            // mutableStockIdeas.forEach(s -> System.out.println(s.toString()));
            // NOTE here will limit user stocks
            if (mutableStockIdeas.size() > limit + 1) {
                List<StockIdea> limitedStockIdeas = mutableStockIdeas.subList(skip, limit + 1);
                return limitedStockIdeas;
            }
            return mutableStockIdeas;
        }
        return null;
    }

    public boolean deleteStockIdeaMongo(String symbol, String ideaId) {
        Query query = Query.query(Criteria.where("symbol").is(symbol));
        // Stock stock = findUserStockWithPurchaseId(userId, purchaseId);

        Document d = mongo.findOne(query, Document.class, "stocks_ideas");
        StockIdea idea = null;
        if (d != null) {
            List<StockIdea> stocksIdeas = d.getList("stock_idea", Document.class).stream()
                    .map(StockIdea::convertFromDocument)
                    .toList();
            Optional<StockIdea> ideaOptional = stocksIdeas.stream().filter(s -> s.getId().equalsIgnoreCase(ideaId))
                    .findFirst();
            if (ideaOptional.isPresent()) {
                idea = ideaOptional.get();
                System.out.println("Deleting %s idea with id -> %s in mongo".formatted(symbol, ideaId));
            }
        }
        if (idea != null) {
            System.out.println(idea.toString());
            Update update = new Update().pull("stock_idea", idea.toDocument());
            mongo.updateFirst(query, update, "stocks_ideas");
            return true;
        }
        return false;
    }

    public boolean upsertUserRecentStockScreenerMongo(String symbol, String userId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));

        // check the symbol list in mongo
        List<Document> existedSymbolDocs = retrieveUserRecentStockScreenerMongo(userId);

        int totalDocsInMongo = 0;

        if (existedSymbolDocs != null) {

            totalDocsInMongo = existedSymbolDocs.size();
            // check for existing records match symbol
            for (Document doc : existedSymbolDocs) {
                String s = doc.getString("symbol");
                if (s.equals(symbol)) {
                    // remove the existing record
                    Update update = new Update().pull("symbol_searched", doc);
                    mongo.updateFirst(query, update, "stocks_screener");

                    totalDocsInMongo--;
                }
            }
        }

        Date insertedDate = new Date();
        long epochTime = insertedDate.getTime();
        Document d = new Document();
        d.append("symbol", symbol)
                .append("time", epochTime);

        Update udpateOps = new Update()
                .set("user_id", userId)
                .push("symbol_searched", d);

        UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "stocks_screener");

        // check whether length > 4
        if (totalDocsInMongo > 4) {
            // find the oldest search and removed
            List<Document> existedSymbolDocsLatest = retrieveUserRecentStockScreenerMongo(userId);
            List<Stock> stocks = existedSymbolDocsLatest.stream().map(Stock::convertStockScreenerFromDocument)
                    .toList();
            List<Stock> mutableStocks = new ArrayList<>(stocks);

            Collections.sort(mutableStocks, Comparator.comparingLong(Stock::getPurchasedDate).reversed());
            // Last doc
            Stock olderstStock = mutableStocks.get(mutableStocks.size() - 1);
            Document lastDoc = new Document();
            lastDoc.append("symbol", olderstStock.getSymbol());
            lastDoc.append("time", olderstStock.getPurchasedDate());

            // delete last doc from mongo
            Update update = new Update().pull("symbol_searched", lastDoc);
            mongo.updateFirst(query, update, "stocks_screener");
        }
        return true;
    }

    public List<Document> retrieveUserRecentStockScreenerMongo(String userId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "stocks_screener");
        if (d != null) {
            List<Document> stockDocs = d.getList("symbol_searched", Document.class);
            return stockDocs;
        }
        return null;
    }

    // NOTE EXTRA
    public Instant expirationDayInInstance() {
        LocalDate currDate = LocalDate.now();
        // System.out.println("currDate >>> " + currDate);

        LocalDateTime endOfDay = LocalDateTime.of(currDate, LocalTime.MAX);
        // System.out.println("endofDay >>> " + endOfDay);

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
