// Fallback data interface
export interface FallbackData {
  textToSpeech: {
    malayalam: string[]
    english: string[]
  }
  contentSuggestions: {
    malayalam: string[]
    english: string[]
  }
  projectAnalysis: string[]
}

// Fallback data implementation
export const fallbackData: FallbackData = {
  textToSpeech: {
    malayalam: [
      "ഓഡിയോ ജനറേഷൻ താൽക്കാലികമായി ലഭ്യമല്ല",
      "വോയ്‌സ് സിന്തസിസ് സേവനം പുനഃസ്ഥാപിക്കുന്നു",
      "ദയവായി കുറച്ച് സമയത്തിന് ശേഷം വീണ്ടും ശ്രമിക്കൂ"
    ],
    english: [
      "Audio generation temporarily unavailable",
      "Voice synthesis service is being restored", 
      "Please try again in a few moments"
    ]
  },
  contentSuggestions: {
    malayalam: [
      "വ്യക്തമായ ഉച്ചാരണത്തിനായി വാക്കുകൾ സാവധാനം പറയൂ",
      "പ്രധാന പോയിന്റുകൾ ഊന്നിപ്പറയുക",
      "സംഭാഷണത്തിൽ സ്വാഭാവിക വിരാമങ്ങൾ ചേർക്കൂ"
    ],
    english: [
      "Speak slowly and clearly for better pronunciation",
      "Emphasize key points in your content",
      "Add natural pauses for better flow"
    ]
  },
  projectAnalysis: [
    "Your project shows good potential. Consider adding more engaging visuals to enhance viewer experience.",
    "The content structure is solid. You might benefit from varying the pace and adding emphasis on key points.",
    "Great start! Adding background music or sound effects could make your video more compelling."
  ]
}