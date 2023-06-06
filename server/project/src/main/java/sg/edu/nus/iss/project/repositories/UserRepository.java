package sg.edu.nus.iss.project.repositories;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.mongodb.client.result.UpdateResult;

import sg.edu.nus.iss.project.models.Stock;

@Repository
public class UserRepository {

    @Autowired
    private MongoTemplate mongo;

    public Boolean upsertUserTheme(String userId, String themeName) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Update udpateOps = new Update()
                .set("user_id", userId)
                .set("theme_name", themeName);
        UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "user_theme");
        return upsertDoc.getModifiedCount() > 0;
    }

    public String retrieveUserTheme(String userId) {
        Query query = Query.query(Criteria.where("user_id").is(userId));
        Document d = mongo.findOne(query, Document.class, "user_theme");
        if (d == null) {
            return "viva-dark";
        }
        return d.getString("theme_name");
    }

    public Boolean upsertUserStocks(String userId, Stock stock) {

        Query query = Query.query(Criteria.where("user_id").is(userId));
        Update udpateOps = new Update()
                .set("user_id", userId)
                .push("stocks", stock);

        UpdateResult upsertDoc = mongo.upsert(query, udpateOps, "stocks");
        return upsertDoc.getModifiedCount() > 0;
    }
}
