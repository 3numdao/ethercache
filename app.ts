import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';

import ethLookup from './routes/eth-lookup';
import { stdout } from 'process';

interface ErrorStatus extends Error {
  status?: number;
}

interface ErrorBody {
  message: string;
  env?: string;
  stack?: string[];
}

const app = express();

app.use(logger(stdout.isTTY ? 'dev' : 'common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/lookup', ethLookup);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err: ErrorStatus, req: Request, res: Response, next: NextFunction) => {
  if (err && !err.status) console.error('Unexpected error:', err);

  // set body, only providing error in development
  const body: ErrorBody = {
    message: err.message,
  };

  if (req.app.get('env') === 'development') {
    body.env = req.app.get('env');
    if (err.stack) body.stack = err.stack.split('\n');
  }

  // render the error page
  res.status(err.status || 500);
  res.send(body);
});

export default app;
