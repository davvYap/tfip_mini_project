package sg.edu.nus.iss.project.controllers;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.servlet.http.HttpSession;
import sg.edu.nus.iss.project.models.Quote;
import sg.edu.nus.iss.project.models.User;
import sg.edu.nus.iss.project.services.LoginService;
import sg.edu.nus.iss.project.utils.gmail.GMailer;

@Controller
@CrossOrigin(origins = { "http://localhost:4200" }, allowCredentials = "true", allowedHeaders = "*")
@RequestMapping(path = "/api")
public class LoginController {

	@Autowired
	private LoginService loginSvc;

	@GetMapping(path = "/login")
	@ResponseBody
	public ResponseEntity<String> verifyLogin(@RequestParam String username, @RequestParam String password,
			HttpSession session) throws Exception {

		User user = loginSvc.verifyLogin(username, password);
		if (user == null) {
			session.setAttribute("isLogin", false);
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("isLogin", false)
							.add("userId", "guest000")
							.add("username", "guest")
							.add("firstname", "guest")
							.add("lastname", "")
							.add("profileIcon", "")
							.build().toString());
		}
		session.setAttribute("isLogin", true);
		session.setAttribute("user", user);
		// testSessionId(session);
		System.out.println("Login...");
		// GMailer gmailer = new GMailer();
		// gmailer.sendMail("Sign Up Successful", """
		// Dear %s,

		// Thank you for signing up to Assets Management Application ! Begin your
		// journey with us.

		// Best Regards,
		// am.app Developer Team
		// """.formatted(username));

		// GET USER PROFILE ICON
		String profileIconBase64 = loginSvc.getUserProfileIcon(user.getUserId());
		if (profileIconBase64 == null) {
			profileIconBase64 = "";
		}

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createObjectBuilder()
						.add("isLogin", true)
						.add("userId", user.getUserId())
						.add("username", user.getUsername())
						.add("firstname", user.getFirstname())
						.add("lastname", user.getLastname())
						.add("profileIcon", profileIconBase64)
						.build().toString());
	}

	// CHECK IF USER IS LOGIN
	@GetMapping(path = "/isLogin")
	@ResponseBody
	public ResponseEntity<String> isLogin(HttpSession session) {

		// testSessionId(session);
		System.out.println("Check login...");
		Boolean isLogin = (Boolean) session.getAttribute("isLogin");
		User user = (User) session.getAttribute("user");
		System.out.println("username from /api/isLogin >>> " + isLogin);
		if (isLogin == null || user == null) {
			return ResponseEntity.status(HttpStatus.OK)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("isLogin", false)
							.add("userId", "guest000")
							.build().toString());
		}

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createObjectBuilder()
						.add("isLogin", isLogin)
						.add("userId", user.getUserId())
						.build().toString());

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

	@GetMapping(path = "/quote")
	@ResponseBody
	public ResponseEntity<String> getQuoteOfTheDay() throws IOException {
		String quote = loginSvc.getQuoteOfTheDayRedis();
		if (quote == null) {
			System.out.println("Calling quote API...");
			ResponseEntity<String> responseEntity = loginSvc.getQuoteOfTheDay();
			String body = responseEntity.getBody();
			Quote q = Quote.convertFromJsonString(body);
			// SAVE TO REDIS
			loginSvc.saveQuoteOfTheDayRedis(q.getQ());
			return responseEntity;
		}
		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createArrayBuilder().add(Json.createObjectBuilder().add("q", quote)).build().toString());
	}

	// EXTRA
	private void testSessionId(HttpSession session) {
		System.out.println("session id >>> " + session.getId());
		System.out.println("creation time >>> " + session.getCreationTime());
		System.out.println("session max inactive interval >>> " + session.getMaxInactiveInterval());
	}
}
