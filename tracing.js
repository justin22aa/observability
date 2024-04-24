const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { ExpressInstrumentation } = require('opentelemetry-instrumentation-express');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

module.exports = (serviceName) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  const jaegerExporter = new JaegerExporter({
    // Configure the host and port of the Jaeger Collector
    endpoint: 'http://localhost:14268/api/traces'
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
  // Alternatively, for production, you might want to use BatchSpanProcessor for better performance
  // provider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));

  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new MongoDBInstrumentation(),
    ],
    tracerProvider: provider,
  });

  return provider.getTracer(serviceName);
};

