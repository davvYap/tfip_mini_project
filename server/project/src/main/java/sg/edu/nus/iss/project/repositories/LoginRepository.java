package sg.edu.nus.iss.project.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import sg.edu.nus.iss.project.models.User;

import static sg.edu.nus.iss.project.repositories.DBQueries.*;

import java.sql.ResultSet;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Optional;

@Repository
public class LoginRepository {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    @Qualifier("user_portfolio")
    private RedisTemplate<String, String> redis;

    public User verifyLogin(String username, String password) {
        SqlRowSet rs = jdbc.queryForRowSet(SQL_VERIFY_LOGIN, username, password);

        while (rs.next()) {
            return User.convertFromResult(rs);
        }

        return null;
    }

    public Optional<User> findUserByUsername(String username) {
        SqlRowSet rs = jdbc.queryForRowSet(SQL_GET_USER_BY_USERNAME, username);

        while (rs.next()) {
            User u = User.convertFromResult(rs);
            return Optional.of(u);
        }

        return Optional.empty();
    }

    public Optional<byte[]> getUserProfileIcon(String userId) {
        Optional<byte[]> profileIconOpt = jdbc.query(SQL_GET_USER_PROFILE_ICON, (ResultSet rs) -> {
            if (!rs.next()) {
                return Optional.empty();
            }
            byte[] profileIcon = rs.getBytes("profile_pic");
            if (profileIcon == null) {
                return Optional.empty();
            }
            return Optional.of(profileIcon);
        }, userId);
        return profileIconOpt;
    }

    public void saveQuoteOfTheDayRedis(String quote) {
        redis.opsForValue().set("quote", quote);
        redis.expireAt("quote", expirationDayInInstance());
        System.out.println("Save quote of the day");
    }

    public String getQuoteOfTheDayRedis() {
        return redis.opsForValue().get("quote");
    }

    // EXTRA
    public Instant expirationDayInInstance() {
        LocalDate currDate = LocalDate.now();
        // System.out.println("currDate >>> " + currDate);

        LocalDateTime endOfDay = LocalDateTime.of(currDate, LocalTime.MAX);
        // System.out.println("endofDay >>> " + endOfDay);

        Instant endOfDayInstant = endOfDay.atZone(ZoneId.systemDefault()).toInstant();

        return endOfDayInstant;
    }

}
