using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Services;

namespace RepairManagementApi.Controllers;

[ApiController]
[Route("api/repair-jobs")]
[Authorize]
public class RepairJobsController : ControllerBase
{
    private readonly IRepairJobService _repairJobService;
    private readonly IBranchContext _branchContext;

    public RepairJobsController(IRepairJobService repairJobService, IBranchContext branchContext)
    {
        _repairJobService = repairJobService;
        _branchContext = branchContext;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(RepairJobResponseDto), 201)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<RepairJobResponseDto>> CreateRepairJob([FromBody] CreateRepairJobRequestDto request)
    {
        if (_branchContext.BranchId.HasValue && request.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        try
        {
            var repairJob = await _repairJobService.CreateRepairJobAsync(request);
            return CreatedAtAction(nameof(GetRepairJobById), new { repairJobId = repairJob.Id }, repairJob);
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message switch
            {
                "Branch_Not_Found." => NotFound(new { code = "Branch_Not_Found" }),
                "Customer_Not_Found." => NotFound(new { code = "Customer_Not_Found" }),
                "Device_Not_Found." => NotFound(new { code = "Device_Not_Found" }),
                "Customer_Not_Assigned_To_Branch." => Forbid(),
                "Device_Not_Assigned_To_Branch." => Forbid(),
                "Device_Not_Assigned_To_Customer." => BadRequest(new { code = "Device_Not_Assigned_To_Customer" }),
                _ => BadRequest(new { code = ex.Message })
            };
        }
    }

    [HttpGet("{repairJobId}")]
    [Authorize(Roles = "Admin,Technician")]
    [ProducesResponseType(typeof(RepairJobResponseDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<RepairJobResponseDto>> GetRepairJobById(Guid repairJobId)
    {
        var repairJob = await _repairJobService.GetRepairJobByIdAsync(repairJobId);
        if (repairJob is null)
            return NotFound(new { code = "RepairJob_Not_Found" });

        if (_branchContext.BranchId.HasValue && repairJob.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        return Ok(repairJob);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Technician")]
    [ProducesResponseType(typeof(List<RepairJobListItemDto>), 200)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<List<RepairJobListItemDto>>> GetRepairJobs([FromQuery] RepairJobStatus? status = null)
    {
        if (_branchContext.BranchId is null)
            return Forbid();

        var repairJobs = await _repairJobService.GetRepairJobsByBranchAsync(_branchContext.BranchId.Value, status);
        return Ok(repairJobs);
    }

    [HttpPut("{repairJobId}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(RepairJobResponseDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<RepairJobResponseDto>> UpdateRepairJob(Guid repairJobId, [FromBody] UpdateRepairJobRequestDto request)
    {
        var existing = await _repairJobService.GetRepairJobByIdAsync(repairJobId);
        if (existing is null)
            return NotFound(new { code = "RepairJob_Not_Found" });

        if (_branchContext.BranchId.HasValue && existing.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        try
        {
            var updated = await _repairJobService.UpdateRepairJobAsync(repairJobId, request);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message switch
            {
                "RepairJob_Not_Found." => NotFound(new { code = "RepairJob_Not_Found" }),
                _ => BadRequest(new { code = ex.Message })
            };
        }
    }

    [HttpPatch("{repairJobId}/status")]
    [Authorize(Roles = "Admin,Technician")]
    [ProducesResponseType(typeof(RepairJobResponseDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<RepairJobResponseDto>> UpdateRepairJobStatus(Guid repairJobId, [FromBody] UpdateRepairJobStatusRequestDto request)
    {
        var existing = await _repairJobService.GetRepairJobByIdAsync(repairJobId);
        if (existing is null)
            return NotFound(new { code = "RepairJob_Not_Found" });

        if (_branchContext.BranchId.HasValue && existing.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        try
        {
            var updated = await _repairJobService.UpdateRepairJobStatusAsync(repairJobId, request);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message switch
            {
                "RepairJob_Not_Found." => NotFound(new { code = "RepairJob_Not_Found" }),
                _ => BadRequest(new { code = ex.Message })
            };
        }
    }
}