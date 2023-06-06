package sg.edu.nus.iss.project.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.project.repositories.LoginRepository;

@Service
public class LoginService {
    @Autowired
    private LoginRepository loginRepo;

    public String verifyLogin(String username, String password) {
        return loginRepo.verifyLogin(username, password);
    }
}
