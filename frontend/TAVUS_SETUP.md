# Tavus Video AI Setup

This document explains how to set up the Tavus Video AI component in the Curio application.

## Prerequisites

You'll need a Tavus account with:
- A valid API key
- At least one replica (video AI model)
- At least one persona

## Setup Instructions

1. Create a `.env.local` file in the `frontend` directory if it doesn't exist yet
2. Add your Tavus API key to the file:
   ```
   NEXT_PUBLIC_TAVUS_API_KEY=your-tavus-api-key
   ```
3. Replace `your-tavus-api-key` with your actual API key from the Tavus dashboard

## Component Configuration

The TavusVideoAI component requires the following props:

- `replicaId`: The ID of your Tavus replica (the video AI model)
- `personaId`: The ID of your Tavus persona
- `apiKey`: Your Tavus API key

The default configuration in `layout.tsx` uses:
```tsx
<TavusVideoAI 
  replicaId="rb17cf590e15"
  personaId="p2f43cff6aac"
  apiKey={tavusApiKey}
/>
```

If you need to use different replica or persona IDs, update them in the component props.

## Features

The TavusVideoAI component includes the following features:

1. Displays as a button on the left side of the screen
2. Expands to show the video AI interface when clicked
3. Manages Tavus conversations:
   - Fetches existing conversations
   - Creates new conversations
   - Deletes old conversations to prevent hitting the limit
4. Provides video call functionality:
   - Creates a video conversation with the Tavus AI
   - Offers a "Join Call" button to enter the video chat
   - Allows opening the conversation in a new tab
   - Provides an "End Call" button to exit the conversation

## Using the Video Chat

After clicking "Start Video Chat" to create a new conversation, you'll see a preview image with a "Join Call" button. Here's how to use it:

1. **Join the Call**: Click the "Join Call" button to embed the video call interface directly in the widget
2. **End the Call**: Click the "End Call" button to exit the conversation (the conversation remains active on the server)
3. **Open in New Tab**: Click this button to open the conversation in a new browser tab (useful for larger screens)
4. **Reset Conversations**: Click the refresh icon in the header to delete all existing conversations and create a new one

The video call interface requires camera and microphone permissions in your browser. When joining a call, your browser may prompt you to allow access to these devices.

## Troubleshooting Common Issues

### Missing API Key
If you see an error message saying "API key is not provided", make sure:
1. You've added the `NEXT_PUBLIC_TAVUS_API_KEY` to your `.env.local` file
2. You've restarted your development server after adding the environment variable
3. The API key is correctly formatted (no extra spaces)

### 400 Bad Request Errors
If you're seeing 400 Bad Request errors when creating conversations:

1. **Check your API Key**: Make sure your Tavus API key is valid and has the proper permissions
2. **Verify your Replica and Persona IDs**: Ensure the `replicaId` and `personaId` values in the component match valid IDs in your Tavus account
3. **Check API Limits**: You might have reached the maximum number of allowed conversations for your account

### Video Call Not Loading
If the video call interface doesn't load after clicking "Join Call":

1. Check that you've allowed camera and microphone permissions in your browser
2. Verify that the conversation URL is valid by trying the "Open in New Tab" option
3. Check for any console errors related to iframe embedding
4. Some browsers or network environments may block iframe embedding - try using the "Open in New Tab" option instead

### Camera/Microphone Issues
If you're having problems with your camera or microphone in the call:

1. Make sure you've allowed the necessary permissions in your browser
2. Check that no other applications are using your camera or microphone
3. Try refreshing the page or using a different browser

## API Response Structure

When creating a new conversation successfully, the Tavus API returns:

```json
{
  "conversation_id": "c123456",
  "conversation_name": "Conversation Name",
  "status": "active",
  "conversation_url": "https://tavus.daily.co/c123456",
  "replica_id": "rb17cf590e15",
  "persona_id": "p2f43cff6aac",
  "created_at": "timestamp"
}
```

The component uses the `conversation_url` to embed the video interface directly in the widget.

## Customization

To customize the appearance or behavior of the TavusVideoAI component, edit:
- `frontend/src/components/TavusVideoAI.tsx` - Component logic and structure
- Update styling in the component's JSX to match your design requirements 