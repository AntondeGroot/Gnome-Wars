package nl.adg.gnomewars.health;

import nl.adg.gnomewars.generated.api.HealthApiDelegate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

/** Liveness probe: lets the deploy script wait until the app is up inside Tomcat. */
@Service
public class HealthApiDelegateImpl implements HealthApiDelegate {

  @Override
  public ResponseEntity<Void> getHealth() {
    return ResponseEntity.ok().build();
  }
}
