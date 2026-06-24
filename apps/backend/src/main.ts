import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as fs from 'fs';
import routes from './app/routes/routes';
import HttpException from './app/models/http-exception.model';
import { errorResponse } from './utils/response';

const app = express();

/**
 * App Configuration
 */

// Serve static files BEFORE body parsers and routes
app.use(cors());

// Primary: dist assets
app.use(express.static(__dirname + '/assets'));

// Fallback: src assets (so uploaded avatars survive dev rebuilds)
const srcAssetsDir = path.join(process.cwd(), 'apps', 'backend', 'src', 'assets');
if (fs.existsSync(srcAssetsDir)) {
  app.use(express.static(srcAssetsDir));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ status: 'API is running on /api' });
});

/* eslint-disable */
app.use(
  (
    err: Error | HttpException,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);

    if (err && err.name === 'UnauthorizedError') {
      return res
        .status(401)
        .json(
          errorResponse('Missing authorization credentials', 'UNAUTHORIZED')
        );
    }

    if (err && 'errorCode' in err) {
      const payload = err.message;
      const isPayloadObject = typeof payload === 'object' && payload !== null;
      const message = isPayloadObject
        ? payload.message ||
          (err.errorCode === 404 ? 'Resource not found' : 'Application error')
        : payload;
      const code =
        err.errorCode === 422
          ? 'VALIDATION_ERROR'
          : err.errorCode === 404
          ? 'NOT_FOUND'
          : 'APPLICATION_ERROR';

      return res
        .status(err.errorCode)
        .json(
          errorResponse(
            message,
            code,
            isPayloadObject ? payload.errors : null
          )
        );
    }

    return res
      .status(500)
      .json(errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR'));
  }
);

/**
 * Server activation
 */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`server up on port ${PORT}`);
});
