using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;

namespace RepairManagementApi.Services;

public interface IRepairJobService
{
    Task<RepairJobResponseDto> CreateRepairJobAsync(CreateRepairJobRequestDto request);
    Task<RepairJobResponseDto?> GetRepairJobByIdAsync(Guid repairJobId);
    Task<List<RepairJobListItemDto>> GetRepairJobsByBranchAsync(Guid branchId, RepairJobStatus? status = null);
    Task<RepairJobResponseDto> UpdateRepairJobAsync(Guid repairJobId, UpdateRepairJobRequestDto request);
    Task<RepairJobResponseDto> UpdateRepairJobStatusAsync(Guid repairJobId, UpdateRepairJobStatusRequestDto request);
}