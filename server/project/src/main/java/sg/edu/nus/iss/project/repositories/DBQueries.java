package sg.edu.nus.iss.project.repositories;

public class DBQueries {

    public static final String SQL_VERIFY_LOGIN = """
            select * from users where username = ? and password = ?
            """;

    public static final String SQL_GET_ALL_USERS = """
            select user_id from users;
            """;

    public static final String SQL_INSERT_CATEGORY = """
            insert into categories(user_id, cat_name, type) values (?,?,?);
            """;

    public static final String SQL_GET_ALL_CATEGORIES = """
            select * from categories where user_id = ?
            """;

    public static final String SQL_GET_USER_TRANSACTIONS = """
            select trans_id, trans_name, date_of_trans, amount, remarks, t.cat_id, c.cat_name,
            c.type from transactions t join categories c on t.cat_id = c.cat_id where t.user_id  = ?;
                """;
}
