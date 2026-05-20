import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import routes from './app/routes/routes';
import HttpException from './app/models/http-exception.model';
import { errorResponse } from './utils/response';

const app = express();

/**
 * App Configuration
 */

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

// Serves images
app.use(express.static(__dirname + '/assets'));

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
      return res
        .status(err.errorCode)
        .json(errorResponse(err.message, 'APPLICATION_ERROR'));
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
