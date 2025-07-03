# Setting Up Supabase Authentication for Curio

This guide will walk you through setting up Supabase authentication for the Curio project.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in.
2. Create a new project.
3. Give your project a name and set a secure database password.
4. Choose a region closest to your users.
5. Wait for your project to be created.

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Project Settings** (gear icon).
2. Click on **API** in the sidebar.
3. Copy the **URL** and **anon/public** key.

## 3. Configure Your Environment Variables

1. Create a `.env.local` file in the `frontend` directory of your project.
2. Add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_url` and `your_supabase_anon_key` with the values you copied from the Supabase dashboard.

## 4. Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** > **Providers**.
2. Make sure **Email** is enabled.
3. Configure the **Site URL** to match your development or production URL.
   - For local development, this might be `http://localhost:3000`.
   - For production, this would be your deployed URL.

## 5. Customize Email Templates (Optional)

1. In your Supabase dashboard, go to **Authentication** > **Email Templates**.
2. Customize the confirmation and password reset email templates to match your brand.

## 6. Testing Authentication

1. Run your Next.js application locally with `npm run dev`.
2. Try signing up with a new account.
3. Check your email for the confirmation link.
4. After confirming, try signing in with your new account.

## 7. Additional Configuration Options

### Disable Email Confirmation (Development Only)

For easier testing during development, you might want to disable email confirmation:

1. Go to **Authentication** > **Providers** > **Email**.
2. Uncheck "Enable email confirmations".

**Note:** It's recommended to keep email confirmations enabled for production.

### Add Social Providers

Supabase supports various social login providers like Google, GitHub, etc.:

1. Go to **Authentication** > **Providers**.
2. Configure the providers you want to use by following their specific instructions.
3. Update your application code to handle these providers.

## Troubleshooting

- **CORS errors**: Make sure your site URL is correctly set in the Supabase dashboard.
- **Authentication errors**: Check the browser console for specific error messages.
- **Email not arriving**: Check spam folders or verify your email settings in Supabase.

For more information, refer to the [Supabase Authentication documentation](https://supabase.com/docs/guides/auth). 