import { OpenAI } from "langchain/llms/openai";
import { minify } from "terser";

const model = new OpenAI({
  maxTokens: -1,
  modelName: "gpt-3.5-turbo-16k",
  temperature: 0.3,
});

export default async function (req, res) {
  const coding = req.body.coding || "";
  const description = req.body.description || "";

  try {
    // const minifyCode = await minify(coding);
    const minifyCode = coding;
    const createCompletionRequest = generatePrompt(minifyCode, description);
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
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(coding, description) {
  return `
    You are a JavaScript test generator who can look through the given code and generate the following unit tests which covers all cases.
    The response should contain only Jest unit tests without explanations. You have to only explain things in comments so that the response can be copied and run by user.

    Generate unit tests in Jest to cover all cases for the following code:
    \`
    ${coding}
    \`

    (optional) code description:
    ${description ?? "-"}.
  `;
}
