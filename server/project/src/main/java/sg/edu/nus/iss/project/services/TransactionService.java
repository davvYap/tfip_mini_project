package sg.edu.nus.iss.project.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sg.edu.nus.iss.project.models.Category;
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
}
