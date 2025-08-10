// prisma client wrapper
// Adjust import path if you generated prisma client to node_modules
import { PrismaClient } from '../generated/prisma'; // or '@prisma/client' if default
const prisma = new PrismaClient();
export default prisma;

