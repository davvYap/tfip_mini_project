package sg.edu.nus.iss.project.services;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import sg.edu.nus.iss.project.models.User;
import sg.edu.nus.iss.project.models.UserPrincipal;
import sg.edu.nus.iss.project.repositories.LoginRepository;

@Service
public class UserInfoUserDetailsService implements UserDetailsService {

    @Autowired
    LoginRepository loginRepo;

    private static final Logger logger = LoggerFactory.getLogger(UserInfoUserDetailsService.class);

    @Override
    public UserPrincipal loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Looking for user %s".formatted(username));
        Optional<User> userOpt = loginRepo.findUserByUsername(username);
        if (userOpt.isEmpty()) {
            throw new UsernameNotFoundException("Username %s not found".formatted(username));
        }
        User u = userOpt.get();
        logger.debug("Stored password: {}", u.getPassword());

        UserPrincipal up = UserPrincipal.convertFromUserClass(u);
        System.out.println("User principal : " + up.toString());
        return up;
    }
}
