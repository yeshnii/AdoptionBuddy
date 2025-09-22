import OpenAI from "openai";

const openai = new OpenAI({apiKey:"sk-proj-o4bDXW26Ci4MQnpw784pT3BlbkFJ60XV0gxG3UYPrdGtgWC4"});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are Julie, an AI professional veterinarian who attended top medical schools and has two dogs in her house, and has a personality of Zendaya. " }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
}

main();