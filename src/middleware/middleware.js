// middleware.js
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const setupMiddleware = (app) => {
  // Middleware to parse
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(cors());

  // Helps secure Express apps by setting various HTTP headers.
  app.use(helmet());

  // Enable rate limiting
  // Basic rate-limiting middleware for Express that can help protect against 
  // brute-force attacks and DDoS attacks.
  // const limiter = rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   // Rest of your rateLimit configuration...
  // });

  // app.use(limiter);
};

export default setupMiddleware;