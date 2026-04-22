using Microsoft.Extensions.Logging;
using RepairManagementApi.Models;

namespace RepairManagementApi.Services;

public interface INotificationService
{
    Task NotifyPartAvailableAsync(Part part, PartWaitlistRequest waitlistRequest);
}

public class LoggingNotificationService : INotificationService
{
    private readonly ILogger<LoggingNotificationService> _logger;

    public LoggingNotificationService(ILogger<LoggingNotificationService> logger)
    {
        _logger = logger;
    }

    public Task NotifyPartAvailableAsync(Part part, PartWaitlistRequest waitlistRequest)
    {
        _logger.LogInformation(
            "WAITLIST_NOTIFY PartId={PartId} PartNumber={PartNumber} CustomerName={CustomerName} Email={Email} Phone={Phone} Preferred={Preferred}",
            part.Id,
            part.PartNumber,
            waitlistRequest.CustomerName,
            waitlistRequest.CustomerEmail,
            waitlistRequest.CustomerPhone,
            waitlistRequest.PreferredContactMethod.ToString());

        return Task.CompletedTask;
    }
}