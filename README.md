# Full-Stack React + Express + MySQL Application

A modern full-stack web application built with React (frontend), Express (backend), and MySQL (database), fully containerized with Docker and ready for CI/CD deployment.

## Features

- **Frontend**: React single-page application with Vite build tool
- **Backend**: Express RESTful API server
- **Database**: MySQL 8.0 for data persistence
- **Docker**: Fully containerized application with Docker Compose
- **CI/CD**: GitHub Actions pipeline for automated testing and deployment

## Project Structure

```
.
├── backend/              # Express API server
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── Dockerfile       # Backend container configuration
├── frontend/            # React application
│   ├── src/             # React source files
│   ├── public/          # Static assets
│   ├── package.json     # Frontend dependencies
│   ├── Dockerfile       # Frontend container configuration
│   └── nginx.conf       # Nginx configuration for production
├── docker-compose.yml   # Docker orchestration
└── .github/workflows/   # CI/CD pipeline
```

## Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- MySQL 8.0+ (for local development without Docker)

## Getting Started

### Local Development (without Docker)

1. **Start MySQL database**
   ```bash
   # Install and start MySQL 8.0
   # Create a database named 'myapp'
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials
   
   npm run dev
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Docker Development

1. **Configure environment variables (recommended for production)**
   ```bash
   # Copy the example env file
   cp .env.example .env
   # Edit .env and set a secure database password
   ```

2. **Build and start all services**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MySQL: localhost:3306

4. **Stop all services**
   ```bash
   docker compose down
   ```

5. **Stop and remove volumes (clean slate)**
   ```bash
   docker compose down -v
   ```

## API Endpoints

### Items Resource

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get a single item
- `POST /api/items` - Create a new item
  ```json
  {
    "name": "Item name",
    "description": "Item description"
  }
  ```
- `PUT /api/items/:id` - Update an item
  ```json
  {
    "name": "Updated name",
    "description": "Updated description"
  }
  ```
- `DELETE /api/items/:id` - Delete an item

### Health Check

- `GET /health` - Check API and database status

## Environment Variables

### Backend (.env)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=myapp
```

### Frontend

- `VITE_API_URL` - API base URL (default: http://localhost:5000)

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **On Pull Request / Push to main/develop:**
   - Installs dependencies
   - Builds frontend
   - Runs tests
   - Validates code quality

2. **On Push to main:**
   - Builds Docker images
   - Tests Docker Compose setup
   - Caches build artifacts

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Building for Production

### Using Docker

```bash
docker-compose up --build
```

### Manual Build

```bash
# Build frontend
cd frontend
npm run build

# Build creates optimized static files in dist/
```

## Security Considerations

⚠️ **Important**: The default configuration uses weak passwords for demonstration purposes.

**For Production Deployments:**

1. **Change Default Passwords**
   - Update `MYSQL_ROOT_PASSWORD` in `.env` file
   - Use strong, unique passwords (minimum 16 characters)
   - Never commit `.env` files to version control

2. **Environment Variables**
   - Store sensitive data in environment variables or secrets management systems
   - Use Docker secrets or Kubernetes secrets for production
   - The provided `.env.example` file shows the required variables

3. **Network Security**
   - Expose only necessary ports (frontend port 80/443)
   - Keep database and backend on internal Docker network
   - Use SSL/TLS certificates for HTTPS in production

4. **Database Security**
   - Use least-privilege database users instead of root
   - Enable MySQL security features
   - Regular backups and updates

## Troubleshooting

### Database Connection Issues

- Ensure MySQL is running and accessible
- Check database credentials in .env file
- Verify network connectivity between containers

### Port Conflicts

- Frontend: Change port in `frontend/vite.config.js`
- Backend: Change PORT in backend/.env
- MySQL: Change port mapping in docker-compose.yml

### Docker Issues

```bash
# View logs
docker-compose logs

# Restart services
docker-compose restart

# Clean rebuild
docker-compose down -v
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC
