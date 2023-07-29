package sg.edu.nus.iss.project.Security;

import java.security.Key;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import sg.edu.nus.iss.project.models.User;
import sg.edu.nus.iss.project.models.UserPrincipal;
import sg.edu.nus.iss.project.repositories.LoginRepository;

@Service
public class JwtService {

    @Value("${jwt.secret.key}")
    private String secretKey;

    @Value("${jwt.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Autowired
    private LoginRepository loginRepo;

    SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    public String extractUsername(String token) {
        // subject should be the username or email of user
        String username = extractClaim(token, Claims::getSubject);
        System.out.println("Username extracted from JwtService : " + username);
        return username;
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Key getSignInKey() {
        byte[] keyByte = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyByte);
    }

    // Generate token without extracting claims
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractTokenExpiration(token).before(new Date());
    }

    private Date extractTokenExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // NOTE
    // public String generateToken(Authentication authentication) {
    // UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
    // System.out.println("userprincipal: " + userPrincipal);
    // System.out.println("userprincipal username: " + userPrincipal.getUsername());

    // Date now = new Date();
    // Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

    // return Jwts.builder()
    // .setSubject(userPrincipal.getUsername())
    // .setIssuedAt(new Date())
    // .setExpiration(expiryDate)
    // .signWith(key)
    // .compact();
    // }

    // public boolean validateToken(String token) {
    // try {
    // Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    // return true;
    // } catch (SignatureException ex) {
    // System.out.println("Invalid JWT signature");
    // } catch (MalformedJwtException ex) {
    // System.out.println("Invalid JWT token");
    // } catch (ExpiredJwtException ex) {
    // System.out.println("Expired JWT token");
    // } catch (UnsupportedJwtException ex) {
    // System.out.println("Unsupported JWT token");
    // } catch (IllegalArgumentException ex) {
    // System.out.println("JWT claims string is empty");
    // }
    // return false;
    // }

    // public String getJWTFromCookies(HttpServletRequest request) {
    // Cookie[] cookies = request.getCookies();
    // String jwt = "";
    // if (cookies != null) {
    // Cookie jwtCookie = Arrays.stream(cookies)
    // .filter(cookie -> "jwt".equals(cookie.getName()))
    // .findFirst()
    // .orElse(null);

    // if (jwtCookie != null) {
    // jwt = jwtCookie.getValue();
    // }
    // return jwt;
    // } else {
    // return null;
    // }
    // }

    // public String getUsernameFromJWT(String token) {
    // Claims claims = Jwts.parserBuilder()
    // .setSigningKey(key)
    // .build()
    // .parseClaimsJws(token)
    // .getBody();

    // return claims.getSubject();
    // }

    // public Optional<User> getUserFromRequest(HttpServletRequest request) {
    // String jwt = getJWTFromCookies(request);
    // if (jwt == null) {
    // return Optional.empty();
    // } else {
    // System.out.println("jwt received: " + jwt);
    // System.out.println("username to test: " + getUsernameFromJWT(jwt));
    // String username = getUsernameFromJWT(jwt);
    // System.out.println("username from JWT: " + username);
    // return loginRepo.findUserByUsername(username);
    // }
    // }
}
