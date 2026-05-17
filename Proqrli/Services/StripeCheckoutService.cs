using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ProqrLi.Models;

namespace ProqrLi.Services
{
    public class StripeCheckoutService
    {
        private const string BaseUrl = "https://api.stripe.com/v1";
        private readonly HttpClient _http;
        private readonly IConfiguration _config;

        public StripeCheckoutService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _config = config;
        }

        public async Task<StripeCheckoutSession> CreateCheckoutSessionAsync(StripeCheckoutRequest request)
        {
            var form = new Dictionary<string, string>
            {
                ["mode"] = "payment",
                ["customer_email"] = request.CustomerEmail,
                ["success_url"] = request.SuccessUrl,
                ["cancel_url"] = request.CancelUrl,
                ["payment_method_types[0]"] = "card",
                ["line_items[0][quantity]"] = "1",
                ["line_items[0][price_data][currency]"] = request.Currency.ToLowerInvariant(),
                ["line_items[0][price_data][unit_amount]"] = request.UnitAmount.ToString(),
                ["line_items[0][price_data][product_data][name]"] = request.ProductName,
                ["line_items[0][price_data][product_data][description]"] = request.Description
            };

            foreach (var item in request.Metadata)
                form[$"metadata[{item.Key}]"] = item.Value;

            using var message = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/checkout/sessions")
            {
                Content = new FormUrlEncodedContent(form)
            };
            AddAuth(message);

            using var response = await _http.SendAsync(message);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(ReadStripeError(body, response.ReasonPhrase ?? "Stripe checkout failed."));

            using var document = JsonDocument.Parse(body);
            return ParseCheckoutSession(document.RootElement);
        }

        public async Task<StripeCheckoutSession> RetrieveCheckoutSessionAsync(string checkoutSessionId)
        {
            using var message = new HttpRequestMessage(HttpMethod.Get, $"{BaseUrl}/checkout/sessions/{checkoutSessionId}");
            AddAuth(message);

            using var response = await _http.SendAsync(message);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(ReadStripeError(body, response.ReasonPhrase ?? "Unable to verify Stripe checkout."));

            using var document = JsonDocument.Parse(body);
            return ParseCheckoutSession(document.RootElement);
        }

        private void AddAuth(HttpRequestMessage message)
        {
            var secretKey = GetSecretKey();
            message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);
        }

        private string GetSecretKey()
        {
            var key = FirstConfiguredValue(
                _config["Stripe:Secret_key"],
                _config["Stripe:SecretKey"],
                _config["Stripe:Secret"]);

            if (string.IsNullOrWhiteSpace(key))
                throw new InvalidOperationException("Stripe secret key is not configured. Set Stripe:SecretKey in appsettings or user secrets.");
            return key;
        }

        private static string? FirstConfiguredValue(params string?[] values)
        {
            return values.FirstOrDefault(value =>
                !string.IsNullOrWhiteSpace(value) &&
                !value.Contains("YOUR_", StringComparison.OrdinalIgnoreCase));
        }

        private static StripeCheckoutSession ParseCheckoutSession(JsonElement root)
        {
            var metadata = new Dictionary<string, string>();
            if (root.TryGetProperty("metadata", out var metadataElement) && metadataElement.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in metadataElement.EnumerateObject())
                    metadata[prop.Name] = prop.Value.ValueKind == JsonValueKind.String ? prop.Value.GetString() ?? "" : prop.Value.ToString();
            }

            return new StripeCheckoutSession(
                Id: root.GetProperty("id").GetString() ?? "",
                CheckoutUrl: root.TryGetProperty("url", out var url) ? url.GetString() ?? "" : "",
                Status: root.TryGetProperty("status", out var status) ? status.GetString() ?? "" : "",
                PaymentStatus: root.TryGetProperty("payment_status", out var paymentStatus) ? paymentStatus.GetString() ?? "" : "",
                Metadata: metadata);
        }

        private static string ReadStripeError(string body, string fallback)
        {
            try
            {
                using var document = JsonDocument.Parse(body);
                if (document.RootElement.TryGetProperty("error", out var error) && error.ValueKind == JsonValueKind.Object)
                {
                    if (error.TryGetProperty("message", out var message)) return message.GetString() ?? fallback;
                    if (error.TryGetProperty("code", out var code)) return code.GetString() ?? fallback;
                }
            }
            catch
            {
                // Preserve the Stripe response fallback below.
            }
            return fallback;
        }
    }
}
