import { MongoClient } from 'mongodb';
import { HttpMethod } from './core/api';
import { Log } from './core/logging';
import { ExpressRouter } from './core/routing/express/express-router';
import { AuthenticationHelper } from './domain/auth/authentication-helper';
import { CreateDataPointHandler, LoginHandler, RegistrationHandler } from './endpoints';
import { CreateDeviceCodeHandler } from './endpoints/create-device-code/create-device-code.handler';
import { CreateDeviceHandler } from './endpoints/create-device/create-device.handler';
import { GetDataPointHandler } from './endpoints/get-data-points/get-data-points.handler';
import { GetSensorDataHandler } from './endpoints/get-sensor-data/get-sensor-data.handler';
import { LoginDeviceHandler } from './endpoints/login-device/login-device.handler';
import { DataPointInfo } from './models/data-point.info';
import { DeviceCodeInfo } from './models/device-code.info';
import { DeviceInfo } from './models/device.info';
import { UserInfo } from './models/user.info';

async function main() {
  Log.info('running server ...');

  const port = process.env.AIR_SENSE_PORT || 7325;
  const mongoUrl = process.env.AIR_SENSE_MONGO_URL || 'mongodb://localhost:27017';

  const secret = process.env.AIR_SENSE_SECRET;

  if (!secret) {
    Log.error('could not find token secret ...');
    Log.error('shutting down ...');

    return;
  }

  Log.info('connecting to database ...');
  const client = new MongoClient(mongoUrl);

  try {
    await client.connect();
  } catch (error) {
    Log.error('failed to connect to database:', error);
    Log.error('shutting down ...');

    return;
  }

  const db = client.db('air-sense');

  const userCollection = db.collection<UserInfo>('users');
  const deviceCollection = db.collection<DeviceInfo>('devices');
  const deviceCodeCollection = db.collection<DeviceCodeInfo>('deviceCodes');
  const dataCollection = db.collection<DataPointInfo>('data');

  Log.info('launching router engine ...');

  const router = new ExpressRouter();
  const authenticationHelper = new AuthenticationHelper(secret);

  router.route(HttpMethod.POST, '/api/v1/users/register', new RegistrationHandler(userCollection));
  router.route(HttpMethod.POST, '/api/v1/users/login', new LoginHandler(userCollection, authenticationHelper));

  router.route(HttpMethod.POST, '/api/v1/devices', new CreateDeviceHandler(deviceCollection, authenticationHelper));
  router.route(
    HttpMethod.POST,
    '/api/v1/devices/codes',
    new CreateDeviceCodeHandler(deviceCollection, deviceCodeCollection, authenticationHelper),
  );
  router.route(
    HttpMethod.POST,
    '/api/v1/devices/login',
    new LoginDeviceHandler(deviceCodeCollection, authenticationHelper),
  );

  router.route(HttpMethod.POST, '/api/v1/data', new CreateDataPointHandler(dataCollection, authenticationHelper));

  router.route(HttpMethod.GET, '/api/v1/sensors/avg', new GetDataPointHandler(dataCollection, authenticationHelper));
  router.route(
    HttpMethod.GET,
    '/api/v1/sensors/latest',
    new GetSensorDataHandler(dataCollection, authenticationHelper),
  );

  router.run(port, () => {
    Log.info(`server up and running on port: ${port}`);
  });
}

main().catch(console.error);
