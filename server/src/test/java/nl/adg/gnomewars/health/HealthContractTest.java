package nl.adg.gnomewars.health;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

/** The running app answers GET /health the way the OpenAPI spec says it does. */
@SpringBootTest
@AutoConfigureMockMvc
class HealthContractTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void healthAnswersOkWithoutBody() throws Exception {
    mockMvc
        .perform(get("/health"))
        .andExpect(status().isOk())
        .andExpect(content().string(""));
  }
}
