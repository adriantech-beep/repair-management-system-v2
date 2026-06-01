using System.Threading.Tasks;
using RepairManagementApi.DTOs;

namespace RepairManagementApi.Services;

public interface IImeiLookupService
{
    Task<ImeiLookupResponseDto?> LookupImeiAsync(string imei);
}
