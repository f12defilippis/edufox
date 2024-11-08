import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateQuestions = async (req, res) => {
  const { text, subject } = req.body;

  if (!text || !subject) {
    return res.status(400).json({ error: 'Text and subject are required' });
  }

  try {
    const prompt = `Generate 50 multiple choice questions in Italian about "${subject}" based on this text: ${text}. 
    Only generate questions based on information present in the text.
    The response must contain ONLY a valid JSON with this exact structure:
    {
      "questions": [
        {
          "text": "question text",
          "options": ["answer1", "answer2", "answer3", "answer4"],
          "correctAnswer": 0,
          "explanation": "explanation for the correct answer"
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ 
        role: 'user', 
        content: prompt,
      }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response received from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content.trim());
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Error parsing response');
    }
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format');
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ 
      error: 'Error generating questions',
      details: error.message 
    });
  }
};