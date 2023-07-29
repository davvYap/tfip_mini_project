package sg.edu.nus.iss.project.controllers;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.servlet.http.HttpSession;
import sg.edu.nus.iss.project.Security.JwtService;
import sg.edu.nus.iss.project.models.Quote;
import sg.edu.nus.iss.project.models.User;
import sg.edu.nus.iss.project.models.UserPrincipal;
import sg.edu.nus.iss.project.services.LoginService;
import sg.edu.nus.iss.project.utils.gmail.GMailer;

@Controller
@CrossOrigin(origins = {
		"https://afmapp-tfip-production.up.railway.app", "https://amapp.up.railway.app",
		"http://localhost:4200" })
@RequestMapping(path = "/api")
public class LoginController {

	@Autowired
	private LoginService loginSvc;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private AuthenticationManager authManager;

	@PostMapping(path = "/auth/login")
	@ResponseBody
	public ResponseEntity<String> verifyLogin(@RequestBody String request) throws Exception {

		User authUser = User.convertFromJsonStringAuth(request);
		String username = authUser.getUsername();
		String password = authUser.getPassword();
		System.out.println("User login : " + username);
		User user = loginSvc.verifyLogin(username, password);

		if (user == null) {
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

		if (!user.getUsername().equals(username) ||
				!user.getPassword().equals(password)) {
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

		// Authentication authentication = authManager
		// .authenticate(new UsernamePasswordAuthenticationToken(username, password));

		// UserPrincipal up = (UserPrincipal) authentication.getPrincipal();
		// // At this stage, the user already authenticated
		// System.out.println("authenticated user principal : " + up);
		// User u = loginSvc.findUserByUsername(username).get();
		// UserPrincipal userPrincipal = UserPrincipal.convertFromUserClass(u);
		// String jwtToken = jwtService.generateToken(userPrincipal);

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
						.add("profileIcon", profileIconBase64)
						.add("firstname", user.getFirstname())
						.add("lastname", user.getLastname())
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
}
