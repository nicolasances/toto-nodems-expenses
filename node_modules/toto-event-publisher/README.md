# Toto Event Publisher

This is a npm library to be used to publish to a Kafka topic.

When including this through `require()`, a new `TotoEventPublisher` instance will be automatically created and it will be possible to publish events to kafka.

**Before** publishing events, the topics need to be registered.

Typical usage:

```
var totoEventPublisher = require('./TotoEventPublisher');
totoEventPublisher.registerTopic({topicName: 'trainingSessionsCreated', microservice: 'training-session'}).then(() => {}, (err) => {console.log(err);});

// Post event
let event = {...};

totoEventPublisher.publishEvent('trainingSessionsCreated', event);

```
