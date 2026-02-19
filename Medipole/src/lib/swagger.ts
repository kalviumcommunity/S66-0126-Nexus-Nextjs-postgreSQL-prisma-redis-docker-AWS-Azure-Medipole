import { createSwaggerSpec } from 'next-swagger-doc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medipole API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Medipole blood donation platform',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://your-production-domain.com'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apiFolder: 'src/app/api', // Path to API routes
};

export const getApiDocs = () => createSwaggerSpec(swaggerOptions);