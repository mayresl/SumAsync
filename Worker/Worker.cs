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
        private readonly string _queue = "sums";
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
                                durable: false,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += ConsumerReceived;
            channel.BasicConsume(queue: _queue,
                autoAck: true,
                consumer: consumer);

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation($"{DateTimeOffset.Now} - Worker running...");
                await Task.Delay(5000, stoppingToken);
            }
        }

        private void ConsumerReceived(
            object sender, BasicDeliverEventArgs e)
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