using RepairManagementApi.DTOs;

namespace RepairManagementApi.Services;

public interface IDeviceService
{
    Task<DeviceResponseDto> CreateDeviceAsync(CreateDeviceRequestDto request);
    Task<DeviceResponseDto?> GetDeviceByIdAsync(Guid deviceId);
    Task<List<DeviceListItemDto>> GetDevicesByCustomerIdAsync(Guid customerId);
    Task<DeviceResponseDto> UpdateDeviceAsync(Guid deviceId, UpdateDeviceRequestDto request);
    Task DeleteDeviceAsync(Guid deviceId);
}