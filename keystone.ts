import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';

const databaseUrl =
  process.env.DATABASE_URL || 'mongodb:localhost/keystone-sick-fits-tutorial';

// to allow users get authenticated and login from the client side
// we need a session configuration , to be able to define how long a user is signed in

const sessionConfig = {
  // defines how long a user stays signed in
  maxAge: 60 * 60 * 24 * 360,

  // a secret that would be signed it will be jwt token , make sure no one has access
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
});

// holds a lot of boilerplate
export default withAuth(
  config({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseUrl,
      // Add seeding data here
      async onConnect(keystone) {
        console.log('connected to db');
        if (process.argv.includes('--seed-data'))
          await insertSeedData(keystone);
      },
    },
    lists: createSchema({
      // schema items goes here
      User,
      Product,
      ProductImage,
    }),
    ui: {
      // show ui only for users who pass this test
      isAccessAllowed: ({ session }) =>
        // console.log(session);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        !!session?.data,
    },
    // add session values here
    session: withItemData(statelessSessions(sessionConfig), {
      // graphql query
      // everytime a request comes the data for the user gets passed along
      User: 'id',
    }),
  })
);
