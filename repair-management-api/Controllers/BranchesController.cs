using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepairManagementApi.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RepairManagementApi.Controllers;

[ApiController]
[Authorize]
[Route("api/branches")]
public class BranchesController : ControllerBase
{
    private readonly AppDbContext _db;

    public BranchesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<BranchDto>>> GetBranches()
    {
        // Query database context (automatic tenant query filter applies)
        var branches = await _db.Branches
            .AsNoTracking()
            .Select(b => new BranchDto
            {
                Id = b.Id,
                Code = b.Code,
                Name = b.Name
            })
            .ToListAsync();

        return Ok(branches);
    }
}

public class BranchDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
