import { createTestNode } from "../utils";

import {
  ESDBConnection,
  EventStoreConnection,
  createContinuousProjection,
  createTransientProjection,
  getProjectionStatistics,
  CONTINUOUS,
  TRANSIENT,
  UnknownError,
} from "../..";

describe("getProjectionStatistics", () => {
  const node = createTestNode();
  let connection!: ESDBConnection;

  const basicProjection = `
  fromAll()
    .when({
      $init: function (state, ev) {
        return {};
      }
    });
  `;

  const continuousProjections = [
    "continuous-1",
    "continuous-2",
    "continuous-3",
  ];
  const transientProjections = ["transient-1", "transient-2", "transient-3"];

  beforeAll(async () => {
    await node.up();
    connection = EventStoreConnection.builder()
      .defaultCredentials({ username: "admin", password: "changeit" })
      .sslRootCertificate(node.certPath)
      .singleNodeConnection(node.uri);

    for (const name of continuousProjections) {
      await createContinuousProjection(name, basicProjection).execute(
        connection
      );
    }

    for (const name of transientProjections) {
      await createTransientProjection(name, basicProjection).execute(
        connection
      );
    }
  });

  afterAll(async () => {
    await node.down();
  });

  describe("gets Projection Statistics", () => {
    test("continuous", async () => {
      const REQUESTED_NAME = continuousProjections[2];

      const details = await getProjectionStatistics(REQUESTED_NAME).execute(
        connection
      );

      expect(details).toBeDefined();
      expect(details.mode).toBe(CONTINUOUS);
      expect(details.name).toBe(REQUESTED_NAME);
    });

    test("transient", async () => {
      const REQUESTED_NAME = transientProjections[1];
      const details = await getProjectionStatistics(REQUESTED_NAME).execute(
        connection
      );

      expect(details).toBeDefined();
      expect(details.mode).toBe(TRANSIENT);
      expect(details.name).toBe(REQUESTED_NAME);
    });

    test("non-existant", async () => {
      const REQUESTED_NAME = "some-non-existant-projection";
      await expect(
        getProjectionStatistics(REQUESTED_NAME).execute(connection)
      ).rejects.toThrowError(UnknownError); // https://github.com/EventStore/EventStore/issues/2732
    });
  });
});
