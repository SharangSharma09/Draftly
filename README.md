# Draftly Chrome Extension

Draftly is a Chrome extension that provides intelligent, context-aware text modification tools powered by advanced language models through an interactive, emoji-driven popup interface.

## Features

- Text transformation tools: Shorten, Elaborate, Rephrase
- Grammar correction
- Emoji addition
- Tone adjustment: Formal, Casual, Persuasive, Witty, Empathetic, Informed
- Selection-based transformation (transform only selected text)
- History tracking with undo functionality
- Multiple AI model support (OpenAI and Perplexity)

## Installation

1. Download the `draftly-extension-updated.zip` file
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top-right corner
5. Click "Load unpacked" and select the extracted extension directory

## Usage

1. Click the Draftly icon in your Chrome toolbar to open the popup
2. Enter or paste text in the input area
3. Select a transformation or tone adjustment
4. The transformed text will appear in the input area
5. Copy the result with the "COPY TEXT" button

## API Keys

To use the extension with OpenAI or Perplexity models, you'll need to provide API keys in the extension settings.

## Development

To build the extension from source:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `./build-extension.sh` to build the extension
4. The built extension will be in the `extension-build` directory

## Technologies Used

- Chrome Extension API
- TypeScript
- React
- Tailwind CSS
- OpenAI and Perplexity APIs