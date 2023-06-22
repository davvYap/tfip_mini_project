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

    public List<Category> getUserCategoryJdbc(String userId) {
        return transRepo.getUserCategoryJdbc(userId);
    }

    public List<Transaction> getUserTransactionsJdbc(String userId) {
        return transRepo.getUserTransactionsJdbc(userId);
    }
}
