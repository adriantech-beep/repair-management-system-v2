using System.Security.Claims;

namespace RepairManagementApi.Services;

public interface IBranchContext
{
    Guid? BranchId { get; }
    bool IsAdmin { get; }
}

public class BranchContext : IBranchContext
{
    public Guid? BranchId { get; }
    public bool IsAdmin { get; }

    public BranchContext(IHttpContextAccessor httpContextAccessor)
    {
        var user = httpContextAccessor.HttpContext?.User;

        var branchClaim = user?.FindFirstValue("branch_id");
        if (Guid.TryParse(branchClaim, out var branchId))
            BranchId = branchId;

        IsAdmin = user?.IsInRole("Admin") ?? false;
    }
}

