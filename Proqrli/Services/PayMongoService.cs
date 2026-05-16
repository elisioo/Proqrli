using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ProqrLi.Models;

namespace ProqrLi.Services
{
    public class PayMongoService
    {
        private const string BaseUrl = "https://api.paymongo.com/v1";
        private static readonly string[] SupportedPaymentMethods = ["card", "gcash", "paymaya", "qrph"];
        private readonly HttpClient _http;
        private readonly IConfiguration _config;

        public PayMongoService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _config = config;
        }

        public async Task<PayMongoCheckoutSession> CreateCheckoutSessionAsync(PayMongoCheckoutRequest request)
        {
            var secretKey = GetSecretKey();
            var paymentMethodTypes = request.PaymentMethodTypes
                .Select(NormalizePaymentMethodType)
                .Where(method => !string.IsNullOrWhiteSpace(method))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            if (paymentMethodTypes.Length == 0)
                throw new InvalidOperationException("Select an enabled PayMongo payment method before checkout.");

            var payload = new
            {
                data = new
                {
                    attributes = new
                    {
                        billing = new
                        {
                            name = request.CustomerName,
                            email = request.CustomerEmail,
                            phone = NormalizeBillingPhone(request.CustomerPhone)
                        },
                        cancel_url = request.CancelUrl,
                        description = request.Description,
                        line_items = request.LineItems.Select(i => new
                        {
                            currency = "PHP",
                            amount = i.AmountInCentavos,
                            name = i.Name,
                            quantity = i.Quantity,
                            description = i.Description
                        }).ToArray(),
                        metadata = request.Metadata,
                        payment_method_types = paymentMethodTypes,
                        send_email_receipt = true,
                        show_description = true,
                        show_line_items = true,
                        success_url = request.SuccessUrl
                    }
                }
            };

            using var message = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/checkout_sessions")
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };
            AddAuth(message, secretKey);

            using var response = await _http.SendAsync(message);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(ReadPayMongoError(body, response.ReasonPhrase ?? "PayMongo checkout failed."));

            using var document = JsonDocument.Parse(body);
            var data = document.RootElement.GetProperty("data");
            var attributes = data.GetProperty("attributes");

            return new PayMongoCheckoutSession(
                Id: data.GetProperty("id").GetString() ?? "",
                CheckoutUrl: attributes.GetProperty("checkout_url").GetString() ?? "",
                Status: attributes.TryGetProperty("status", out var status) ? status.GetString() ?? "" : ""
            );
        }

        public async Task<IReadOnlyList<string>> RetrieveAvailablePaymentMethodsAsync()
        {
            var secretKey = GetSecretKey();
            using var message = new HttpRequestMessage(HttpMethod.Get, $"{BaseUrl}/merchants/capabilities/payment_methods");
            AddAuth(message, secretKey);

            using var response = await _http.SendAsync(message);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(ReadPayMongoError(body, response.ReasonPhrase ?? "Unable to load PayMongo payment methods."));

            using var document = JsonDocument.Parse(body);
            var methods = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            ExtractPaymentMethods(document.RootElement, methods);

            return SupportedPaymentMethods
                .Where(method => methods.Contains(method))
                .ToArray();
        }

        public async Task<PayMongoCheckoutVerification> RetrieveCheckoutSessionAsync(string checkoutSessionId)
        {
            var secretKey = GetSecretKey();
            using var message = new HttpRequestMessage(HttpMethod.Get, $"{BaseUrl}/checkout_sessions/{checkoutSessionId}");
            AddAuth(message, secretKey);

            using var response = await _http.SendAsync(message);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException(ReadPayMongoError(body, response.ReasonPhrase ?? "Unable to verify PayMongo checkout."));

            using var document = JsonDocument.Parse(body);
            var data = document.RootElement.GetProperty("data");
            var attributes = data.GetProperty("attributes");
            var metadata = new Dictionary<string, string>();

            if (attributes.TryGetProperty("metadata", out var metadataElement) && metadataElement.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in metadataElement.EnumerateObject())
                    metadata[prop.Name] = prop.Value.ValueKind == JsonValueKind.String ? prop.Value.GetString() ?? "" : prop.Value.ToString();
            }

            var payments = new List<PayMongoPaymentSummary>();
            if (attributes.TryGetProperty("payments", out var paymentsElement) && paymentsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var payment in paymentsElement.EnumerateArray())
                {
                    var paymentAttributes = payment.GetProperty("attributes");
                    var sourceType = "";
                    if (paymentAttributes.TryGetProperty("source", out var source) && source.ValueKind == JsonValueKind.Object &&
                        source.TryGetProperty("type", out var sourceTypeElement))
                    {
                        sourceType = sourceTypeElement.GetString() ?? "";
                    }

                    payments.Add(new PayMongoPaymentSummary(
                        Id: payment.GetProperty("id").GetString() ?? "",
                        Status: paymentAttributes.TryGetProperty("status", out var status) ? status.GetString() ?? "" : "",
                        Amount: paymentAttributes.TryGetProperty("amount", out var amount) ? amount.GetInt32() : 0,
                        SourceType: sourceType
                    ));
                }
            }

            return new PayMongoCheckoutVerification(
                Id: data.GetProperty("id").GetString() ?? "",
                Status: attributes.TryGetProperty("status", out var sessionStatus) ? sessionStatus.GetString() ?? "" : "",
                Metadata: metadata,
                Payments: payments
            );
        }

        private string GetSecretKey()
        {
            var key = FirstConfiguredValue(
                _config["PayMongo:Secret_key"],
                _config["PayMongo:SecretKey"],
                _config["PayMongo:Secret"]);

            if (string.IsNullOrWhiteSpace(key))
                throw new InvalidOperationException("PayMongo secret key is not configured. Set PayMongo:SecretKey in appsettings or user secrets.");
            return key;
        }

        private static string? FirstConfiguredValue(params string?[] values)
        {
            return values.FirstOrDefault(value =>
                !string.IsNullOrWhiteSpace(value) &&
                !value.Contains("YOUR_", StringComparison.OrdinalIgnoreCase));
        }

        private static void AddAuth(HttpRequestMessage message, string secretKey)
        {
            var token = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{secretKey}:"));
            message.Headers.Authorization = new AuthenticationHeaderValue("Basic", token);
        }

        private static string NormalizePaymentMethodType(string method)
        {
            var normalized = method.Trim().ToLowerInvariant();
            return normalized switch
            {
                "gcash" => "gcash",
                "maya" or "paymaya" => "paymaya",
                "qrph" or "qr_ph" or "qr-ph" => "qrph",
                _ => "card"
            };
        }

        private static string? NormalizeBillingPhone(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return null;

            var digits = new string(phone.Where(char.IsDigit).ToArray());
            if (digits.StartsWith("63", StringComparison.Ordinal) && digits.Length == 12) return $"+{digits}";
            if (digits.StartsWith("0", StringComparison.Ordinal) && digits.Length == 11) return $"+63{digits[1..]}";
            if (digits.StartsWith("9", StringComparison.Ordinal) && digits.Length == 10) return $"+63{digits}";

            return null;
        }

        private static void ExtractPaymentMethods(JsonElement element, ISet<string> methods)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.String:
                    AddPaymentMethod(element.GetString(), methods);
                    break;
                case JsonValueKind.Array:
                    foreach (var item in element.EnumerateArray())
                        ExtractPaymentMethods(item, methods);
                    break;
                case JsonValueKind.Object:
                    foreach (var prop in element.EnumerateObject())
                    {
                        if (prop.Value.ValueKind == JsonValueKind.True)
                            AddPaymentMethod(prop.Name, methods);
                        ExtractPaymentMethods(prop.Value, methods);
                    }
                    break;
            }
        }

        private static void AddPaymentMethod(string? value, ISet<string> methods)
        {
            if (string.IsNullOrWhiteSpace(value)) return;

            var normalized = value.Trim().ToLowerInvariant().Replace(" ", "_").Replace("-", "_");
            switch (normalized)
            {
                case "card":
                case "cards":
                case "credit_card":
                case "credit_cards":
                    methods.Add("card");
                    break;
                case "gcash":
                    methods.Add("gcash");
                    break;
                case "maya":
                case "paymaya":
                    methods.Add("paymaya");
                    break;
                case "qr":
                case "qrph":
                case "qr_ph":
                    methods.Add("qrph");
                    break;
            }
        }

        private static string ReadPayMongoError(string body, string fallback)
        {
            try
            {
                using var document = JsonDocument.Parse(body);
                if (document.RootElement.TryGetProperty("errors", out var errors) && errors.ValueKind == JsonValueKind.Array)
                {
                    var first = errors.EnumerateArray().FirstOrDefault();
                    if (first.ValueKind == JsonValueKind.Object)
                    {
                        if (first.TryGetProperty("detail", out var detail)) return detail.GetString() ?? fallback;
                        if (first.TryGetProperty("code", out var code)) return code.GetString() ?? fallback;
                    }
                }
            }
            catch
            {
                // Preserve the PayMongo response fallback below.
            }
            return fallback;
        }
    }
}
