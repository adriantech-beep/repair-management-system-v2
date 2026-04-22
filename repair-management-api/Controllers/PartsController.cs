using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RepairManagementApi.DTOs;
using RepairManagementApi.Services;

namespace RepairManagementApi.Controllers;


[ApiController]
[Authorize]
[Route("api/parts")]
public class PartsController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public PartsController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PartResponseDto>> CreatePart([FromBody] CreatePartRequestDto request)
    {
        try
        {
            var created = await _inventoryService.CreatePartAsync(request);
            return CreatedAtAction(nameof(GetPartById), new { partId = created.Id }, created);
        }
        catch (InvalidOperationException ex) when (ex.Message == "DUPLICATE_PART_NUMBER")
        {
            return Conflict(new
            {
                code = "DUPLICATE_PART_NUMBER",
                message = "A part with this part number already exists."
            });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<ActionResult<List<PartResponseDto>>> GetParts(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] bool inStockOnly = false)
    {
        var parts = await _inventoryService.GetPartsAsync(search, category, inStockOnly);
        return Ok(parts);
    }

    [HttpGet("{partId:guid}")]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<ActionResult<PartResponseDto>> GetPartById(Guid partId)
    {
        var part = await _inventoryService.GetPartByIdAsync(partId);
        if (part is null)
            return NotFound();

        return Ok(part);
    }

    [HttpPut("{partId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PartResponseDto>> UpdatePart(Guid partId, [FromBody] UpdatePartRequestDto request)
    {
        try
        {
            var updated = await _inventoryService.UpdatePartAsync(partId, request);
            if (updated is null)
                return NotFound();

            return Ok(updated);
        }
        catch (InvalidOperationException ex) when (ex.Message == "DUPLICATE_PART_NUMBER")
        {
            return Conflict(new
            {
                code = "DUPLICATE_PART_NUMBER",
                message = "A part with this part number already exists."
            });
        }
    }

    [HttpPost("{partId:guid}/compatibilities")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CompatibilityResponseDto>> AddCompatibility(
        Guid partId,
        [FromBody] AddCompatibilityRequestDto request)
    {
        try
        {
            var compatibility = await _inventoryService.AddCompatibilityAsync(partId, request);
            if (compatibility is null)
                return NotFound();

            return StatusCode(StatusCodes.Status201Created, compatibility);
        }
        catch (InvalidOperationException ex) when (ex.Message == "DUPLICATE_COMPATIBILITY")
        {
            return Conflict(new
            {
                code = "DUPLICATE_COMPATIBILITY",
                message = "This compatibility already exists for the selected part."
            });
        }
    }

    [HttpDelete("{partId:guid}/compatibilities/{compatibilityId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveCompatibility(Guid partId, Guid compatibilityId)
    {
        var removed = await _inventoryService.RemoveCompatibilityAsync(partId, compatibilityId);
        if (!removed)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{partId:guid}/stock")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PartResponseDto>> UpdateStock(Guid partId, [FromBody] UpdateStockRequestDto request)
    {
        var updated = await _inventoryService.UpdateStockAsync(partId, request);
        if (updated is null)
            return NotFound();

        return Ok(updated);
    }
}