import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import { stdout } from 'process';

interface ErrorStatus extends Error {
  status?: number;
}

interface ErrorBody {
  message: string;
  env?: string;
  stack?: string[];
}

import EthLookup from "./routes/eth-lookup.js";
import AvaxLookup from "./routes/avax-lookup.js";
import NotFoundError from "./models/not-found-error.js";
import path from 'path';

interface ErrorStatus extends Error {
  status?: number;
}

interface ErrorBody {
  message: string;
  env?: string;
  stack?: string[];
}

const ethLookup = new EthLookup();
const avaxLookup = new AvaxLookup();

const app = express();

app.use(logger(stdout.isTTY ? 'dev' : 'common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/lookup", lookup);

async function lookup(request: Request, response: Response) {
  const name = request.query.name as string;

  if(!name || name === "") {
    return response.status(400).send({
      message: 'Name was not provided. Name is a required query param.',
      name: 'BadRequest',
    });
  }

  const extension = path.extname(name);

  try {
    switch(extension) {
      case ".eth": {
        const lookupObject = await ethLookup.getUrl(name);
        return response.status(200).send(lookupObject);
      }
      case ".avax": {
        const lookupObject = await avaxLookup.getUrl(name);
        return response.status(200).send(lookupObject);
      }
      default: {
        return response.status(404).send({status: 404, message: `Extension not supported: ${extension}`});
      }
    }
  } catch (e) {
    if (e instanceof NotFoundError) {
      return response.status(e.code).send(e.toInformativeObject());
    }

    console.error('Unexpected error:', e);
  }
}

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
