using System.Collections.Generic;
using System.Threading.Tasks;
using RepairManagementApi.Enums; 
using RepairManagementApi.DTOs;

namespace RepairManagementApi.Services;

public class ImeiLookupService : IImeiLookupService
{
    // Sandbox mock database for local development and testing
    private static readonly Dictionary<string, ImeiLookupResponseDto> MockDatabase = new()
    {
        { "358900000000001", new ImeiLookupResponseDto { Brand = "Apple", Model = "iPhone 15 Pro", DeviceType = DeviceType.Mobile } },
        { "358900000000002", new ImeiLookupResponseDto { Brand = "Samsung", Model = "Galaxy S24 Ultra", DeviceType = DeviceType.Mobile } },
        { "358900000000003", new ImeiLookupResponseDto { Brand = "Google", Model = "Pixel 8 Pro", DeviceType = DeviceType.Mobile } },
        { "358900000000004", new ImeiLookupResponseDto { Brand = "Dell", Model = "XPS 13", DeviceType = DeviceType.Laptop } }
    };

    public Task<ImeiLookupResponseDto?> LookupImeiAsync(string imei)
    {
        if (string.IsNullOrWhiteSpace(imei))
        {
            return Task.FromResult<ImeiLookupResponseDto?>(null);
        }

        var cleanImei = imei.Trim();
        if (MockDatabase.TryGetValue(cleanImei, out var mockResult))
        {
            return Task.FromResult<ImeiLookupResponseDto?>(mockResult);
        }

        // Fallback: If not matched but is a valid 15-digit code, return a generic placeholder
        if (cleanImei.Length == 15 && long.TryParse(cleanImei, out _))
        {
            return Task.FromResult<ImeiLookupResponseDto?>(new ImeiLookupResponseDto
            {
                Brand = "Generic Brand",
                Model = "Unrecognized Model",
                DeviceType = DeviceType.Mobile
            });
        }

        return Task.FromResult<ImeiLookupResponseDto?>(null);
    }
}
