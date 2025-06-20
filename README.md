# API-GC

A modern Next.js application with Neon Database integration, ready to be deployed on Vercel.

## Features

- Next.js 14 with App Router
- TypeScript support
- Tailwind CSS for styling
- ESLint for code linting
- Neon Database integration
- Authentication system
- Real-time metrics dashboard
- Live data management for PT/ES APIs
- Ready for Vercel deployment

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Neon Database

#### Option A: Through Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com)
2. Navigate to **Settings** > **Storage**
3. Click **Create Database**
4. Choose **Neon**
5. Follow the setup wizard
6. Vercel will automatically create environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_HOST`
   - `POSTGRES_DATABASE`
   - `POSTGRES_USERNAME`
   - `POSTGRES_PASSWORD`

#### Option B: Manual Setup

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to your `.env.local` file:
   ```
   POSTGRES_URL=your_neon_connection_string
   ```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application automatically creates the following table:

```sql
CREATE TABLE live_data (
  id SERIAL PRIMARY KEY,
  language VARCHAR(2) NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  title TEXT,
  video_id TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Public APIs (No Authentication Required)
- `GET /api/live/pt` - Get Portuguese live data
- `GET /api/live/es` - Get Spanish live data
- `GET /api/test` - Test endpoint
- `GET /api/metrics` - Get server metrics

### Protected APIs (Authentication Required)
- `POST /api/live/update` - Update live data
- `GET /api/live/all` - Get all live data
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Debug APIs
- `GET /api/debug/data` - Get debug information
- `POST /api/init-db` - Initialize database

## Storage Strategy

The application uses a hybrid storage approach:

- **Development**: Files stored locally in `data/live-data.json`
- **Production**: Data stored in Neon Database with memory fallback
- **Fallback**: If database is unavailable, data is stored in memory

## Testing

### Test Locally
```bash
npm run test-vercel
```

### Test Production
```bash
npm run test-vercel https://your-app.vercel.app
```

### Load Testing
```bash
npm run load-test
```

### Metrics Testing
```bash
npm run test-metrics
```

## Authentication

Default credentials (change in `src/app/api/auth/login/route.ts`):
- Username: `admin`
- Password: `password123`

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js).

### Pre-deployment Checklist

1. ✅ Neon Database configured in Vercel
2. ✅ Environment variables set
3. ✅ Authentication credentials updated
4. ✅ Test the application locally

### Post-deployment

1. Initialize the database:
   ```bash
   curl -X POST https://your-app.vercel.app/api/init-db
   ```

2. Test the application:
   ```bash
   npm run test-vercel https://your-app.vercel.app
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | Neon database connection string | Yes (Production) |
| `POSTGRES_HOST` | Database host | Auto (Vercel) |
| `POSTGRES_DATABASE` | Database name | Auto (Vercel) |
| `POSTGRES_USERNAME` | Database username | Auto (Vercel) |
| `POSTGRES_PASSWORD` | Database password | Auto (Vercel) |

## Troubleshooting

### Database Connection Issues

1. Check if Neon Database is properly configured in Vercel
2. Verify environment variables are set
3. Test connection: `GET /api/debug/data`
4. Initialize database: `POST /api/init-db`

### Authentication Issues

1. Check credentials in `src/app/api/auth/login/route.ts`
2. Clear browser cookies
3. Try logging out and back in

### Data Not Saving

1. Check storage status: `GET /api/debug/data`
2. Verify database connection
3. Check logs for errors

### Database Updates Not Working in Production

**Problem**: Data updates are not being saved to Neon Database in production.

**Solution**:

1. **Check Environment Variables**:
   - Ensure `POSTGRES_URL` is set in Vercel Dashboard
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Add `POSTGRES_URL` with your Neon connection string

2. **Verify Database Connection**:
   - Use the "🧪 Testar Atualização no Banco" button in the UI
   - Check `/api/debug/data` endpoint
   - Look for "Database" storage type in the UI

3. **Initialize Database**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/init-db
   ```

4. **Check Neon Console**:
   - Verify your Neon project is active
   - Check connection string format
   - Ensure database is accessible

5. **Common Issues**:
   - Missing `POSTGRES_URL` environment variable
   - Incorrect connection string format
   - Neon project suspended or inactive
   - Network connectivity issues

**Debug Steps**:
1. Deploy with the latest code (includes enhanced logging)
2. Check Vercel function logs for database connection errors
3. Use the debug endpoints to verify database status
4. Test with the built-in database test button

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 