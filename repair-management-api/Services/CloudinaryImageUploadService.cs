using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace RepairManagementApi.Services;

public class CloudinaryImageUploadService : IImageUploadService
{
    private readonly Cloudinary _cloudinary;
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    public CloudinaryImageUploadService(IConfiguration config)
    {
        var cloudName = config["Cloudinary:CloudName"];
        var apiKey = config["Cloudinary:ApiKey"];
        var apiSecret = config["Cloudinary:ApiSecret"];

        if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            throw new ArgumentException("Cloudinary configuration settings are missing from appsettings or environment variables.");
        }

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<ImageUploadResult> UploadImageAsync(IFormFile file, string folder)
    {
        // 1. Validation checks
        if (file == null || file.Length == 0)
        {
            return new ImageUploadResult { IsSuccess = false, ErrorMessage = "No file was uploaded." };
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return new ImageUploadResult { IsSuccess = false, ErrorMessage = "File size exceeds the 5MB logo limit." };
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return new ImageUploadResult { IsSuccess = false, ErrorMessage = "Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed." };
        }

        // 2. Stream-based Upload to Cloudinary
        try
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                // Resize to a maximum of 500x500 pixels (keeps bandwidth usage low) and apply auto optimization
                Transformation = new Transformation().Width(500).Height(500).Crop("limit").Quality("auto").FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                return new ImageUploadResult 
                { 
                    IsSuccess = false, 
                    ErrorMessage = uploadResult.Error.Message 
                };
            }

            return new ImageUploadResult
            {
                IsSuccess = true,
                SecureUrl = uploadResult.SecureUrl?.ToString(),
                PublicId = uploadResult.PublicId
            };
        }
        catch (Exception ex)
        {
            return new ImageUploadResult 
            { 
                IsSuccess = false, 
                ErrorMessage = $"Internal upload error: {ex.Message}" 
            };
        }
    }
}
