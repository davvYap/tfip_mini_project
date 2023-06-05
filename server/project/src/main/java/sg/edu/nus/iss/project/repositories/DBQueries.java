package sg.edu.nus.iss.project.repositories;

public class DBQueries {

    public static final String SQL_VERIFY_LOGIN = """
            select * from users where username = ? and password = ?
            """;
}
