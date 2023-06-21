package sg.edu.nus.iss.project.repositories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import sg.edu.nus.iss.project.models.Category;

import static sg.edu.nus.iss.project.repositories.DBQueries.*;

import java.util.ArrayList;
import java.util.List;

@Repository
public class TransactionRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int insertCategoryJdbc(String userId, String catName, String type) {
        return jdbcTemplate.update(SQL_INSERT_CATEGORY, userId, catName, type);
    }

    public List<Category> getUserCategoryJdbc(String userId) {
        List<Category> categories = new ArrayList<>();
        SqlRowSet rs = jdbcTemplate.queryForRowSet(SQL_GET_ALL_CATEGORIES, userId);
        while (rs.next()) {
            categories.add(Category.convertFromResult(rs));
        }
        return categories;
    }
}
