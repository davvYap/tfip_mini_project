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

    public static final String SQL_GET_CATEGORY_ID_BY_CATEGORY_NAME = """
            select cat_id from categories where user_id = ? and cat_name like ?;
            """;

    public static final String SQL_GET_USER_TRANSACTIONS_BY_YEAR = """
            select trans_id, trans_name, date_of_trans, amount, remarks, t.cat_id, c.cat_name,
            c.type from transactions t join categories c on t.cat_id = c.cat_id where t.user_id  = ? and year(date_of_trans) = ?;
                """;

    public static final String SQL_INSERT_USER_TRANSACTION = """
            insert into transactions(trans_id, trans_name, date_of_trans, amount, remarks, user_id, cat_id)
            values (?, ?, ?, ?, ?, ?, ?);
                            """;

    public static final String SQL_DELETE_USER_TRANSACATION = """
            delete from transactions where trans_id = ? and user_id = ? and cat_id = ?;
            """;

    public static final String SQL_UDPATE_USER_TRANSACTION = """
            update transactions set trans_name = ?, date_of_trans = ?, amount = ?, remarks = ?, cat_id = ? where user_id = ? and trans_id = ?;
            """;

    public static final String SQL_GET_USER_TRANSACTIONS_BASED_ON_DATE = """
            select trans_id, trans_name, date_of_trans, amount, remarks, t.cat_id, c.cat_name, c.type from transactions t join categories c on t.cat_id = c.cat_id
            where t.user_id  = ? and month(date_of_trans) = ? and year(date_of_trans) = ?;
                                        """;
}
