package sg.edu.nus.iss.project.Security;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sg.edu.nus.iss.project.services.UserInfoUserDetailsService;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserInfoUserDetailsService userInfoUserDetailsService;

    // private Set<String> invalidatedTokens = new HashSet<>();

    private String getJwtFromRequestHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }

    // public void invalidateToken(String jwt) {
    // invalidatedTokens.add(jwt);
    // System.out.println("Adding invalidatedTokens: " + invalidatedTokens);
    // }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("Running AuthenticationFilter for request: " + request.getRequestURI());
        try {
            String jwt = getJwtFromRequestHeader(request);
            System.out.println("jwt from request header >>> " + jwt); // jwt is NULL

            // if (jwt != null && jwtService.validateToken(jwt)) {
            if (jwt != null) {
                // if (invalidatedTokens.contains(jwt)) {
                // System.out.println("Invalidated JWT token: " + jwt);
                // throw new ServletException("Invalidated JWT token");
                // } else {
                // }
                final String username = jwtService.extractUsername(jwt);

                // SecurityContextHolder.getContext().getAuthentication() == null means the user
                // is not connectewd or authenticated yet
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                }

                UserDetails userDetails = userInfoUserDetailsService.loadUserByUsername(username);
                System.out.println("userDetails retrieve from JwtAuthenticationFilter: " + userDetails);
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            System.out.println("Cannot set user authentication: %s".formatted(e.getMessage()));
        }

        filterChain.doFilter(request, response);
    }

}
