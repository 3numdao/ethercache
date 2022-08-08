import express, { Request, Response } from 'express';
const router = express.Router();

const supportedExtensions: string[] = ['.eth', '.avax'];

router.get('/', (req: Request, res: Response) => {
  res.status(200).send(supportedExtensions);
});

export default router;
