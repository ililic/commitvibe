const mockOpenAI = {
    chat: {
      completions: {
        create: jest.fn()
      }
    }
  };

  export const OpenAI = jest.fn().mockImplementation(() => mockOpenAI);
