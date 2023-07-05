package sg.edu.nus.iss.project.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import static sg.edu.nus.iss.project.repositories.DBQueries.*;

import java.io.InputStream;
import java.util.UUID;

import sg.edu.nus.iss.project.models.User;

@Repository
public class SignUpRepository {
    @Autowired
    private JdbcTemplate jdbc;

    public boolean newUserSignUp(User user, InputStream profileIcon) {

        String userId = UUID.randomUUID().toString().substring(0, 8);
        int rowAffected = jdbc.update(SQL_NEW_USER_SIGNUP, userId, user.getUsername(), user.getPassword(),
                user.getEmail(),
                user.getFirstname(), user.getLastname(), profileIcon);
        return rowAffected > 0;
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

}
