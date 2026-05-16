using System.Collections.Concurrent;
using System.Threading.Channels;

namespace ProqrLi.Services
{
    public record RfqMessageEvent(string MessageId, string SenderType, string Body, string SentAt);

    public class RfqMessageBroadcaster
    {
        private readonly ConcurrentDictionary<string, ConcurrentDictionary<Guid, Channel<RfqMessageEvent>>> _subscribers = new();

        public (Guid SubscriptionId, ChannelReader<RfqMessageEvent> Reader) Subscribe(int rfqId, int vendorTenantId)
        {
            var key = GetKey(rfqId, vendorTenantId);
            var subscriptionId = Guid.NewGuid();
            var channel = Channel.CreateUnbounded<RfqMessageEvent>();

            var group = _subscribers.GetOrAdd(key, _ => new ConcurrentDictionary<Guid, Channel<RfqMessageEvent>>());
            group[subscriptionId] = channel;

            return (subscriptionId, channel.Reader);
        }

        public void Unsubscribe(int rfqId, int vendorTenantId, Guid subscriptionId)
        {
            var key = GetKey(rfqId, vendorTenantId);
            if (!_subscribers.TryGetValue(key, out var group)) return;

            if (group.TryRemove(subscriptionId, out var channel))
            {
                channel.Writer.TryComplete();
            }

            if (group.IsEmpty)
            {
                _subscribers.TryRemove(key, out _);
            }
        }

        public void Publish(int rfqId, int vendorTenantId, RfqMessageEvent message)
        {
            var key = GetKey(rfqId, vendorTenantId);
            if (!_subscribers.TryGetValue(key, out var group)) return;

            foreach (var subscriber in group.Values)
            {
                subscriber.Writer.TryWrite(message);
            }
        }

        private static string GetKey(int rfqId, int vendorTenantId) => $"{rfqId}:{vendorTenantId}";
    }
}
