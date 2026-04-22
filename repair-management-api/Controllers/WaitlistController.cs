using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RepairManagementApi.DTOs;
using RepairManagementApi.Enums;
using RepairManagementApi.Services;

namespace RepairManagementApi.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class WaitlistController : ControllerBase
{
	private readonly IWaitlistService _waitlistService;

	public WaitlistController(IWaitlistService waitlistService)
	{
		_waitlistService = waitlistService;
	}

	[HttpPost("parts/{partId:guid}/waitlist")]
	[Authorize(Roles = "Admin,Technician")]
	public async Task<ActionResult<WaitlistResponseDto>> CreateWaitlistRequest(
		Guid partId,
		[FromBody] CreateWaitlistRequestDto request)
	{
		try
		{
			var created = await _waitlistService.CreateWaitlistRequestAsync(partId, request);
			if (created is null)
				return NotFound();

			return StatusCode(StatusCodes.Status201Created, created);
		}
		catch (InvalidOperationException ex) when (
			ex.Message == "CONTACT_REQUIRED" ||
			ex.Message == "PREFERRED_CONTACT_MISSING")
		{
			return BadRequest(new
			{
				code = ex.Message,
				message = ex.Message == "CONTACT_REQUIRED"
					? "At least one contact method (email or phone) is required."
					: "Preferred contact method is missing from provided contact details."
			});
		}
		catch (InvalidOperationException ex) when (ex.Message == "DUPLICATE_WAITLIST_REQUEST")
		{
			return Conflict(new
			{
				code = "DUPLICATE_WAITLIST_REQUEST",
				message = "An active waitlist request already exists for this part and contact."
			});
		}
	}

	[HttpGet("parts/{partId:guid}/waitlist")]
	[Authorize(Roles = "Admin,Technician")]
	public async Task<ActionResult<List<WaitlistResponseDto>>> GetWaitlistByPart(
		Guid partId,
		[FromQuery] WaitlistStatus? status)
	{
		var result = await _waitlistService.GetWaitlistByPartAsync(partId, status);
		return Ok(result);
	}

	[HttpPatch("waitlist/{waitlistRequestId:guid}/status")]
	[Authorize(Roles = "Admin,Technician")]
	public async Task<ActionResult<WaitlistResponseDto>> UpdateWaitlistStatus(
		Guid waitlistRequestId,
		[FromBody] UpdateWaitlistStatusRequestDto request)
	{
		var updated = await _waitlistService.UpdateStatusAsync(waitlistRequestId, request);
		if (updated is null)
			return NotFound();

		return Ok(updated);
	}
}
