package sg.edu.nus.iss.project.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.project.models.UserStock;
import sg.edu.nus.iss.project.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    public boolean insertUserStocks(UserStock userStock) {
        return userRepo.insertUserStocks(userStock);
    }
}
