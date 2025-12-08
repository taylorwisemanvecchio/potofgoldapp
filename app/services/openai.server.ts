import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ProductRecommendationInput {
  dogName: string;
  dogGender: string;
  dogSize: string;
  breed: string;
  toyPreference: string;
  allergies: string;
  previousFeedback?: Array<{
    productTitle: string;
    rating?: number;
    comments?: string;
  }>;
  availableProducts: Array<{
    id: string;
    title: string;
    description: string;
    tags: string[];
    productType: string;
  }>;
}

export interface ProductRecommendation {
  productId: string;
  productTitle: string;
  reasoning: string;
  confidence: number;
}

/**
 * Uses OpenAI to generate personalized product recommendations based on
 * dog preferences, feedback history, and available inventory
 */
export async function getProductRecommendations(
  input: ProductRecommendationInput
): Promise<{
  recommendations: ProductRecommendation[];
  fullResponse: string;
}> {
  const {
    dogName,
    dogGender,
    dogSize,
    breed,
    toyPreference,
    allergies,
    previousFeedback = [],
    availableProducts,
  } = input;

  // Build the prompt for OpenAI
  const systemPrompt = `You are an expert pet product curator for a premium dog toy subscription box service.
Your job is to analyze customer preferences, previous feedback, and available inventory to recommend the best products for each dog.

Consider factors like:
- Dog size and breed (some toys are better for certain sizes/energy levels)
- Toy preferences (plush, durable, mix)
- Allergies (avoid products with specific ingredients)
- Previous feedback (what they liked/disliked)
- Product variety (don't recommend too similar items)`;

  const userPrompt = `Please recommend 3-5 products for this subscription box:

DOG PROFILE:
- Name: ${dogName}
- Gender: ${dogGender}
- Size: ${dogSize}
- Breed: ${breed}
- Toy Preference: ${toyPreference}
- Allergies: ${allergies}

${
  previousFeedback.length > 0
    ? `PREVIOUS FEEDBACK:
${previousFeedback
  .map(
    (fb, i) =>
      `${i + 1}. ${fb.productTitle}
   Rating: ${fb.rating ? `${fb.rating}/5` : "Not rated"}
   Comments: ${fb.comments || "No comments"}`
  )
  .join("\n\n")}`
    : "No previous feedback available (first box)"
}

AVAILABLE PRODUCTS:
${availableProducts
  .map(
    (p, i) =>
      `${i + 1}. ID: ${p.id}
   Title: ${p.title}
   Description: ${p.description}
   Type: ${p.productType}
   Tags: ${p.tags.join(", ")}`
  )
  .join("\n\n")}

Please respond with a JSON array of 3-5 recommended products in this exact format:
[
  {
    "productId": "product_id_here",
    "productTitle": "product_title_here",
    "reasoning": "Brief explanation of why this product is a good fit",
    "confidence": 0.95
  }
]

Only return the JSON array, no additional text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "[]";

    // Parse the JSON response
    let recommendations: ProductRecommendation[] = [];
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        recommendations = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      console.error("Response text:", responseText);
      throw new Error("Failed to parse AI recommendations");
    }

    return {
      recommendations,
      fullResponse: responseText,
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate product recommendations");
  }
}

/**
 * Generate a summary of feedback for a specific dog
 */
export async function generateFeedbackSummary(
  dogName: string,
  feedbackHistory: Array<{
    productTitle: string;
    rating?: number;
    comments?: string;
    createdAt: Date;
  }>
): Promise<string> {
  const prompt = `Analyze the following product feedback for ${dogName} and provide a brief summary of their preferences and dislikes:

FEEDBACK HISTORY:
${feedbackHistory
  .map(
    (fb, i) =>
      `${i + 1}. ${fb.productTitle} (${new Date(fb.createdAt).toLocaleDateString()})
   Rating: ${fb.rating ? `${fb.rating}/5` : "Not rated"}
   Comments: ${fb.comments || "No comments"}`
  )
  .join("\n\n")}

Provide a concise summary (2-3 sentences) highlighting patterns in what ${dogName} enjoys and what to avoid.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || "No summary available";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Unable to generate summary";
  }
}
