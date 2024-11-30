const { HfInference } = require("@huggingface/inference");
require("dotenv").config();

class HuggingFaceAPIRateLimiter {
  constructor() {
    this.apiKeys = [
      process.env.HF_TOKEN_1,
    ];
    this.currentKeyIndex = 0;
    this.hf = new HfInference(this.getCurrentToken());
  }

  getCurrentToken() {
    return this.apiKeys[this.currentKeyIndex];
  }

  switchToNextToken() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this.hf = new HfInference(this.getCurrentToken());  // Reset instance with the new token
    console.log(`Switched to token: ${this.getCurrentToken()}`);
  }

  async call(apiMethod, ...args) {
    const maxRetries = this.apiKeys.length;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        return await this.hf[apiMethod](...args);
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.log(`Rate limit reached. Switching token...`);
          this.switchToNextToken();
          retries++;
        } else {
          console.error("API call error: ", error);  // Log the full error
          throw error;  // Throw the error to prevent infinite retries
        }
      }
    }

    throw new Error("All API keys exhausted. Please try again later.");
  }
}

const rateLimiter = new HuggingFaceAPIRateLimiter();
const hf = rateLimiter.hf;  // Export the current instance

module.exports = {rateLimiter,hf};