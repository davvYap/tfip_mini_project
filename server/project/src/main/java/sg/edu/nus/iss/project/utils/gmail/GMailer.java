package sg.edu.nus.iss.project.utils.gmail;

import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.util.Properties;
import java.util.Set;

import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Value;

import static javax.mail.Message.RecipientType.*;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.Message;

public class GMailer {

    private static final String TEST_EMAIL_ADDRESS = "davvyap@gmail.com";
    private static final String TEST_RECEIVE_EMAIL_ADDRESS = "dongguyap@gmail.com";

    // @Value("${google.oauth2.json.file}")
    // private String googleOauthFileName;

    // field
    private final Gmail service;

    // constructor
    public GMailer() throws Exception {
        NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        GsonFactory jsonFactory = GsonFactory.getDefaultInstance();
        service = new Gmail.Builder(HTTP_TRANSPORT, jsonFactory, getCredentials(HTTP_TRANSPORT, jsonFactory))
                .setApplicationName("Gmail Samples")
                .build();
    }

    private Credential getCredentials(final NetHttpTransport HTTP_TRANSPORT, GsonFactory jsonFactory)
            throws IOException {
        // load client secret
        InputStream is = GMailer.class.getResourceAsStream(
                "/client_secret_993725644664-jkg33lmipdriq4sbucr9irceo1583l61.apps.googleusercontent.com.json");

        if (is == null) {
            throw new FileNotFoundException();
        }
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(jsonFactory,
                new InputStreamReader(is));

        // Build flow and trigger user authorization request
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(HTTP_TRANSPORT, jsonFactory,
                clientSecrets, Set.of(GmailScopes.GMAIL_SEND))
                .setDataStoreFactory(new FileDataStoreFactory(Paths.get("tokens").toFile()))
                .setAccessType("offline")
                .setApprovalPrompt("force")
                .build();

        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(3338).build();
        Credential credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");

        // return an authorized Credential Object
        return credential;
    }

    public void sendMail(String receiverEmail, String subject, String message) throws Exception {
        // Encode as MIME message
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(TEST_EMAIL_ADDRESS));
        email.addRecipient(TO, new InternetAddress(receiverEmail));
        email.setSubject(subject);
        email.setText(message);

        // Encode and wrap the MIME Message into gmail message
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);
        byte[] rawMessageBytes = buffer.toByteArray();
        String encodedEmail = Base64.encodeBase64URLSafeString(rawMessageBytes);
        Message msg = new Message();
        msg.setRaw(encodedEmail);

        try {
            // Create send message
            msg = service.users().messages().send("me", msg).execute();
            System.out.println("Message Id >>> " + msg.getId());
            System.out.println(msg.toPrettyString());
        } catch (GoogleJsonResponseException e) {
            // TODO: handle exception
            GoogleJsonError error = e.getDetails();
            if (error.getCode() == 403) {
                System.out.println("Unable to send message: " + e.getMessage());
            } else {
                throw e;
            }
        }
    }

    // public static void main(String[] args) throws Exception {
    // new GMailer().sendMail("A new message", """
    // Dear Reader,

    // Hello world.

    // Best Regards,
    // am.app Team
    // """);
    // }
}
