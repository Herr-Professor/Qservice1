# QMining TON MiniApp

A Telegram Mini App for mining TON coins and managing escrow transactions.

## Features

- Mining simulation for earning points
- Escrow system for secure TON transfers
- Referral system for earning bonuses
- TON wallet integration
- Shop to buy upgrades

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The app will be available at http://localhost:3000

## Production Deployment

### Setup for render.com

This application is configured to run on [render.com](https://render.com) as a Web Service (not a static site).

1. Make sure your repository includes:
   - `server.js` - Express server for production
   - `.env.production` - Environment variables for production
   - `render.yaml` - Configuration for render.com deployment

2. Connect your GitHub repository to render.com

3. Deploy with the following settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Node Version: 18.x or higher

### Telegram Mini App Configuration

1. Create a bot using [@BotFather](https://t.me/BotFather) on Telegram
2. Use `/newapp` command to create a Mini App for your bot
3. Set the Web App URL to your render.com deployment URL
4. Configure bot settings properly for inline mode if needed

## Troubleshooting Telegram WebApp Issues

### "Failed to initialize app" Error

This error typically occurs when:

1. **WebApp Script Loading**: Ensure the Telegram WebApp script is loaded properly:
   ```html
   <script src="https://telegram.org/js/telegram-web-app.js"></script>
   ```

2. **CORS Issues**: Ensure your server has proper CORS headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization
   ```

3. **Telegram Launch Context**: The app must be launched within Telegram to receive the necessary `initData`.

4. **X-Frame-Options**: Ensure appropriate X-Frame-Options header:
   ```
   X-Frame-Options: ALLOW-FROM https://web.telegram.org
   ```

5. **Debug Mode**: Add `?tgWebAppDebug=1` parameter to the URL when testing in Telegram.

6. **Check Console Logs**: The app includes comprehensive logging to help diagnose issues.

### Advanced Telegram WebApp Debugging

1. **Debug Page**: Access the built-in debug page at `/debug` to see detailed information about the Telegram WebApp environment.

2. **URL Debug Parameter**: Add `?tgWebAppDebug=1` to your app's URL to enable the floating debug panel, which shows real-time Telegram WebApp information.

3. **Keyboard Button Launch**: When launching from a keyboard button or inline mode (not from a direct link), note that the `initData` may be empty. In this case, the app uses the user information from `initDataUnsafe` for authentication.

4. **Bot Settings Check**: Verify in BotFather that:
   - Inline mode is enabled (if launching from inline queries)
   - Menu button is properly configured (if launching from bot menu)
   - Domain is allowed in the bot settings

5. **initData Structure**: For debugging, know that the initData contains:
   - `query_id`: Unique ID for the query
   - `user`: Telegram user data
   - `auth_date`: Authentication timestamp
   - `hash`: Hash signature for validation

6. **Common Errors**:
   - "Telegram WebApp is not available" - Not launching from Telegram
   - "Missing Telegram authentication" - initData not provided or invalid
   - "WebApp.ready() failed" - Error in WebApp initialization

7. **Testing in Development**: Use the mock Telegram login functionality in development to simulate Telegram data.

### "Can't set headers after they are sent" Error

This server error occurs when:

1. The server tries to send multiple responses to a single request
2. Express routes are not properly configured for SPA routing
3. Middleware is not correctly handling response headers

The provided `server.js` file has been configured to avoid these issues by:
- Checking `res.headersSent` before sending responses
- Properly configuring static file serving and SPA fallback routes
- Adding error handling middleware

## API Integration

The app interacts with a backend API at `https://qserver-ii0a.onrender.com/api`. Endpoints include:

- `/api/auth/check_and_create_user` - Login or create users
- `/api/auth/get_referrals` - Get referral information
- `/api/game/...` - Mining-related endpoints
- `/api/escrow/...` - Escrow transaction endpoints
- `/api/shop/...` - Shop and inventory endpoints

## Technologies Used

- React.js
- Express.js (production server)
- Webpack
- Telegram Mini App API
- TON Connect (for wallet integration)
- Render.com (hosting)

## License

[MIT](LICENSE)
