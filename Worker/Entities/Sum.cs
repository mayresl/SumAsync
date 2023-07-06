using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WorkerRabbitMQConsumer.Entities
{
    internal class Sum
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("number1")]
        [BsonRequired()]
        public int Number1 { get; set; }

        [BsonElement("number2")]
        [BsonRequired()]
        public int Number2 { get; set; }

        [BsonElement("status")]
        [BsonRequired()]
        public string? Status { get; set; }

        [BsonElement("result")]
        public int? Result { get; set; }
    }
}
