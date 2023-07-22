package sg.edu.nus.iss.project.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSenderService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendMail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            System.out.println("Sender email > " + senderEmail);
            message.setFrom(senderEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            javaMailSender.send(message);
            System.out.println("Email sent to %s".formatted(toEmail));
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
