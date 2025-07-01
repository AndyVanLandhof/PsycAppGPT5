# Vault Integration Setup Guide

## Overview
Your app is now set up to use your vault of OCR materials as the primary reference for AI responses. The system will automatically load your JSON chunk files and use them to enhance AI prompts.

## Quick Setup (Recommended)

### 1. Copy Your Vault Files
Use the provided setup script to copy your vault to the app:

```bash
./setup_vault.sh /path/to/your/vault
```

**Example:**
```bash
./setup_vault.sh ~/Documents/MyVault
```

This will automatically:
- Create the correct folder structure in `public/vault/`
- Copy all your JSON chunk files
- Preserve the organization (Core/Additional folders)

### 2. Start the App
```bash
npm run dev
```

### 3. Test the Integration
- Open your app in the browser
- Go to any topic and use the Study Content feature
- Check the browser console for vault loading messages
- Ask questions and verify AI responses reference your materials

## Manual Setup (Alternative)

If you prefer to copy files manually:

### 1. Create the Vault Structure
The app expects this structure in `public/vault/`:

```
public/vault/
├── Christianity/
│   ├── Core/
│   │   └── your_chunks.json
│   └── Additional/
│       └── your_additional_chunks.json
├── Ethics/
│   ├── Core/
│   └── Additional/
├── Philosophy/
│   ├── Core/
│   └── Additional/
├── General/
├── Exam Board Materials/
├── Revision & Essays/
└── Notes/
```

### 2. Copy Your Files
Copy your JSON chunk files to the appropriate folders in `public/vault/`.

## JSON Chunk Format
Each JSON file should contain chunks in this format:

```json
{
  "chunks": [
    {
      "id": "unique_chunk_id",
      "content": "The actual text content from your PDF",
      "source": "filename.pdf",
      "page": 1,
      "title": "Section title if available",
      "metadata": {
        "topic": "christianity/ethics/philosophy",
        "subtopic": "specific subtopic name",
        "type": "core/additional/general/exam/revision/notes"
      }
    }
  ]
}
```

## Features Enabled

### 1. Vault-Enhanced AI Responses
- AI now prioritizes your OCR materials over general knowledge
- Responses are based on your specific textbooks and exam materials
- Includes source attribution in responses

### 2. Advanced Content Toggle
- Users can enable/disable additional academic materials
- Core materials are always included for exam accuracy
- Additional materials provide A* level insights

### 3. Smart Context Selection
- Automatically finds relevant chunks based on topic/subtopic
- Prioritizes core materials over additional ones
- Includes exam board materials and revision examples

### 4. Exam-Specific Responses
- Special handling for exam-related queries
- References past papers and exam instructions
- Provides exam-focused guidance

## Testing the Integration

1. **Check Console Logs**: Look for vault loading messages like:
   ```
   [Vault] Loading vault data...
   [Vault] Loaded Christianity/Core: 15 chunks
   [Vault] Successfully loaded vault data
   ```

2. **Test AI Responses**: Ask questions and verify they reference your materials

3. **Toggle Advanced Content**: Test the advanced content feature in Study Content

4. **Verify Source Attribution**: Check that responses mention your OCR sources

## Troubleshooting

### Vault Not Loading
- Check that files are in `public/vault/` folder
- Verify JSON format is correct
- Check browser console for errors
- Ensure development server is running

### No Relevant Context Found
- Ensure subtopic names match between your app and vault metadata
- Check that chunks contain relevant keywords
- Verify topic categorization in metadata

### AI Responses Not Using Vault
- Check that `useVault` is enabled in AI calls
- Verify topic and subtopic are being passed correctly
- Ensure vault data is loaded before making AI calls

## Performance Considerations

- Chunks are loaded once on app startup
- Only relevant chunks are included in AI prompts
- Maximum 5 chunks per prompt to avoid token limits
- Consider implementing chunk caching for large vaults

## File Organization Tips

### Core vs Additional
- **Core**: Exam-approved textbooks and revision guides
- **Additional**: Academic texts and source materials for A* content

### Metadata Best Practices
- Use consistent subtopic names that match your app's topics
- Include page numbers for easy reference
- Add meaningful titles for better searchability

## Next Steps

1. **Copy your vault files** using the setup script
2. **Test with your real data**
3. **Fine-tune chunk relevance scoring** if needed
4. **Add vault statistics display** in the UI
5. **Implement vault search functionality**

The system is designed to be efficient and accurate, ensuring that AI responses are always grounded in your specific OCR materials rather than general knowledge. 