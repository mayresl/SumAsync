using MongoDB.Bson;
using MongoDB.Driver;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Linq.Expressions;
using System.Text;
using WorkerRabbitMQConsumer.Entities;

namespace WorkerRabbitMQConsumer
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly string _queue = "sumsQueue";
        private readonly string _url = "amqp://localhost";

        public Worker(ILogger<Worker> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var factory = new ConnectionFactory()
            {
                Uri = new Uri(_url)
            };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();

            channel.QueueDeclare(queue: _queue,
                                durable: true,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);
            //This tells RabbitMQ not to give more than one message to a worker at a time:
            channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += (sender, e) =>
            {

                ConsumerReceived(sender, e);
                channel.BasicAck(deliveryTag: e.DeliveryTag, multiple: false);
            };
            channel.BasicConsume(queue: _queue,
                autoAck: false, //"automatic acknowledgement mode is off so we can manually sendacknowledgment from the worker
                consumer: consumer);

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation($"{DateTimeOffset.Now} - Worker running...");
                await Task.Delay(5000, stoppingToken);
            }
        }

        private void ConsumerReceived(
            object? sender, BasicDeliverEventArgs e)
        {
            var msg = Encoding.UTF8.GetString(e.Body.ToArray()).Replace("\"", "");
            _logger.LogInformation($"{DateTimeOffset.Now} - New message: {msg}");
            ProcessMessage(msg);
        }

        private void ProcessMessage(string message)
        {
            var client = new MongoClient("mongodb://root:example@127.0.0.1:27017/");
            var database = client.GetDatabase("operationsDB");
            var sumsCollection = database.GetCollection<Sum>("sums");

            var id = new ObjectId(message);
            Expression<Func<Sum, bool>> filter = x => x.Id.Equals(id);
            var operation = sumsCollection.Find(filter).FirstOrDefault();

            if (operation != null) 
            {
                try
                {
                    operation.Result = operation.Number1 + operation.Number2;
                    operation.Status = "done";                    
                }
                catch (Exception ex)
                {
                    _logger.LogInformation($"{DateTime.Now} - Error - {ex.StackTrace}");
                    operation.Status = "error";
                }
                finally
                {
                    var result = sumsCollection.ReplaceOne(filter, operation);
                    _logger.LogInformation($"{DateTime.Now} - Result of operation {message} = {result}");
                }
            }
            else
            {
                _logger.LogInformation($"Operation {message} not found.");
            }
        }
    }
}