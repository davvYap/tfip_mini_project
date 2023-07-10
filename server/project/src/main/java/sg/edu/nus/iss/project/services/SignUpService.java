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

    public boolean checkGoogleUserExists(String userId) {
        return signUpRepo.checkGoogleUserExists(userId);
    }

    public boolean newGoogleUserSignUp(User user) {
        return signUpRepo.newGoogleUserSignUp(user);
    }

    public User retrieveUserProfile(String userId) {
        return signUpRepo.retrieveUserProfile(userId);
    }

    public boolean editUserProfile(User user, InputStream profileIcon) {
        return signUpRepo.editUserProfile(user, profileIcon);
    }
}
