package sg.edu.nus.iss.project.repositories;

public class DBQueries {

    public static final String SQL_VERIFY_LOGIN = """
            select * from users where username = ? and password = ?
            """;

    public static final String SQL_INSERT_CATEGORY = """
            insert into categories(user_id, cat_name, type) values (?,?,?);
            """;

    public static final String SQL_GET_ALL_CATEGORIES = """
            select * from categories where user_id = ?
            """;
}
