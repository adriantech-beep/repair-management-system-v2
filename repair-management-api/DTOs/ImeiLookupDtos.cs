


using System.ComponentModel.DataAnnotations;
using RepairManagementApi.Enums;

namespace RepairManagementApi.DTOs;

public class ImeiLookupResponseDto
{
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public DeviceType DeviceType { get; set; } = DeviceType.Mobile;
}