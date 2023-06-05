package sg.edu.nus.iss.project.repositories;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import sg.edu.nus.iss.project.models.UserStock;

@Repository
public class UserRepository {

    @Autowired
    private MongoTemplate mongo;

    public Boolean insertUserStocks(UserStock userStock) {
        Document doc = userStock.toDocument();
        Document insertedDoc = mongo.insert(doc, "stocks");
        return !insertedDoc.isEmpty();
    }
}
