package sg.edu.nus.iss.project.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import static sg.edu.nus.iss.project.repositories.DBQueries.*;

@Repository
public class LoginRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String verifyLogin(String username, String password) {
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_VERIFY_LOGIN, username, password);

        while (rs.next()) {
            return rs.getString("user_id");
        }

        return null;
    }

}
