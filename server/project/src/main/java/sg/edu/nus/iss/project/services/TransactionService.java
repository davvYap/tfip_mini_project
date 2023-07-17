package sg.edu.nus.iss.project.services;

import java.time.LocalDate;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sg.edu.nus.iss.project.models.Category;
import sg.edu.nus.iss.project.models.RegularTransaction;
import sg.edu.nus.iss.project.models.Transaction;
import sg.edu.nus.iss.project.repositories.TransactionRepository;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transRepo;

    @Transactional(rollbackFor = Exception.class)
    public int insertCategoryJdbc(String userId, String catName, String type) {
        return transRepo.insertCategoryJdbc(userId, catName, type);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<Category> getUserCategoryJdbc(String userId) {
        return transRepo.getUserCategoryJdbc(userId);
    }

    @Transactional(rollbackFor = Exception.class)
    public int editCategoryJdbc(String userId, int catId, String catName, String type) {
        return transRepo.editCategoryJdbc(userId, catId, catName, type);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<Transaction> getUserTransactionsJdbc(String userId, int year) {
        return transRepo.getUserTransactionsJdbc(userId, year);
    }

    @Transactional(rollbackFor = Exception.class)
    public int getCategoryIdByCategoryNameJdbc(String userId, String categoryName) {
        return transRepo.getCategoryIdByCategoryNameJdbc(userId, categoryName);
    }

    @Transactional(rollbackFor = Exception.class)
    public int insertTransactionJdbc(String userId, Transaction tran) {
        return transRepo.insertTransactionJdbc(userId, tran);
    }

    @Transactional(rollbackFor = Exception.class)
    public int deleteTransactionJdbc(String userId, String tranId, String catName) {
        return transRepo.deleteTransactionJdbc(userId, tranId, catName);
    }

    @Transactional(rollbackFor = Exception.class)
    public int updateTransactionJdbc(String userId, Transaction tran) {
        return transRepo.updateTransactionJdbc(userId, tran);
    }

    public List<Transaction> geTransactionsBasedOnMonthAndYearJdbc(String userId, int month, int year) {
        return transRepo.geTransactionsBasedOnMonthAndYearJdbc(userId, month, year);
    }

    public List<Transaction> geTransactionsBasedOnDatesJdbc(String userId, String startDate, String endDate) {
        return transRepo.geTransactionsBasedOnDatesJdbc(userId, startDate, endDate);
    }

    public List<Transaction> getUserAllTransactionsJdbc(String userId) {
        return transRepo.getUserAllTransactionsJdbc(userId);
    }

    public Transaction getUserTransactionBasedOnTransIdJdbc(String userId, String transId) {
        return transRepo.getUserTransactionBasedOnTransIdJdbc(userId, transId);
    }

    public int insertRegularTransactionJdbc(String userId, String tranId, boolean active) {
        return transRepo.insertRegularTransactionJdbc(userId, tranId, active);
    }

    public List<RegularTransaction> getUserRegularTransactionsJdbc(String userId) {
        return transRepo.getUserRegularTransactionsJdbc(userId);
    }

    public List<RegularTransaction> getAllRegularTransactionsJdbc() {
        return transRepo.getAllRegularTransactionsJdbc();
    }

    public int deleteUserRegularTransactionJdbc(String userId, String regTranId) {
        return transRepo.deleteUserRegularTransactionJdbc(userId, regTranId);
    }

    public int toggleUserRegularTransactionActive(boolean active, String userId, String regTranId) {
        return transRepo.toggleUserRegularTransactionActive(active, userId, regTranId);
    }

    @Scheduled(cron = "0 0 0 1 * *")
    public void executeInsertRegularTransactionsTask() {
        System.out.println("Executing regular transactions insertion task on the 17th of the month...");
        List<RegularTransaction> regularTrans = getAllRegularTransactionsJdbc();

        // only look for those which is active
        List<RegularTransaction> activeRegularTrans = regularTrans.stream().filter(t -> t.isActive() == true).toList();

        int totalInserted = 0;
        for (RegularTransaction regTran : activeRegularTrans) {
            Transaction tran = getUserTransactionBasedOnTransIdJdbc(regTran.getUserId(), regTran.getTranId());
            if (tran != null) {
                // update transaction date month to current month
                LocalDate oldDate = tran.getDate();
                LocalDate newDate = oldDate.withMonth(LocalDate.now().getMonthValue());
                tran.setDate(newDate);

                // get new transaction ID
                tran.setTransactionId(UUID.randomUUID().toString().substring(0, 8));

                // add to each user transaction repo
                totalInserted += insertTransactionJdbc(regTran.getUserId(), tran);
            }
        }
        System.out
                .println("Executed regular transactions insertion task , total inserted > %d".formatted(totalInserted));
    }
}
