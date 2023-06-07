package sg.edu.nus.iss.project.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.project.models.Stock;
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

    public boolean upsertUserStocks(String userId, Stock stock) {
        return userRepo.upsertUserStocks(userId, stock);
    }

    public List<Stock> retrieveUserStocks(String userId, int limit, int skip) {
        return userRepo.retrieveUserStocks(userId, limit, skip);
    }
}
