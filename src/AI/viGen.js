const sharp = require("sharp");
const config = require("./config.js");
const {rateLimiter, hf} = require('../utils/rateLimiter')
 
class ImageModel {
  constructor() {
    this.hf = hf;
    this.model = config.IMAGE_MODEL_SCHNELL;
    this.cache = new Map();
  }

  async generateMultipleImages(inputText, count = 3, options = {}) {
    const promises = Array(count)
      .fill()
      .map(() => this.generateImage(inputText, options, true));
    const results = await Promise.allSettled(promises);
    return results
      .filter((result) => result.status === "fulfilled" && result.value)
      .map((result) => result.value);
  }

  async generateImage(inputText, options = {}, forceUnique = false) {
    const cacheKey = `${inputText}-${JSON.stringify(options)}`;
    if (!forceUnique && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const defaultParams = {
      num_inference_steps: 5,
      guidance_scale: 0.0,
      max_sequence_length: 256,
    };
    const params = { ...defaultParams };

    try {
      const response = await this.hf.textToImage({
        inputs: inputText,
        model: this.model,
        parameters: params,
      });

      if (response instanceof Blob) {
        const buffer = await response.arrayBuffer();
        const processedImage = await this.processImage(
          Buffer.from(buffer),
          options,
        );

        if (!forceUnique) {
          this.cache.set(cacheKey, processedImage);
        }

        return processedImage;
      }
      throw new Error("Invalid response from API");
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  async processImage(buffer, options = {}) {
    try {
      let image = sharp(buffer);
      if (options.resize) {
        image = image.resize(options.resize.width, options.resize.height, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
      if (options.format) {
        image = image.toFormat(options.format, {
          quality: options.quality || 100,
        });
      }
      if (options.metadata) {
        image.metadata(options.metadata);
      }
      return await image.toBuffer();
    } catch (error) {
      console.error("Error processing image:", error);
      return buffer;
    }
  }

  async generateImageVariation(imageBuffer, options = {}) {
    try {
      const response = await this.hf.imageToImage({
        inputs: imageBuffer,
        model: config.IMAGE_VARIATION_MODEL,
        parameters: { ...options, seed: Math.floor(Math.random() * 1000000) },
      });
      if (response instanceof Blob) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return this.processImage(buffer, options);
      }
      throw new Error("Invalid response from API");
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  handleError(error) {
    if (error.response && error.response.status === 429) {
      console.log(`Rate limit reached. Switching token...`);
      rateLimiter.switchToNextToken();
    } else {
      console.error("Error in image operation:", error);
    }
  }

  setModel(modelName) {
    this.model = modelName;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new ImageModel();
