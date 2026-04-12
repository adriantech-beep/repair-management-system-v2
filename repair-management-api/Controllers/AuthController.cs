using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RepairManagementApi.DTOs;
using RepairManagementApi.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace RepairManagementApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var deviceInfo = Request.Headers.UserAgent.ToString();

        var result = await _authService.LoginAsync(request, ipAddress, deviceInfo);

        if (result is null)
        {
            return Unauthorized(new
            {
                code = "AUTH_INVALID_CREDENTIALS",
                message = "Invalid email or password."
            });
        }

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponseDto>> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var deviceInfo = Request.Headers.UserAgent.ToString();

        var result = await _authService.RefreshAsync(request, ipAddress, deviceInfo);

        if (result is null)
        {
            return Unauthorized(new
            {
                code = "AUTH_INVALID_REFRESH_TOKEN",
                message = "Refresh token is invalid, expired, or already used."
            });
        }

        return Ok(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto request)
    {
        await _authService.LogoutAsync(request);

        return NoContent();
    }

    [HttpPost("users")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AuthUserDto>> CreateUser([FromBody] CreateUserRequestDto request)
    {
        var result = await _authService.CreateUserAsync(request);

        if (result is null)
        {
            return Conflict(new
            {
                code = "USER_ALREADY_EXISTS",
                message = "A user with this email already exists or invalid role."
            });
        }

        return CreatedAtAction(nameof(CreateUser), new { id = result.Id }, result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthUserDto>> Me()
    {
        var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _authService.GetUserByIdAsync(userId);
        if (user is null)
            return NotFound();

        return Ok(user);
    }
}
