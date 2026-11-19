package nl.adg.gnomewars;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class GnomeWarsApplication extends SpringBootServletInitializer {

  public static void main(String[] args) {
    SpringApplication.run(GnomeWarsApplication.class, args);
  }

  /** Entry point when the WAR is deployed into an external Tomcat instead of run with java -jar. */
  @Override
  protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
    return builder.sources(GnomeWarsApplication.class);
  }
}
