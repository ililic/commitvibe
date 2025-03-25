export class LLMProviderFactory {
    static getProvider() {
      return {
        generateCommitMessage: jest.fn()
      };
    }
  }

  export default LLMProviderFactory;
