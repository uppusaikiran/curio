# Deploying to Netlify

This guide covers how to deploy the Curio project on Netlify.

## Prerequisites

1. A Netlify account
2. Git repository connected to Netlify

## Deployment Steps

### 1. Connect to Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Select the branch you want to deploy (usually `main` or `master`)

### 2. Configure Build Settings

The `netlify.toml` file in the root of the project already contains the necessary configuration, but you can verify these settings in the Netlify UI:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### 3. Environment Variables

Set up the following environment variables in the Netlify UI (Settings > Build & deploy > Environment):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_QLOO_API_KEY=your_qloo_api_key
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_key
```

Add any other environment variables your application requires.

### 4. Deploy

Once you've configured the settings, Netlify will automatically deploy your site when you push changes to the connected branch.

## Backend Deployment Options

For the backend, you have several options:

1. **Netlify Functions**: Convert your backend into Netlify serverless functions
2. **Separate Deployment**: Deploy the backend separately on a service like Heroku, Render, or Railway
3. **API Gateway**: Use Netlify's API gateway to connect to your backend deployed elsewhere

### Using Netlify Functions

If you choose to use Netlify Functions, you'll need to:

1. Create a `netlify/functions` directory in your project root
2. Move your backend API routes into individual function files
3. Update your frontend API calls to use `/.netlify/functions/` paths

## Troubleshooting

### Build Failures

If your build fails, check:
- Node.js version compatibility (set in `netlify.toml`)
- Dependencies installation issues (npm or yarn)
- Build command output for specific errors

### Routing Issues

For client-side routing issues, ensure:
- The redirects in `netlify.toml` are correctly configured
- The Next.js `redirects()` function is properly set up

### API Connection Problems

If your frontend can't connect to your backend:
- Verify environment variables are correctly set
- Check CORS settings in your backend
- Ensure API paths are correctly formed

## Resources

- [Netlify Docs for Next.js](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Next.js on Netlify](https://www.netlify.com/with/nextjs/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/) 