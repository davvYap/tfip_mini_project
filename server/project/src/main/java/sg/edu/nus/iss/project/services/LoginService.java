package sg.edu.nus.iss.project.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.json.Json;
import sg.edu.nus.iss.project.models.User;
import sg.edu.nus.iss.project.repositories.LoginRepository;

@Service
public class LoginService {
    @Autowired
    private LoginRepository loginRepo;

    public User verifyLogin(String username, String password) {
        return loginRepo.verifyLogin(username, password);
    }

    public ResponseEntity<String> getQuoteOfTheDay() {
        String url = UriComponentsBuilder.fromUriString("https://zenquotes.io/api/today")
                .toUriString();

        RequestEntity req = RequestEntity.get(url)
                .build();

        RestTemplate template = new RestTemplate();

        ResponseEntity<String> resp = null;

        try {
            resp = template.exchange(req, String.class);
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", e.getMessage())
                            .build().toString());
        }
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(resp.getBody());
    }
}
