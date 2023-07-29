
package sg.edu.nus.iss.project.models;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserPrincipal implements UserDetails {
    private String id;
    private String username;
    private String password;
    public boolean enabled;
    private boolean accountNonExpired;
    private boolean credentialsNonExpired;
    private boolean accountNonLocked;
    private List<SimpleGrantedAuthority> authorities;

    public UserPrincipal(String id, String username, String password,
            List<SimpleGrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal convertFromUserClass(User user) {
        UserPrincipal up = new UserPrincipal();
        up.setUsername(user.getUsername());
        up.setPassword(user.getPassword());
        up.setId(user.getUserId());
        List<SimpleGrantedAuthority> authorieties = new ArrayList<>();
        authorieties.add(new SimpleGrantedAuthority("ROLE_USER"));
        up.setAuthorities(authorieties);
        return up;
    }

    // @Override
    // public String getUsername() {
    // return username;
    // }

    // @Override
    // public boolean isAccountNonExpired() {
    // return true;
    // }

    // @Override
    // public boolean isAccountNonLocked() {
    // return true;
    // }

    // @Override
    // public boolean isCredentialsNonExpired() {
    // return true;
    // }

    // @Override
    // public boolean isEnabled() {
    // return true;
    // }

    // public String getId() {
    // return id;
    // }

    // @Override
    // public List<SimpleGrantedAuthority> getAuthorities() {
    // return authorities;
    // }

    // @Override
    // public String getPassword() {
    // return password;
    // }

    // @Override
    // public String toString() {
    // return "UserPrincipal [id=" + id + ", username=" + username + ", password=" +
    // password + ", authorities="
    // + authorities + "]";
    // }
}
