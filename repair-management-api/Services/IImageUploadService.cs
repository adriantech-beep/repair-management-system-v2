using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace RepairManagementApi.Services;

public class ImageUploadResult
{
    public bool IsSuccess { get; set; }
    public string? SecureUrl { get; set; }
    public string? PublicId { get; set; }
    public string? ErrorMessage { get; set; }
}

public interface IImageUploadService
{
    Task<ImageUploadResult> UploadImageAsync(IFormFile file, string folder);
}
