package sg.edu.nus.iss.project.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.servlet.http.HttpSession;
import sg.edu.nus.iss.project.services.LoginService;

@Controller
@CrossOrigin(origins = { "http://localhost:4200" }, allowCredentials = "true", allowedHeaders = "*")
@RequestMapping(path = "/api")
public class LoginController {

    @Autowired
    private LoginService loginSvc;

    @GetMapping(path = "/login")
    @ResponseBody
    public ResponseEntity<String> verifyLogin(@RequestParam String username, @RequestParam String password,
            HttpSession session) {

        Boolean isLogin = loginSvc.verifyLogin(username, password);
        session.setAttribute("isLogin", isLogin);
        // testSessionId(session);
        if (!isLogin) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("isLogin", isLogin).build().toString());
        }
        System.out.println("Login...");
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("isLogin", isLogin).build().toString());
    }

    // CHECK IF USER IS LOGIN
    @GetMapping(path = "/isLogin")
    @ResponseBody
    public ResponseEntity<String> isLogin(HttpSession session) {

        // testSessionId(session);
        System.out.println("Check login...");
        Boolean isLogin = (Boolean) session.getAttribute("isLogin");
        System.out.println("username from /api/isLogin >>> " + isLogin);
        if (isLogin == null) {
            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("isLogin", false).build().toString());
        }

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("isLogin", isLogin).build().toString());

    }

    @GetMapping(path = "/logout")
    @ResponseBody
    public ResponseEntity<String> logout(HttpSession session) {

        System.out.println("Logout...");
        // testSessionId(session);

        session.invalidate();
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("isLogin", false).build().toString());
    }

    private void testSessionId(HttpSession session) {
        System.out.println("session id >>> " + session.getId());
        System.out.println("creation time >>> " + session.getCreationTime());
        System.out.println("session max inactive interval >>> " + session.getMaxInactiveInterval());
    }
}
