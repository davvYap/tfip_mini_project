package sg.edu.nus.iss.project.controllers;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import sg.edu.nus.iss.project.services.LoginService;

@Controller
@CrossOrigin(origins = "*")
@RequestMapping(path = "/api")
public class LoginController {

    @Autowired
    private LoginService loginSvc;

    @GetMapping(path = "/login")
    @ResponseBody
    public ResponseEntity<String> verifyLogin(@RequestParam String username, @RequestParam String password) {
        boolean isLogin = loginSvc.verifyLogin(username, password);

        if (!isLogin) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("isLogin", isLogin).build().toString());
        }

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("isLogin", isLogin).build().toString());
    }
}
