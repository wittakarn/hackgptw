import { OpenAI } from "langchain/llms/openai";
import { minify } from "terser";

const model = new OpenAI();

export default async function (req, res) {
  const coding = req.body.coding || '';
  const desctiption = req.body.desctiption || '';

  try {
    const minifyCode = await minify(coding);
    const createCompletionRequest = generatePrompt(minifyCode.code, desctiption);
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

function generatePrompt(coding, desctiption) {
  return `I want at least 5 unit tests in Jest for the following code: ${coding} | the code can do: ${desctiption}. No need for an explaination`;
}
