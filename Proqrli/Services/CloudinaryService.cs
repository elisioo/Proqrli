using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace ProqrLi.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryService> _logger;

        public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
        {
            _logger = logger;

            var cloudName = configuration["Cloudinary:CloudName"]
                ?? throw new InvalidOperationException("Cloudinary:CloudName is not configured.");
            var apiKey = configuration["Cloudinary:ApiKey"]
                ?? throw new InvalidOperationException("Cloudinary:ApiKey is not configured.");
            var apiSecret = configuration["Cloudinary:ApiSecret"]
                ?? throw new InvalidOperationException("Cloudinary:ApiSecret is not configured.");

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        /// <summary>
        /// Uploads an image stream to Cloudinary. Returns the secure URL on success.
        /// </summary>
        public async Task<string?> UploadImageAsync(Stream fileStream, string fileName, string folder, CancellationToken ct = default)
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = folder,
                Overwrite = false,
            };

            var result = await _cloudinary.UploadAsync(uploadParams, ct);

            if (result.Error != null)
            {
                _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
                return null;
            }

            _logger.LogInformation("Uploaded image to Cloudinary: {PublicId}", result.PublicId);
            return result.SecureUrl?.ToString();
        }

        /// <summary>
        /// Deletes an image from Cloudinary by its public ID.
        /// </summary>
        public async Task<bool> DeleteImageAsync(string publicId, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(publicId))
                return false;

            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            if (result.Error != null)
            {
                _logger.LogError("Cloudinary delete failed: {Error}", result.Error.Message);
                return false;
            }

            _logger.LogInformation("Deleted image from Cloudinary: {PublicId}", publicId);
            return true;
        }

        /// <summary>
        /// Deletes an image from Cloudinary by extracting the public ID from a secure URL.
        /// </summary>
        public async Task<bool> DeleteImageByUrlAsync(string? secureUrl, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(secureUrl))
                return false;

            var publicId = ExtractPublicId(secureUrl);
            if (string.IsNullOrWhiteSpace(publicId))
                return false;

            return await DeleteImageAsync(publicId, ct);
        }

        /// <summary>
        /// Extracts the Cloudinary public ID from a secure URL.
        /// Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg -> folder/image
        /// </summary>
        public static string? ExtractPublicId(string secureUrl)
        {
            try
            {
                var uri = new Uri(secureUrl);
                var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

                // Cloudinary URL pattern: /image/upload/v{version}/{folder}/{file}.{ext}
                // We need to skip "image", "upload", and the version segment
                if (segments.Length < 4)
                    return null;

                int startIndex = 0;
                for (int i = 0; i < segments.Length; i++)
                {
                    if (segments[i] == "upload")
                    {
                        startIndex = i + 1; // skip "upload"
                        break;
                    }
                }

                if (startIndex == 0 || startIndex >= segments.Length)
                    return null;

                // Skip version segment if it starts with 'v'
                if (segments[startIndex].StartsWith('v') && segments[startIndex].Length > 1 && char.IsDigit(segments[startIndex][1]))
                    startIndex++;

                var publicIdParts = segments[startIndex..];
                var publicId = string.Join("/", publicIdParts);

                // Strip extension
                var lastDot = publicId.LastIndexOf('.');
                if (lastDot > 0)
                    publicId = publicId[..lastDot];

                return publicId;
            }
            catch
            {
                return null;
            }
        }
    }
}
