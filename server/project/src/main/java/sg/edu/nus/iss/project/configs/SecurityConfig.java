package sg.edu.nus.iss.project.configs;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import sg.edu.nus.iss.project.services.UserInfoUserDetailsService;
import sg.edu.nus.iss.project.Security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserInfoUserDetailsService userInfoUserDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                // to whitelist some endpoints
                .authorizeHttpRequests(
                        auth -> auth
                                // .requestMatchers("/api/sign_up/**").permitAll()
                                // .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/**").permitAll()
                                .anyRequest()
                                .authenticated())
                // to ensure each request is authenticated
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(authenticationJWTTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userInfoUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Map<String, PasswordEncoder> encoders = new HashMap<>();
        // encoders.put("bcrypt", new BCryptPasswordEncoder());
        // DelegatingPasswordEncoder delegatingPasswordEncoder = new
        // DelegatingPasswordEncoder("bcrypt", encoders);
        // delegatingPasswordEncoder.setDefaultPasswordEncoderForMatches(new
        // BCryptPasswordEncoder());
        // return delegatingPasswordEncoder;
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter authenticationJWTTokenFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig)
            throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
