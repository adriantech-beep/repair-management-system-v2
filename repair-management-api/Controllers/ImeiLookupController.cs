using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RepairManagementApi.DTOs;
using RepairManagementApi.Services;

namespace RepairManagementApi.Controllers;

[ApiController]
[Route("api/devices/imei-lookup")]
[Authorize(Roles = "Admin,Technician")]
public class ImeiLookupController : ControllerBase
{
    private readonly IImeiLookupService _imeiLookupService;

    public ImeiLookupController(IImeiLookupService imeiLookupService)
    {
        _imeiLookupService = imeiLookupService;
    }

    [HttpGet("{imei}")]
    [ProducesResponseType(typeof(ImeiLookupResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<ImeiLookupResponseDto>> LookupImei(string imei)
    {
        var result = await _imeiLookupService.LookupImeiAsync(imei);
        
        if (result is null)
        {
            return NotFound(new
            {
                code = "IMEI_NOT_FOUND",
                message = "The specified IMEI or serial number was not recognized in the registry."
            });
        }

        return Ok(result);
    }
}
