package sg.edu.nus.iss.project.services;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.project.models.User;
import sg.edu.nus.iss.project.repositories.SignUpRepository;

@Service
public class SignUpService {

    @Autowired
    private SignUpRepository signUpRepo;

    public boolean newUserSignUp(User user, InputStream profileIcon) {
        return signUpRepo.newUserSignUp(user, profileIcon);
    }

    public boolean checkUserExists(String email) {
        return signUpRepo.checkUserExists(email);
    }
}