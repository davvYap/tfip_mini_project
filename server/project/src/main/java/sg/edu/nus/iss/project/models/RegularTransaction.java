package sg.edu.nus.iss.project.models;

import org.springframework.jdbc.support.rowset.SqlRowSet;

import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;

public class RegularTransaction {

    private String regularTranId;
    private String userId;
    private String tranId;
    private boolean active;

    public String getRegularTranId() {
        return regularTranId;
    }

    public void setRegularTranId(String regularTranId) {
        this.regularTranId = regularTranId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTranId() {
        return tranId;
    }

    public void setTranId(String tranId) {
        this.tranId = tranId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public String toString() {
        return "RegularTransaction [regularTranId=" + regularTranId + ", userId=" + userId + ", tranId=" + tranId
                + ", active=" + active + "]";
    }

    public static RegularTransaction convertFromResult(SqlRowSet rs) {
        RegularTransaction tran = new RegularTransaction();
        tran.setRegularTranId(rs.getString("regular_trans_id"));
        tran.setTranId(rs.getString("trans_id"));
        tran.setUserId(rs.getString("user_id"));
        tran.setActive(rs.getBoolean("active"));
        return tran;
    }

    public JsonObjectBuilder toJsonObjectBuilder() {
        return Json.createObjectBuilder()
                .add("regularTranId", regularTranId)
                .add("userId", userId)
                .add("tranId", tranId)
                .add("active", active);
    }

}
