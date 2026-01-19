import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MenuItemRequest {
  action: 'get_details' | 'suggest_options';
  item: {
    name: string;
    description: string;
    category: string;
    tags?: string[];
    allergens?: string[];
    ingredients?: string[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, item } = await req.json() as MenuItemRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === 'get_details') {
      systemPrompt = `You are a helpful restaurant menu assistant. Provide detailed information about dishes in a friendly, appetizing way. Be concise but informative. Always respond in valid JSON format.`;
      
      userPrompt = `Provide detailed information about this dish:
Name: ${item.name}
Description: ${item.description}
Category: ${item.category}
Tags: ${item.tags?.join(', ') || 'None'}
Known Allergens: ${item.allergens?.join(', ') || 'None specified'}
Known Ingredients: ${item.ingredients?.join(', ') || 'Not specified'}

Respond with JSON containing:
{
  "fullDescription": "A detailed, appetizing 2-3 sentence description",
  "pairingSuggestions": ["3-4 drink or side dish pairings"],
  "nutritionHighlights": "Brief nutrition info like 'High in protein, rich in iron'",
  "preparationInfo": "How the dish is typically prepared",
  "commonAllergens": ["list any common allergens this type of dish typically contains"],
  "typicalIngredients": ["list typical ingredients for this dish"]
}`;
    } else if (action === 'suggest_options') {
      systemPrompt = `You are a restaurant menu configuration assistant. Suggest customization options that restaurants commonly offer for dishes. Be practical and relevant.`;
      
      userPrompt = `Suggest customization options for this dish that a restaurant admin should configure:
Name: ${item.name}
Description: ${item.description}
Category: ${item.category}

Respond with JSON containing:
{
  "suggestedOptions": [
    {
      "name": "option_name_snake_case",
      "label": "Display Label",
      "choices": [
        {"value": "choice_value", "label": "Choice Label"}
      ],
      "required": true/false,
      "reason": "Why this option is recommended"
    }
  ]
}

Examples of options: cooking temperature for meats, spice level, size, sides, add-ons, sauces, etc.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("menu-ai error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
