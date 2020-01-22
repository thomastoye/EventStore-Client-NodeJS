import {AnyStreamRevision, ConnectionSettings, EventData, EventStoreConnection} from '../index';
import {Containers} from "./containers";
import {StartedTestContainer} from "testcontainers/dist/test-container";

let uuid = require('uuid/v1');

let container: StartedTestContainer;

beforeEach(async  function() {
    this.timeout(10000);
    container = await Containers.emptyDatabase();
});

afterEach(async function() {
    await container.stop()
});

describe('append_to_stream', async function () {
    it('should successfully append events to stream', async function () {
        await new Promise(r => setTimeout(r, 10000));
        let containerAddress = container.getContainerIpAddress() + ':' + container.getMappedPort(2113);
        console.log('container address: ' + containerAddress);
        
        // Connect to client
        let connectionSettings = new ConnectionSettings("/Users/mat-mcloughlin/git/eventStore/src/dev-ca/server1.pem");
        let client = new EventStoreConnection(containerAddress, 'admin', 'changeit', connectionSettings);

        // Generate event data
        let eventData = new Array<EventData>();

        // Encode JSO
        const encoder = new TextEncoder();  
        let data = encoder.encode('{"Id": "1"}');

        let eventId = uuid();

        let eventDataOne = new EventData(eventId, "type", data);
        eventData.push(eventDataOne);

        // Send request to append
        await client.appendToStream("SomeStream", AnyStreamRevision.Any, eventData);
    });

    // it('should append stream with revision', () => {
    // });
    //
    // it('should not append to stream when already exists', () => {
    // });
    //
    // it('should not append to stream when stream doesnt exist', () => {
    // });
});
        