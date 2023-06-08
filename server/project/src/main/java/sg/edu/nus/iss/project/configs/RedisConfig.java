package sg.edu.nus.iss.project.configs;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisClientConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private Optional<Integer> redisPort;

    @Value("${spring.data.redis.username}")
    private String redisUser;

    @Value("${spring.data.redis.password}")
    private String redisPassword;

    @Bean("user_portfolio")
    @Scope("singleton")
    public RedisTemplate<String, String> redisTemplate() {
        final RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort.get());

        if (!redisUser.isEmpty() && !redisPassword.isEmpty()) {
            config.setUsername(redisUser);
            config.setPassword(redisPassword);
        }
        config.setDatabase(0);

        final JedisClientConfiguration jedisClient = JedisClientConfiguration.builder().build();

        final JedisConnectionFactory jedisFac = new JedisConnectionFactory(config, jedisClient);
        jedisFac.afterPropertiesSet();

        RedisTemplate<String, String> r = new RedisTemplate<>();
        r.setConnectionFactory(jedisFac);
        r.setKeySerializer(new StringRedisSerializer());
        r.setHashKeySerializer(new StringRedisSerializer());
        // if <String,String>
        r.setValueSerializer(new StringRedisSerializer());
        r.setHashValueSerializer(new StringRedisSerializer());

        System.out.println("Redishost >>> " + redisHost);
        return r;
    }

}
