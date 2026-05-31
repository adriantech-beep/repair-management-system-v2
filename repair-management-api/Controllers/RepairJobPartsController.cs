using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RepairManagementApi.DTOs;
using RepairManagementApi.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RepairManagementApi.Controllers;

[ApiController]
[Authorize]
[Route("api/repair-jobs/{jobId}/parts")]
public class RepairJobPartsController : ControllerBase
{
    private readonly IRepairJobPartService _partsService;

    public RepairJobPartsController(IRepairJobPartService partsService)
    {
        _partsService = partsService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RepairJobPartResponseDto>>> GetJobParts(Guid jobId)
    {
        try
        {
            var parts = await _partsService.GetJobPartsAsync(jobId);
            return Ok(parts);
        }
        catch (KeyNotFoundException ex) when (ex.Message == "REPAIR_JOB_NOT_FOUND")
        {
            return NotFound(new { code = "REPAIR_JOB_NOT_FOUND", message = "Repair job not found." });
        }
    }

    [HttpPost]
    public async Task<ActionResult<RepairJobPartResponseDto>> AllocatePart(Guid jobId, [FromBody] AllocatePartRequestDto request)
    {
        try
        {
            var result = await _partsService.AllocatePartAsync(jobId, request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) when (ex.Message == "REPAIR_JOB_NOT_FOUND")
        {
            return NotFound(new { code = "REPAIR_JOB_NOT_FOUND", message = "Repair job not found." });
        }
        catch (KeyNotFoundException ex) when (ex.Message == "PART_NOT_FOUND")
        {
            return NotFound(new { code = "PART_NOT_FOUND", message = "Active inventory part not found." });
        }
        catch (InvalidOperationException ex) when (ex.Message == "INSUFFICIENT_STOCK")
        {
            return BadRequest(new
            {
                code = "INSUFFICIENT_STOCK",
                message = "Insufficient inventory stock available."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal database failure during part allocation: {ex.Message}" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemovePart(Guid jobId, Guid id)
    {
        try
        {
            var succeeded = await _partsService.RemovePartAsync(jobId, id);
            if (!succeeded)
            {
                return NotFound(new { code = "ALLOCATION_NOT_FOUND", message = "Part allocation record not found." });
            }
            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "INVALID_OPERATION")
        {
            return BadRequest(new { code = "INVALID_OPERATION", message = "Allocated part does not belong to this repair job." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Internal database failure during part removal: {ex.Message}" });
        }
    }
}
