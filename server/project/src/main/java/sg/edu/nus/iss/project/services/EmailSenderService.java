package sg.edu.nus.iss.project.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailSenderService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendMail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            System.out.println("Sending from simple email > " + senderEmail);
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

    public void sendHtmlMail(String toEmail, String subject, String body) {

        try {
            // Creating a Mime Message
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            System.out.println("Sending from MIME email > " + senderEmail);

            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true); // Set the second argument to true to indicate HTML content

            javaMailSender.send(message);
            System.out.println("Email sent to %s".formatted(toEmail));
        } catch (MessagingException e) {
            System.out.println(e.getMessage());
        }
    }
}
