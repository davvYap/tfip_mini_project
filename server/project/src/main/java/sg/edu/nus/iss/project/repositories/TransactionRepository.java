package sg.edu.nus.iss.project.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import sg.edu.nus.iss.project.models.Category;
import sg.edu.nus.iss.project.models.RegularTransaction;
import sg.edu.nus.iss.project.models.Transaction;

import static sg.edu.nus.iss.project.repositories.DBQueries.*;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

@Repository
public class TransactionRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int insertCategoryJdbc(String userId, String catName, String type) {
        return jdbcTemplate.update(SQL_INSERT_CATEGORY, userId, catName, type);
    }

    public List<Category> getUserCategoryJdbc(String userId) {
        List<Category> categories = new ArrayList<>();
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_ALL_CATEGORIES, userId);
        while (rs.next()) {
            categories.add(Category.convertFromResult(rs));
        }
        return categories;
    }

    public int editCategoryJdbc(String userId, int catId, String catName, String type) {
        return jdbcTemplate.update(SQL_EDIT_USER_CATEGORY, catName, type, catId, userId);
    }

    public List<Transaction> getUserTransactionsJdbc(String userId, int year) {
        List<Transaction> transactions = new LinkedList<>();
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_USER_TRANSACTIONS_BY_YEAR, userId, year);
        while (rs.next()) {
            transactions.add(Transaction.convertFromResult(rs));
        }
        return transactions;
    }

    public int getCategoryIdByCategoryNameJdbc(String userId, String categoryName) {
        String catName = categoryName + "%";
        System.out.println(catName);
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_CATEGORY_ID_BY_CATEGORY_NAME, userId, catName);
        while (rs.next()) {
            return rs.getInt("cat_id");
        }
        return 0;
    }

    public int insertTransactionJdbc(String userId, Transaction tran) {

        int catId = getCategoryIdByCategoryNameJdbc(userId, tran.getCategoryName());

        return jdbcTemplate.update(SQL_INSERT_USER_TRANSACTION, tran.getTransactionId(), tran.getTransactionName(),
                tran.getDate().toString(), tran.getAmount(), tran.getRemarks(), userId, catId);
    }

    public int deleteTransactionJdbc(String userId, String tranId, String catName) {
        int catId = getCategoryIdByCategoryNameJdbc(userId, catName);
        return jdbcTemplate.update(SQL_DELETE_USER_TRANSACATION, tranId, userId, catId);
    }

    public int updateTransactionJdbc(String userId, Transaction tran) {
        return jdbcTemplate.update(SQL_UDPATE_USER_TRANSACTION, tran.getTransactionName(), tran.getDate().toString(),
                tran.getAmount(), tran.getRemarks(), tran.getCategoryId(), userId, tran.getTransactionId());
    }

    public List<Transaction> geTransactionsBasedOnMonthAndYearJdbc(String userId, int month, int year) {
        List<Transaction> trans = new LinkedList<>();
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_USER_TRANSACTIONS_BASED_ON_YEAR, userId, month, year);
        while (rs.next()) {
            trans.add(Transaction.convertFromResult(rs));
        }
        return trans;
    }

    public List<Transaction> geTransactionsBasedOnDatesJdbc(String userId, String startDate, String endDate) {
        List<Transaction> trans = new LinkedList<>();
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_USER_TRANSACTIONS_BASED_ON_DATES, userId, startDate,
                endDate);
        while (rs.next()) {
            trans.add(Transaction.convertFromResult(rs));
        }
        return trans;
    }

    public List<Transaction> getUserAllTransactionsJdbc(String userId) {
        List<Transaction> trans = new LinkedList<>();
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_USER_TRANSACTIONS, userId);
        while (rs.next()) {
            trans.add(Transaction.convertFromResult(rs));
        }
        return trans;
    }

    public Transaction getUserTransactionBasedOnTransIdJdbc(String userId, String transId) {
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_USER_TRANSACTION_BASED_ON_TRANS_ID, userId, transId);
        Transaction tran = null;
        while (rs.next()) {
            tran = Transaction.convertFromResult(rs);
        }
        return tran;
    }

    public int insertRegularTransactionJdbc(String userId, String tranId, boolean active) {
        String regularTranId = UUID.randomUUID().toString().substring(0, 8);

        return jdbcTemplate.update(SQL_INSERT_USER_REGULAR_TRANSACTION, regularTranId, tranId, userId, active);
    }

    public List<RegularTransaction> getUserRegularTransactionsJdbc(String userId) {
        List<RegularTransaction> trans = new LinkedList<>();
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_USER_REGULAR_TRANSACTIONS, userId);
        while (rs.next()) {
            trans.add(RegularTransaction.convertFromResult(rs));
        }
        return trans;
    }

    public List<RegularTransaction> getAllRegularTransactionsJdbc() {
        List<RegularTransaction> trans = new LinkedList<>();
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_ALL_REGULAR_TRANSACTIONS);
        while (rs.next()) {
            trans.add(RegularTransaction.convertFromResult(rs));
        }
        return trans;
    }

    public int deleteUserRegularTransactionJdbc(String userId, String regTranId) {
        return jdbcTemplate.update(SQL_DELETE_USER_REGULAR_TRANSACTION, userId, regTranId);
    }

    public int toggleUserRegularTransactionActive(boolean active, String userId, String regTranId) {
        return jdbcTemplate.update(SQL_TOGGLE_USER_REGULAR_TRANSACTION_ACTIVE, active, userId, regTranId);
    }

}
