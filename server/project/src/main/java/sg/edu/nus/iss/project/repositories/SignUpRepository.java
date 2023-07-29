package sg.edu.nus.iss.project.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import static sg.edu.nus.iss.project.repositories.DBQueries.*;

import java.io.InputStream;

import sg.edu.nus.iss.project.models.User;

@Repository
public class SignUpRepository {
    @Autowired
    private JdbcTemplate jdbc;

    public boolean newUserSignUp(User user, InputStream profileIcon) {
        int rowAffected = jdbc.update(SQL_NEW_USER_SIGNUP, user.getUserId(), user.getUsername(), user.getPassword(),
                user.getEmail(),
                user.getFirstname(), user.getLastname(), profileIcon);
        return rowAffected > 0;
    }

    public boolean checkUsernameDuplicate(String username) {
        SqlRowSet rs = jdbc.queryForRowSet(SQL_CHECK_USERNAME_DUPLICATE, username);
        while (rs.next()) {
            System.out.println(rs.getString("user_id"));
            if (rs.getString("user_id") != null) {
                return true;
            }
        }
        return false;
    }

    public boolean checkUserExists(String email) {
        SqlRowSet rs = jdbc.queryForRowSet(SQL_CHECK_USER_EXISTS, email);
        while (rs.next()) {
            System.out.println(rs.getString("user_id"));
            if (rs.getString("user_id") != null) {
                return true;
            }
        }
        return false;
    }

    public boolean checkGoogleUserExists(String googleId) {
        SqlRowSet rs = jdbc.queryForRowSet(SQL_CHECK_GOOGLE_USER_EXISTS, googleId);
        while (rs.next()) {
            System.out.println(rs.getString("user_id"));
            if (rs.getString("user_id") != null) {
                return true;
            }
        }
        return false;
    }

    public boolean newGoogleUserSignUp(User user) {
        int rowAffected = jdbc.update(SQL_NEW_GOOGLE_USER_SIGNUP, user.getUserId(), user.getUsername(),
                user.getPassword(),
                user.getEmail(),
                user.getFirstname(), user.getLastname());
        return rowAffected > 0;
    }

    public User retrieveUserProfile(String userId) {
        SqlRowSet rs = jdbc.queryForRowSet(SQL_GET_USER_BY_USERID, userId);
        User user = null;
        while (rs.next()) {
            user = User.convertFromResult(rs);
        }
        return user;
    }

    public boolean editUserProfile(User user, InputStream profileIcon) {
        int rowAffected = jdbc.update(SQL_EDIT_USER_PROFILE, user.getFirstname(), user.getLastname(), user.getEmail(),
                user.getUsername(), user.getPassword(), profileIcon, user.getUserId());
        return rowAffected > 0;
    }
}
