using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RepairManagementApi.DTOs;
using RepairManagementApi.Services;

namespace RepairManagementApi.Controllers;

[ApiController]
[Route("api/devices")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;
    private readonly ICustomerService _customerService;
    private readonly IBranchContext _branchContext;

    public DevicesController(IDeviceService deviceService, ICustomerService customerService, IBranchContext branchContext)
    {
        _deviceService = deviceService;
        _customerService = customerService;
        _branchContext = branchContext;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(DeviceResponseDto), 201)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<DeviceResponseDto>> CreateDevice([FromBody] CreateDeviceRequestDto request)
    {
        // Pre-flight: verify customer exists and belongs to admin's branch
        var customer = await _customerService.GetCustomerByIdAsync(request.CustomerId);
        if (customer is null)
            return NotFound(new { code = "Customer_Not_Found" });

        if (_branchContext.BranchId.HasValue && customer.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        try
        {
            var device = await _deviceService.CreateDeviceAsync(request);
            return CreatedAtAction(nameof(GetDeviceById), new { deviceId = device.Id }, device);
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message switch
            {
                "Branch_Not_Found." => NotFound(new { code = "Branch_Not_Found" }),
                "Customer_Not_Found." => NotFound(new { code = "Customer_Not_Found" }),
                "Customer_Not_Assigned_To_Branch." => Forbid(),
                _ => BadRequest(new { code = ex.Message })
            };
        }
    }

    [HttpGet("customer/{customerId}")]
    [Authorize(Roles = "Admin,Technician")]
    [ProducesResponseType(typeof(List<DeviceListItemDto>), 200)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<List<DeviceListItemDto>>> GetDevicesByCustomerId(Guid customerId)
    {
        // Pre-flight: verify customer exists and belongs to user's branch
        var customer = await _customerService.GetCustomerByIdAsync(customerId);
        if (customer is null)
            return NotFound(new { code = "Customer_Not_Found" });

        if (_branchContext.BranchId.HasValue && customer.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        var devices = await _deviceService.GetDevicesByCustomerIdAsync(customerId);
        return Ok(devices);
    }

    [HttpGet("{deviceId}")]
    [Authorize(Roles = "Admin,Technician")]
    [ProducesResponseType(typeof(DeviceResponseDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<DeviceResponseDto>> GetDeviceById(Guid deviceId)
    {
        var device = await _deviceService.GetDeviceByIdAsync(deviceId);
        if (device is null)
            return NotFound(new { code = "Device_Not_Found" });

        if (_branchContext.BranchId.HasValue && device.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        return Ok(device);
    }

    [HttpPut("{deviceId}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(DeviceResponseDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<ActionResult<DeviceResponseDto>> UpdateDevice(Guid deviceId, [FromBody] UpdateDeviceRequestDto request)
    {
        // Pre-flight: load device and verify branch access before update
        var device = await _deviceService.GetDeviceByIdAsync(deviceId);
        if (device is null)
            return NotFound(new { code = "Device_Not_Found" });

        if (_branchContext.BranchId.HasValue && device.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        try
        {
            var updated = await _deviceService.UpdateDeviceAsync(deviceId, request);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message switch
            {
                "Device_Not_Found." => NotFound(new { code = "Device_Not_Found" }),
                _ => BadRequest(new { code = ex.Message })
            };
        }
    }

    [HttpDelete("{deviceId}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(403)]
    public async Task<IActionResult> DeleteDevice(Guid deviceId)
    {
        // Pre-flight: verify device exists and belongs to admin's branch
        var device = await _deviceService.GetDeviceByIdAsync(deviceId);
        if (device is null)
            return NotFound(new { code = "Device_Not_Found" });

        if (_branchContext.BranchId.HasValue && device.BranchId != _branchContext.BranchId.Value)
            return Forbid();

        try
        {
            await _deviceService.DeleteDeviceAsync(deviceId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return ex.Message switch
            {
                "Device_Not_Found." => NotFound(new { code = "Device_Not_Found" }),
                _ => BadRequest(new { code = ex.Message })
            };
        }
    }
}