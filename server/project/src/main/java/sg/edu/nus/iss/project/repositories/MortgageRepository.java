package sg.edu.nus.iss.project.repositories;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import com.mongodb.client.result.UpdateResult;

import sg.edu.nus.iss.project.models.MortgagePortfolio;
import sg.edu.nus.iss.project.models.Transaction;

import static sg.edu.nus.iss.project.repositories.DBQueries.*;

@Repository
public class MortgageRepository {

    @Autowired
    private MongoTemplate mongo;

    @Autowired
    private JdbcTemplate jdbc;

    public Boolean upsertUserMortgagePortfolioMongo(String userId, MortgagePortfolio mp) {

        // check if duplicate id
        List<MortgagePortfolio> mpList = retrieveUserMortgagePortfolioMongo(userId);
        if (mpList != null) {
            Optional<MortgagePortfolio> mpOptional = mpList.stream().filter(m -> m.getId().equals(mp.getId()))
                    .findAny();
            if (mpOptional.isPresent()) {
                return false;
            }
        }

        Query query = Query.query(Criteria.where("user_id").is(userId));
        Update udpateOps = new Update()
                .set("user_id", userId)
                .push("mortgage_portfolio", mp.toDocument());

        UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "mortgages");
        return true;
    }

    public List<MortgagePortfolio> retrieveUserMortgagePortfolioMongo(String userId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "mortgages");

        if (d != null) {
            List<MortgagePortfolio> mortgages = d.getList("mortgage_portfolio", Document.class).stream()
                    .map(MortgagePortfolio::convertFromDocument)
                    .toList();
            return mortgages;
        }
        return null;
    }

    public boolean deleteUserMortgagePortfolioMongo(String userId, String mortgageId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "mortgages");
        MortgagePortfolio mp = null;
        if (d != null) {
            List<MortgagePortfolio> mpList = d.getList("mortgage_portfolio", Document.class).stream()
                    .map(MortgagePortfolio::convertFromDocument)
                    .toList();
            Optional<MortgagePortfolio> mpOpt = mpList.stream().filter(m -> m.getId().equals(mortgageId)).findFirst();
            if (mpOpt.isPresent()) {
                mp = mpOpt.get();
            }
        }
        if (mp != null) {
            System.out.println("Deleting mortgage with mortgageId -> %s in mongo".formatted(mortgageId));
            Update update = new Update().pull("mortgage_portfolio", mp.toDocument());
            mongo.updateFirst(query, update, "mortgages");
            return true;
        }
        return false;
    }

    public List<Transaction> getUserMortagageTransactionJdbc(String userId, String remarks) {
        List<Transaction> trans = new LinkedList<>();
        String concatRemarks = remarks + "%";
        SqlRowSet rs = jdbc.queryForRowSet(SQL_GET_USER_TRANSACTIONS_BASED_ON_REMARKS, userId, concatRemarks);
        while (rs.next()) {
            trans.add(Transaction.convertFromResultsNoJoin(rs));
        }
        return trans;
    }

    public int deleteUserMortgageTransactionsJdbc(String userId, String remarks) {

        List<Transaction> mortTrans = getUserMortagageTransactionJdbc(userId, remarks);
        int totalDeleteAmount = 0;
        if (mortTrans.size() > 0) {
            for (Transaction transaction : mortTrans) {
                totalDeleteAmount += jdbc.update(SQL_DELETE_USER_TRANSACATION, transaction.getTransactionId(), userId,
                        transaction.getCategoryId());
            }
        }
        return totalDeleteAmount;
    }

}
