package sg.edu.nus.iss.project.controllers;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import jakarta.json.Json;
import jakarta.servlet.http.HttpSession;
import sg.edu.nus.iss.project.models.User;
import sg.edu.nus.iss.project.services.EmailSenderService;
import sg.edu.nus.iss.project.services.SignUpService;
import sg.edu.nus.iss.project.utils.gmail.GMailer;

@Controller
@CrossOrigin(origins = {
        "https://afmapp-tfip-production.up.railway.app", "https://amapp.up.railway.app",
        "http://localhost:4200" }, allowCredentials = "true", allowedHeaders = "*")
@RequestMapping(path = "/api")
public class SignUpController {

    @Autowired
    private SignUpService signUpSvc;

    @Autowired
    private EmailSenderService emailSenderSvc;

    @GetMapping(path = "/sign_up/captcha")
    @ResponseBody
    public ResponseEntity<String> generateCaptcha(HttpSession session, @RequestParam String username,
            @RequestParam String email) throws Exception {

        // CHECK IF DUPLICATE USERNAME
        boolean duplicateUsername = signUpSvc.checkUsernameDuplicate(username);
        if (duplicateUsername) {
            System.out.println("Duplicate username >>> " + username);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Username exists, please pick others.").build()
                            .toString());
        }

        // CHECK IF USER EXISTS
        boolean userExists = signUpSvc.checkUserExists(email);
        System.out.println("User exits >>> " + userExists);
        if (userExists) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "User email exists").build()
                            .toString());
        }

        String captcha = UUID.randomUUID().toString().substring(0, 6);
        session.setAttribute("captcha", captcha.toUpperCase());
        emailSenderSvc.sendHtmlMail(email, "Registration Code", """
                Dear %s,

                This is your 6-digit registration code: <h1>%s</h1>

                Best Regards,
                am.app Development Team
                """.formatted(username, captcha.toUpperCase()));

        // GMailer gmailer = new GMailer();
        // gmailer.sendMail(email, "Registration Code", """
        // Dear %s,

        // This is your 6-digit registration code: %s

        // Best Regards,
        // am.app Development Team
        // """.formatted(username, captcha.toUpperCase()));
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder().add("message", "Captcha sent to email").build()
                        .toString());
    }

    @PostMapping(path = "/sign_up", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<String> newUserSignUp(@RequestPart String username, @RequestPart String password,
            @RequestPart String firstname, @RequestPart String lastname, @RequestPart String email,
            @RequestPart MultipartFile file, @RequestPart String captcha, HttpSession session)
            throws Exception {

        String sessionCaptcha = (String) session.getAttribute("captcha");
        if (!sessionCaptcha.equals(captcha)) {
            System.out.println("wrong captcha");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Wrong registration code.")
                            .build().toString());
        }

        try {
            User user = new User(username, password, email, firstname, lastname);
            boolean userEmailExists = signUpSvc.checkUserExists(email);
            if (userEmailExists) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder().add("message", "User email exists")
                                .build().toString());
            }
            InputStream is = file.getInputStream();
            boolean status = signUpSvc.newUserSignUp(user, is);

            if (!status) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder().add("message", "Sign up unsuccessful.")
                                .build().toString());
            }

            emailSenderSvc.sendMail(email, "Welcome to am.app", """
                    Dear %s,

                    Thank you for signing up with us. Have a great journey ahead.

                    For enquiries, please contact: +612-3456789

                    Best Regards,
                    am.app Development Team
                    """.formatted(username));

            // GMailer gMailer = new GMailer();
            // gMailer.sendMail(email, "Welcome to am.app", """
            // Dear %s,

            // Thank you for signing up with us. Have a great journey ahead.

            // For enquiries, please contact: +612-3456789

            // Best Regards,
            // am.app Development Team
            // """.formatted(username));

            return ResponseEntity.status(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Sign up successful.").build()
                            .toString());

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "Sign up unsuccessful.").build()
                            .toString());
        }
    }

    @PostMapping(path = "/google_user_sign_in")
    @ResponseBody
    public ResponseEntity<String> googleUserSignIn(@RequestBody String userJson) throws Exception {
        try {
            System.out.println("Google user sign in: " + userJson.toString());
            User googleUser = User.convertFromJsonStringGoogleUser(userJson);
            boolean googleUserExists = signUpSvc.checkGoogleUserExists(googleUser.getUserId());
            if (googleUserExists) {
                return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder().add("message", "Google user exists")
                                .build().toString());
            }
            boolean userEmailExists = signUpSvc.checkUserExists(googleUser.getEmail());
            if (userEmailExists) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder().add("message", "User email exists")
                                .build().toString());
            }
            boolean googleUserSignUp = signUpSvc.newGoogleUserSignUp(googleUser);
            if (!googleUserSignUp) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("message", "Google user sign up unsuccessful.")
                                .build()
                                .toString());
            }

            emailSenderSvc.sendMail(googleUser.getEmail(), "Welcome to am.app", """
                    Dear %s,

                    Thank you for signing up with us. Have a great journey ahead.

                    For enquiries, please contact: +612-3456789

                    Best Regards,
                    am.app Development Team
                    """.formatted(googleUser.getUsername()));
            // GMailer gMailer = new GMailer();
            // gMailer.sendMail(googleUser.getEmail(), "Welcome to am.app", """
            // Dear %s,

            // Thank you for signing up with us. Have a great journey ahead.

            // For enquiries, please contact: +612-3456789

            // Best Regards,
            // am.app Development Team
            // """.formatted(googleUser.getUsername()));
            return ResponseEntity.status(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Google user sign up successful.").build()
                            .toString());
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Google user sign up unsuccessful.").build()
                            .toString());
        }
    }

    @GetMapping(path = "/{userId}/user_profile")
    @ResponseBody
    public ResponseEntity<String> getUserProfile(@PathVariable String userId) {
        User user = signUpSvc.retrieveUserProfile(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "User not found.").build()
                            .toString());
        }
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON)
                .body(user.toJsonBuilder().build().toString());
    }

    @PutMapping(path = "/{userId}/edit_profile")
    @ResponseBody
    public ResponseEntity<String> editUserProfile(@PathVariable String userId, @RequestPart String username,
            @RequestPart String password,
            @RequestPart String firstname, @RequestPart String lastname, @RequestPart String email,
            @RequestPart MultipartFile file)
            throws Exception {

        boolean userEmailExists;
        User existingUserProfile = signUpSvc.retrieveUserProfile(userId);
        if (existingUserProfile.getEmail().equals(email)) {
            // if user email is similar
            userEmailExists = false;
        } else {
            // if user email is different, we check whether email is duplicate
            userEmailExists = signUpSvc.checkUserExists(email);
        }
        if (userEmailExists) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder().add("message", "User email exists")
                            .build().toString());
        }

        try {
            User user = new User(username, password, email, firstname, lastname);
            user.setUserId(userId);
            InputStream is = file.getInputStream();
            boolean status = signUpSvc.editUserProfile(user, is);

            if (!status) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder().add("message", "Sign up unsuccessful.")
                                .build().toString());
            }

            emailSenderSvc.sendHtmlMail(email, "Updated user profile", """
                    Dear %s,

                    We received your request to update your profile.
                    We are glad to inform that the request was <h5>successful</h5>.

                    For enquiries, please contact: +612-3456789

                    Best Regards,
                    am.app Development Team
                    """.formatted(username));

            // GMailer gMailer = new GMailer();
            // gMailer.sendMail(email, "Updated user profile",
            // """
            // Dear %s,

            // We received your request to update your profile.
            // We are glad to inform that the request was successful, your profile has been
            // updated.

            // For enquiries, please contact: +612-3456789

            // Best Regards,
            // am.app Development Team
            // """
            // .formatted(username));

            return ResponseEntity.status(HttpStatus.CREATED).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Update user profile successful.").build()
                            .toString());

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Update user profile unsuccessful.").build()
                            .toString());
        }
    }

}
