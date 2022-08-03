import createError from "http-errors";
import express, { Request, Response, NextFunction } from 'express';
import path from "path";
import logger from "morgan";

// import ethLookup from "./routes/eth-lookup";
import {stdout} from "process";

import EthLookup from "./routes/eth-lookup";
import AvaxLookup from "./routes/avax-lookup";
import NotFoundError from "./models/not-found-error";

const ethLookup = new EthLookup();
const avaxLookup = new AvaxLookup();

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger(stdout.isTTY ? 'dev' : 'common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use("/lookup", lookup);

async function lookup(request: Request, response: Response) {
  const name = request.query.name as string;

  if(!name || name === "") {
    return response.status(400).send({
      message: 'Name was not provided. Name is a required query param.',
      name: 'BadRequest',
    });
  }

  const indexOfExtension = name.indexOf(".");
  const extension = name.substring(indexOfExtension + 1);

  try {
    switch(extension) {
      case "eth": {
        const lookupObject = await ethLookup.getUrl(name);
        response.setHeader("Content-Type", "application/json");
        return response.status(200).send(lookupObject);
      }
      case "avax": {
        const lookupObject = await avaxLookup.getUrl(name);
        response.setHeader("Content-Type", "application/json");
        return response.status(200).send(lookupObject);
      }
      default: {
        return response.status(404).send({status: 404, message: "Could not find path for the given extension"});
      }
    }
  } catch (e) {
    if (e instanceof NotFoundError) {
      return response.status(e.code).send(e.toInformativeObject());
    }

    console.error('Unexpected error:', e);
  }

  //     if (name && name !== '') {
//       const lookupObject = await getUrl(name);
//       response.setHeader('Content-Type', 'application/json');
//       return response.status(200).send(lookupObject);
//     }

//     return response.status(400).send({
//       message: 'Name was not provided. Name is a required query param.',
//       name: 'BadRequest',
//     });
//   } catch (e) {
//     if (e instanceof NotFoundError) {
//       return response.status(e.code).send(e.toInformativeObject());
//     }

//     console.error('Unexpected error:', e);
//   }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(500);
  res.send();
});

export default app;
