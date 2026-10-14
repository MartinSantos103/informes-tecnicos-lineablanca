import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleApiRequest } from '../server/router.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleApiRequest(req, res);
}
