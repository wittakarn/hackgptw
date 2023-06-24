import { OpenAI } from "langchain/llms/openai";
import { minify } from "terser";

const model = new OpenAI({maxTokens: -1});

export default async function (req, res) {
  const coding = req.body.coding || '';
  const description = req.body.description || '';

  try {
    const minifyCode = await minify(coding);
    const createCompletionRequest = generatePrompt(minifyCode.code, description);
    const answer = await model.call(createCompletionRequest);
    res.status(200).json({ result: answer });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(coding, description) {
  return `Generate unit tests in Jest to cover all cases for the following code: ${coding} | the code can do: ${description}. The outcome should be a file that contains Jest unit tests without any explanations`;
}
